import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import type { GalleryItem } from "@/app/projects/image-reconstructor/lib/types";
import { listGalleryItems, saveGalleryItem } from "@/app/lib/server/gallery-store";
import { IMAGE_RECON_GALLERY_NS } from "./storage";

export async function GET() {
  try {
    const items = await listGalleryItems<GalleryItem>(IMAGE_RECON_GALLERY_NS, 5);
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
    await saveGalleryItem(IMAGE_RECON_GALLERY_NS, id, item);
  } catch {
    // Redis not configured — blobs still uploaded
  }

  return NextResponse.json(item, { status: 201 });
}
