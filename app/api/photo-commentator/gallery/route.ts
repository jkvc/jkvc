import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import type {
  GalleryItem,
  Box,
  Tunables,
} from "@/app/projects/photo-commentator/lib/types";
import {
  listGalleryItems,
  saveGalleryItem,
} from "@/app/lib/server/gallery-store";
import { PHOTO_COMMENTATOR_GALLERY_NS } from "./storage";

export async function GET() {
  try {
    const items = await listGalleryItems<GalleryItem>(
      PHOTO_COMMENTATOR_GALLERY_NS,
      5
    );
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const original = formData.get("original") as File | null;
  if (!original) {
    return NextResponse.json({ error: "Missing original" }, { status: 400 });
  }

  const boxesJson = (formData.get("boxes") as string) ?? "[]";
  const captionsJson = (formData.get("captions") as string) ?? "[]";
  const tunablesJson = (formData.get("tunables") as string) ?? "{}";
  const theme = ((formData.get("theme") as string) ?? "").toString();

  let boxes: Box[];
  let captions: { boxId: string; lines: string[] }[];
  let tunables: Tunables;
  try {
    boxes = JSON.parse(boxesJson);
    captions = JSON.parse(captionsJson);
    tunables = JSON.parse(tunablesJson);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const id = crypto.randomUUID();

  const blob = await put(`photo-commentator/${id}/original.jpg`, original, {
    access: "public",
  });

  const item: GalleryItem = {
    id,
    createdAt: new Date().toISOString(),
    thumbnailUrl: blob.url,
    originalUrl: blob.url,
    theme,
    boxes,
    captions,
    tunables,
  };

  try {
    await saveGalleryItem(PHOTO_COMMENTATOR_GALLERY_NS, id, item);
  } catch {
    // Redis not configured — blob still uploaded, item just isn't listable.
  }

  return NextResponse.json(item, { status: 201 });
}
