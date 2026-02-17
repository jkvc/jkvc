import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const FLUX_PRO_MODEL = "black-forest-labs/flux-2-pro";

const SKETCH_PROMPT =
  "Convert to a precise black-and-white technical sketch. Clean thin outlines, construction lines, dimension markings, and annotations. Black pencil on pure white paper. Preserve the exact composition, proportions, and spatial structure of the original image. No shading, no color, no fill — outlines only.";

/** Center-crop to max inscribing square, then resize to 768x768. */
async function cropAndResize(file: File): Promise<File> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(buffer).metadata();
  const w = metadata.width!;
  const h = metadata.height!;
  const size = Math.min(w, h);
  const left = Math.floor((w - size) / 2);
  const top = Math.floor((h - size) / 2);

  const outputBuffer = await sharp(buffer)
    .extract({ left, top, width: size, height: size })
    .resize(768, 768)
    .jpeg({ quality: 92 })
    .toBuffer();

  const bytes = new Uint8Array(outputBuffer);
  return new File([bytes], "input.jpg", { type: "image/jpeg" });
}

export async function POST(request: NextRequest) {
  const token = process.env.REPLICATE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "REPLICATE_TOKEN not configured" },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const imageFile = formData.get("image") as File | null;
  if (!imageFile) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const squareImage = await cropAndResize(imageFile);
  const replicate = new Replicate({ auth: token });

  const output = await replicate.run(FLUX_PRO_MODEL, {
    input: {
      prompt: SKETCH_PROMPT,
      input_images: [squareImage],
      aspect_ratio: "1:1",
      resolution: "1 MP",
      safety_tolerance: 5,
    },
  });

  const sketchUrl =
    output && typeof output === "object" && "url" in output
      ? (output as { url: () => string }).url()
      : String(output);

  return NextResponse.json({ sketchUrl });
}
