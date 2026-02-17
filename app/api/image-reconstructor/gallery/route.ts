import { put } from "@vercel/blob";
import { getRedis } from "@/app/projects/image-reconstructor/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import type { GalleryItem } from "@/app/projects/image-reconstructor/lib/types";

const GALLERY_KEY = "image-reconstructor:gallery";

export async function GET() {
  try {
    const redis = getRedis();
    const ids = await redis.lrange(GALLERY_KEY, 0, 4);
    if (ids.length === 0) return NextResponse.json([]);

    const pipeline = redis.pipeline();
    for (const id of ids) {
      pipeline.get(`image-reconstructor:item:${id}`);
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
  const original = formData.get("original") as File;
  const sketch = formData.get("sketch") as File | null;
  const video = formData.get("video") as File | null;
  const segmentLabelsJson = formData.get("segmentLabels") as string;
  const animationPrompt = (formData.get("animationPrompt") as string) || "";

  const id = crypto.randomUUID();

  const blobUploads: Promise<{ url: string }>[] = [
    put(`image-reconstructor/${id}/original.jpg`, original, {
      access: "public",
    }),
  ];

  if (sketch) {
    blobUploads.push(
      put(`image-reconstructor/${id}/sketch.jpg`, sketch, { access: "public" })
    );
  }

  if (video) {
    blobUploads.push(
      put(`image-reconstructor/${id}/video.mp4`, video, { access: "public" })
    );
  }

  // Upload each frame
  const frameFiles: File[] = [];
  let i = 0;
  while (formData.has(`frame_${i}`)) {
    frameFiles.push(formData.get(`frame_${i}`) as File);
    i++;
  }

  for (let f = 0; f < frameFiles.length; f++) {
    blobUploads.push(
      put(`image-reconstructor/${id}/frame_${f}.jpg`, frameFiles[f], {
        access: "public",
      })
    );
  }

  const blobs = await Promise.all(blobUploads);

  let idx = 0;
  const originalUrl = blobs[idx++].url;
  const sketchUrl = sketch ? blobs[idx++].url : "";
  const videoUrl = video ? blobs[idx++].url : "";
  const frameUrls = blobs.slice(idx).map((b) => b.url);

  const segmentLabels: string[] = JSON.parse(segmentLabelsJson || "[]");

  const item: GalleryItem = {
    id,
    createdAt: new Date().toISOString(),
    thumbnailUrl: originalUrl,
    originalUrl,
    sketchUrl,
    frameUrls,
    segmentLabels,
    videoUrl,
    animationPrompt,
  };

  try {
    const redis = getRedis();
    await redis.set(`image-reconstructor:item:${id}`, JSON.stringify(item));
    await redis.lpush(GALLERY_KEY, id);
  } catch {
    // Redis not configured — blobs still uploaded
  }

  return NextResponse.json(item, { status: 201 });
}
