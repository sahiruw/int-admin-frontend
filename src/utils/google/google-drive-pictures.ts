import { getGoogleServices } from "@/utils/google/google";
import sharp from "sharp";
import prisma from "@/lib/prisma";

const IMAGE_CACHE_TTL_HOURS = Number(process.env.IMAGE_CACHE_TTL_HOURS || 24);
const IMAGE_CACHE_TTL_MS = Math.max(1, IMAGE_CACHE_TTL_HOURS) * 60 * 60 * 1000;
const NOT_FOUND_SENTINEL = "__NOT_FOUND__";

type CachedImageRow = {
  picture_id: string;
  drive_file_id: string;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  expires_at: Date;
};

const getExpiryDate = () => new Date(Date.now() + IMAGE_CACHE_TTL_MS);

async function getCachedImage(pictureId: string): Promise<CachedImageRow | null> {
  const rows = await prisma.$queryRaw<CachedImageRow[]>`
    SELECT picture_id, drive_file_id, mime_type, width, height, expires_at
    FROM images
    WHERE picture_id = ${pictureId}
    LIMIT 1
  `;
  return rows[0] || null;
}

async function upsertCachedImage(data: {
  pictureId: string;
  driveFileId: string;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
}) {
  const expiresAt = getExpiryDate();

  await prisma.$executeRaw`
    INSERT INTO images (picture_id, drive_file_id, mime_type, width, height, expires_at, updated_at)
    VALUES (${data.pictureId}, ${data.driveFileId}, ${data.mimeType || null}, ${data.width || null}, ${data.height || null}, ${expiresAt}, NOW())
    ON CONFLICT (picture_id)
    DO UPDATE SET
      drive_file_id = EXCLUDED.drive_file_id,
      mime_type = EXCLUDED.mime_type,
      width = EXCLUDED.width,
      height = EXCLUDED.height,
      expires_at = EXCLUDED.expires_at,
      updated_at = NOW()
  `;
}

async function upsertNotFoundCache(pictureId: string) {
  await upsertCachedImage({
    pictureId,
    driveFileId: NOT_FOUND_SENTINEL,
    mimeType: null,
    width: null,
    height: null,
  });
}

type DriveImageData = {
  fileId: string;
  mimeType: string;
  width?: number | null;
  height?: number | null;
  buffer: Buffer;
};

const normalizeImage = async ({
  buffer,
  mimeType,
  width,
  height,
}: {
  buffer: Buffer;
  mimeType: string;
  width?: number | null;
  height?: number | null;
}) => {
  let normalizedBuffer = buffer;
  let normalizedMimeType = mimeType || "image/jpeg";
  let normalizedSize = {
    width: width || undefined,
    height: height || undefined,
  };

  try {
    // Auto-orient pixels using EXIF orientation metadata.
    const autoOriented = sharp(buffer, { failOn: "none" }).rotate();
    const metadata = await autoOriented.metadata();
    normalizedBuffer = await autoOriented.jpeg({ quality: 92 }).toBuffer();
    normalizedMimeType = "image/jpeg";
    normalizedSize = {
      width: metadata.width,
      height: metadata.height,
    };
  } catch (orientationError) {
    console.warn("Image auto-orient failed, using original bytes:", orientationError);
  }

  return {
    buffer: normalizedBuffer.toString("base64"),
    mimeType: normalizedMimeType,
    size: normalizedSize,
  };
};

async function fetchDriveImageByFileId(fileId: string): Promise<DriveImageData | null> {
  const { drive } = await getGoogleServices();
  const meta = await drive.files.get({
    fileId,
    fields: "id, mimeType, imageMediaMetadata(width,height)",
    supportsAllDrives: true,
  });

  if (!meta.data?.id || !meta.data?.mimeType) {
    return null;
  }

  const fileResponse = await drive.files.get(
    { fileId, alt: "media", supportsAllDrives: true },
    { responseType: "arraybuffer" },
  );

  return {
    fileId,
    mimeType: meta.data.mimeType || "image/jpeg",
    width: meta.data.imageMediaMetadata?.width,
    height: meta.data.imageMediaMetadata?.height,
    buffer: Buffer.from(fileResponse.data as ArrayBuffer),
  };
}

async function searchDriveImageByPictureId(pictureId: string): Promise<DriveImageData | null> {
  const { drive } = await getGoogleServices();
  const escapedPictureId = pictureId.replace(/'/g, "\\'");

  const { data } = await drive.files.list({
    q: `(name contains '${escapedPictureId}') and (mimeType contains 'image/')`,
    fields: "files(id, name, mimeType, imageMediaMetadata(width,height))",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    corpora: "allDrives",
  });

  const files = (data?.files || []).filter(
    (file) => file?.name && !file.name.startsWith("._") && file.id,
  );

  const matchedFile =
    files.find((file) => {
      const lastDotIndex = file.name.lastIndexOf(".");
      const baseName =
        lastDotIndex > 0 ? file.name.substring(0, lastDotIndex) : file.name;
      return String(baseName).toLowerCase() === String(pictureId).toLowerCase();
    }) || files[0];

  if (!matchedFile?.id) return null;
  return fetchDriveImageByFileId(matchedFile.id);
}

export async function getImageBlobById(pictureId: string) {
  if (!pictureId) {
    return;
  }

  try {
    const cached = await getCachedImage(pictureId);
    const isKnownMissing = cached?.drive_file_id === NOT_FOUND_SENTINEL;
    const isCacheValid =
      cached?.drive_file_id && new Date(cached.expires_at).getTime() > Date.now();

    if (isKnownMissing && isCacheValid) {
      return null;
    }

    if (isCacheValid) {
      try {
        const cachedImage = await fetchDriveImageByFileId(cached.drive_file_id);
        if (cachedImage) {
          return normalizeImage({
            buffer: cachedImage.buffer,
            mimeType: cachedImage.mimeType || cached.mime_type || "image/jpeg",
            width: cachedImage.width ?? cached.width,
            height: cachedImage.height ?? cached.height,
          });
        }
      } catch (cacheFetchError) {
        console.warn("Cached drive_file_id fetch failed, refreshing from Drive search:", cacheFetchError);
      }
    }

    const refreshedImage = await searchDriveImageByPictureId(pictureId);
    if (!refreshedImage) {
      // Best-effort fallback: even if cache is expired, try old file id once.
      if (cached?.drive_file_id && cached.drive_file_id !== NOT_FOUND_SENTINEL) {
        const fallbackImage = await fetchDriveImageByFileId(cached.drive_file_id);
        if (fallbackImage) {
          await upsertCachedImage({
            pictureId,
            driveFileId: fallbackImage.fileId,
            mimeType: fallbackImage.mimeType,
            width: fallbackImage.width ?? null,
            height: fallbackImage.height ?? null,
          });
          return normalizeImage({
            buffer: fallbackImage.buffer,
            mimeType: fallbackImage.mimeType,
            width: fallbackImage.width,
            height: fallbackImage.height,
          });
        }
      }
      await upsertNotFoundCache(pictureId);
      return null;
    }

    await upsertCachedImage({
      pictureId,
      driveFileId: refreshedImage.fileId,
      mimeType: refreshedImage.mimeType,
      width: refreshedImage.width ?? null,
      height: refreshedImage.height ?? null,
    });

    return normalizeImage({
      buffer: refreshedImage.buffer,
      mimeType: refreshedImage.mimeType,
      width: refreshedImage.width,
      height: refreshedImage.height,
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}
