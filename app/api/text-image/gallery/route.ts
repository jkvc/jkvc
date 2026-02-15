import { put } from "@vercel/blob";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import type { GalleryItem } from "@/app/projects/text-image/lib/types";

const GALLERY_KEY = "text-image:gallery";

function getRedis() {
  // TODO: Set up Upstash Redis via Vercel Marketplace, then `vercel env pull`.
  // Required env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
  return Redis.fromEnv();
}

export async function GET() {
  try {
    const redis = getRedis();
    const ids: string[] = (await redis.lrange(GALLERY_KEY, 0, -1)) ?? [];
    if (ids.length === 0) return NextResponse.json([]);

    const items = await Promise.all(
      ids.map((id) => redis.get<GalleryItem>(`text-image:item:${id}`))
    );

    return NextResponse.json(items.filter(Boolean));
  } catch {
    // Redis not configured — return empty for local dev without env vars
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const snapshot = formData.get("snapshot") as File;
  const original = formData.get("original") as File;
  const width = Number(formData.get("width"));
  const height = Number(formData.get("height"));
  const labels = JSON.parse(formData.get("labels") as string) as string[];

  const id = crypto.randomUUID();

  // TODO: Requires BLOB_READ_WRITE_TOKEN env var.
  // Create a Blob store in Vercel dashboard, then `vercel env pull`.
  const [snapshotBlob, originalBlob] = await Promise.all([
    put(`text-image/${id}/snapshot.png`, snapshot, { access: "public" }),
    put(`text-image/${id}/original.png`, original, { access: "public" }),
  ]);

  const item: GalleryItem = {
    id,
    imageUrl: snapshotBlob.url,
    originalUrl: originalBlob.url,
    createdAt: Date.now(),
    width,
    height,
    labels,
  };

  try {
    const redis = getRedis();
    await redis.set(`text-image:item:${id}`, item);
    await redis.lpush(GALLERY_KEY, id);
  } catch {
    // Redis not configured — blob was still uploaded successfully
  }

  return NextResponse.json(item, { status: 201 });
}
