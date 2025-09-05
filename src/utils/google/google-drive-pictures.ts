import { getGoogleServices } from "@/utils/google/google";

export async function getImageBlobById(pictureId: String) {
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

    let files = data?.files ;
    files = files?.filter((file) => !file.name.startsWith("._"));
    // console.log("Files found:", files);

    if (files && files.length > 0) {
      // console.log(files[0]["imageMediaMetadata"])
      const fileId = files[0].id;
      const fileResponse = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" }
      );

      return {
        buffer: Buffer.from(fileResponse.data).toString("base64"),
        mimeType: files[0].mimeType,
        size: files[0]["imageMediaMetadata"]
      };
    }
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}
