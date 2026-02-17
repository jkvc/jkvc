import { del } from "@vercel/blob";
import { getRedis } from "@/app/projects/image-reconstructor/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import type { GalleryItem } from "@/app/projects/image-reconstructor/lib/types";

const GALLERY_KEY = "image-reconstructor:gallery";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const redis = getRedis();

    const raw = await redis.get(`image-reconstructor:item:${id}`);
    if (!raw) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const item = JSON.parse(raw) as GalleryItem;

    const blobUrls = [item.originalUrl, item.thumbnailUrl];
    if (item.sketchUrl) blobUrls.push(item.sketchUrl);
    if (item.videoUrl) blobUrls.push(item.videoUrl);
    for (const url of item.frameUrls) blobUrls.push(url);
    const unique = [...new Set(blobUrls)];
    await Promise.all(unique.map((url) => del(url)));

    await redis.del(`image-reconstructor:item:${id}`);
    await redis.lrem(GALLERY_KEY, 1, id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 500 }
    );
  }
}
