import { del } from "@vercel/blob";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import type { GalleryItem } from "@/app/projects/text-image/lib/types";

const GALLERY_KEY = "text-image:gallery";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const redis = Redis.fromEnv();

    const item = await redis.get<GalleryItem>(`text-image:item:${id}`);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete all blob assets
    const blobUrls = [item.imageUrl, item.originalUrl];
    if (item.depthUrl) blobUrls.push(item.depthUrl);
    if (item.segmentsUrl) blobUrls.push(item.segmentsUrl);
    await Promise.all(blobUrls.map((url) => del(url)));

    await redis.del(`text-image:item:${id}`);
    await redis.lrem(GALLERY_KEY, 1, id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 500 }
    );
  }
}
