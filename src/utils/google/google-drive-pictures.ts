import { getGoogleServices } from "@/utils/google/google";
import sharp from "sharp";

export async function getImageBlobById(pictureId: string) {
  if (!pictureId) {
    return;
  }

  try {
    const { drive } = await getGoogleServices();

    // Search for matching files in the master folder
    const { data } = await drive.files.list({
      q: `(name contains '${pictureId}') and (mimeType contains 'image/')`,
      fields: "files(id, name, webContentLink, mimeType, imageMediaMetadata(width,height))",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      corpora: "allDrives",
    });

    let files = data?.files;
    // remove system artifacts
    files = files.filter((file) => !file.name.startsWith("._"));

    // exact match by base filename (without extension)
    const matchedFile = files.find((file) => {
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")); // remove last extension
      return String(baseName).toLocaleLowerCase() === String(pictureId).toLocaleLowerCase();
    });

    // console.log("Matched file:", matchedFile);

    if (matchedFile) {
      const fileId = matchedFile.id;
      const fileResponse = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" }
      );

      const rawBuffer = Buffer.from(fileResponse.data);
      let normalizedBuffer = rawBuffer;
      let normalizedMimeType = matchedFile.mimeType || "image/jpeg";
      let normalizedSize = matchedFile["imageMediaMetadata"];

      try {
        // Auto-orient pixels using EXIF orientation metadata.
        const autoOriented = sharp(rawBuffer, { failOn: "none" }).rotate();
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
    }
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}
