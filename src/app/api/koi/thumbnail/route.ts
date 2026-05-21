import { NextRequest, NextResponse } from "next/server";
import { getImageBlobById } from "@/utils/google/google-drive-pictures";

export async function GET(req: NextRequest) {
  try {
    const pictureId = req.nextUrl.searchParams.get("picture_id")?.trim();
    if (!pictureId) {
      return NextResponse.json(
        { error: "picture_id is required" },
        { status: 400 },
      );
    }

    const image = await getImageBlobById(pictureId);
    if (!image?.buffer) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const bytes = Buffer.from(image.buffer, "base64");
    return new Response(bytes, {
      headers: {
        "Content-Type": image.mimeType || "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Error loading thumbnail:", error);
    return NextResponse.json(
      { error: "Failed to load thumbnail" },
      { status: 500 },
    );
  }
}

