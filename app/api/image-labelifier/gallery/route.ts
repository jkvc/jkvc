import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import type { GalleryItem } from "@/app/projects/image-labelifier/lib/types";
import type { ParticleConfig } from "@/app/projects/image-labelifier/lib/particle-config";
import { listGalleryItems, saveGalleryItem } from "@/app/lib/server/gallery-store";
import { IMAGE_LABELIFIER_GALLERY_NS } from "./storage";

async function fileToBuffer(file: File): Promise<Buffer> {
  return Buffer.from(await file.arrayBuffer());
}

export async function GET() {
  try {
    const items = await listGalleryItems<GalleryItem>(IMAGE_LABELIFIER_GALLERY_NS, 5);
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

  // All raster assets are stored as WebP. Snapshot arrives already encoded by the
  // client canvas (lossy q=0.92); original + depth arrive in whatever format their
  // upstream produced (user upload / Replicate ZoeDepth) and are transcoded here.
  // Depth uses lossless WebP because depth values are read pixel-by-pixel during
  // particle sampling and any quantization would shift the result.
  const [originalWebp, depthWebp] = await Promise.all([
    sharp(await fileToBuffer(original)).webp({ quality: 90 }).toBuffer(),
    sharp(await fileToBuffer(depth)).webp({ lossless: true }).toBuffer(),
  ]);

  // Blob path prefix is intentionally kept as `text-image/` to match existing
  // assets uploaded before the project was renamed to "Image Labelifier".
  // Stored items reference full blob URLs in Redis, so the prefix is internal
  // organization only — flipping it would just split storage across two folders.
  const [snapshotBlob, originalBlob, depthBlob, segmentsBlob] = await Promise.all([
    put(`text-image/${id}/snapshot.webp`, snapshot, {
      access: "public",
      contentType: "image/webp",
    }),
    put(`text-image/${id}/original.webp`, originalWebp, {
      access: "public",
      contentType: "image/webp",
    }),
    put(`text-image/${id}/depth.webp`, depthWebp, {
      access: "public",
      contentType: "image/webp",
    }),
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
    await saveGalleryItem(IMAGE_LABELIFIER_GALLERY_NS, id, item);
  } catch {
    // Redis not configured — blob was still uploaded successfully
  }

  return NextResponse.json(item, { status: 201 });
}
