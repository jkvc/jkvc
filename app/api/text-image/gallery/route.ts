import { put } from "@vercel/blob";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import type { GalleryItem } from "@/app/projects/text-image/lib/types";
import type { ParticleConfig } from "@/app/projects/text-image/components/ParticleControls";

const GALLERY_KEY = "text-image:gallery";

function getRedis() {
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
    await redis.set(`text-image:item:${id}`, item);
    await redis.lpush(GALLERY_KEY, id);
  } catch {
    // Redis not configured — blob was still uploaded successfully
  }

  return NextResponse.json(item, { status: 201 });
}
