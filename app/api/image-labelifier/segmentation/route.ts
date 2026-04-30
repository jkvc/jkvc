import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";

const SEGFORMER_MODEL =
  "simbrams/segformer-b5-finetuned-ade-640-640:a2e13e3527942cb26fd17f896cafd648875f80feeb842444f0cd253acc093cd0";

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

  const replicate = new Replicate({ auth: token });

  const output = await replicate.run(SEGFORMER_MODEL, {
    input: { image: imageFile },
  });

  // output is an array of { label: string, mask: string (base64 PNG), score: null }
  return NextResponse.json({ segments: output });
}
