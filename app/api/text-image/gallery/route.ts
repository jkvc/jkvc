import { put } from "@vercel/blob";
import { getRedis } from "@/app/projects/text-image/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import type { GalleryItem } from "@/app/projects/text-image/lib/types";
import type { ParticleConfig } from "@/app/projects/text-image/components/ParticleControls";

const GALLERY_KEY = "text-image:gallery";

export async function GET() {
  try {
    const redis = getRedis();
    const ids = await redis.lrange(GALLERY_KEY, 0, 4); // max 5 items
    if (ids.length === 0) return NextResponse.json([]);

    const pipeline = redis.pipeline();
    for (const id of ids) {
      pipeline.get(`text-image:item:${id}`);
    }
    const results = await pipeline.exec();

    const items: GalleryItem[] = [];
    if (results) {
      for (const [err, raw] of results) {
        if (!err && typeof raw === "string") {
          items.push(JSON.parse(raw) as GalleryItem);
        }
      }
    }

    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const snapshot = formData.get("snapshot") as File;
  const original = formData.get("original") as File;
  const depth = formData.get("depth") as File;
  const segmentsFile = formData.get("segments") as File;
  const width = Number(formData.get("width"));
  const height = Number(formData.get("height"));
  const labels = JSON.parse(formData.get("labels") as string) as string[];
  const mode = (formData.get("mode") as string) || "presentation";
  const presetId = formData.get("presetId") as string || null;
  const config = JSON.parse(formData.get("config") as string) as ParticleConfig;

  const id = crypto.randomUUID();

  const [snapshotBlob, originalBlob, depthBlob, segmentsBlob] = await Promise.all([
    put(`text-image/${id}/snapshot.png`, snapshot, { access: "public" }),
    put(`text-image/${id}/original.png`, original, { access: "public" }),
    put(`text-image/${id}/depth.png`, depth, { access: "public" }),
    put(`text-image/${id}/segments.json`, segmentsFile, { access: "public" }),
  ]);

  const item: GalleryItem = {
    id,
    imageUrl: snapshotBlob.url,
    originalUrl: originalBlob.url,
    depthUrl: depthBlob.url,
    segmentsUrl: segmentsBlob.url,
    createdAt: Date.now(),
    width,
    height,
    labels,
    mode: mode as "presentation" | "expert",
    presetId: presetId || null,
    config,
  };

  try {
    const redis = getRedis();
    await redis.set(`text-image:item:${id}`, JSON.stringify(item));
    await redis.lpush(GALLERY_KEY, id);
  } catch {
    // Redis not configured — blob was still uploaded successfully
  }

  return NextResponse.json(item, { status: 201 });
}
