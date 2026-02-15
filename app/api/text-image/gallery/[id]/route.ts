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
    // TODO: Requires UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN,
    // and BLOB_READ_WRITE_TOKEN env vars.
    const redis = Redis.fromEnv();

    const item = await redis.get<GalleryItem>(`text-image:item:${id}`);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await Promise.all([del(item.imageUrl), del(item.originalUrl)]);

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
