import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import type { GalleryItem } from "@/app/projects/image-labelifier/lib/types";
import { getGalleryItem, removeGalleryItem } from "@/app/lib/server/gallery-store";
import { IMAGE_LABELIFIER_GALLERY_NS } from "../storage";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const item = await getGalleryItem<GalleryItem>(IMAGE_LABELIFIER_GALLERY_NS, id);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete all blob assets
    const blobUrls = [item.imageUrl, item.originalUrl];
    if (item.depthUrl) blobUrls.push(item.depthUrl);
    if (item.segmentsUrl) blobUrls.push(item.segmentsUrl);
    await Promise.all(blobUrls.map((url) => del(url)));

    await removeGalleryItem(IMAGE_LABELIFIER_GALLERY_NS, id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 500 }
    );
  }
}
