import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import type { GalleryItem } from "@/app/projects/image-reconstructor/lib/types";
import { getGalleryItem, removeGalleryItem } from "@/app/lib/server/gallery-store";
import { IMAGE_RECON_GALLERY_NS } from "../storage";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const item = await getGalleryItem<GalleryItem>(IMAGE_RECON_GALLERY_NS, id);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const blobUrls = [item.originalUrl, item.thumbnailUrl];
    if (item.sketchUrl) blobUrls.push(item.sketchUrl);
    if (item.videoUrl) blobUrls.push(item.videoUrl);
    for (const url of item.frameUrls) blobUrls.push(url);
    const unique = [...new Set(blobUrls)];
    await Promise.all(unique.map((url) => del(url)));

    await removeGalleryItem(IMAGE_RECON_GALLERY_NS, id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 500 }
    );
  }
}
