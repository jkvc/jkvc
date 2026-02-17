import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";

const FLUX2KLEIN_MODEL = "logerzhu/flux2klein:latest";

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
  const prompt = formData.get("prompt") as string | null;

  if (!imageFile) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  if (!prompt) {
    return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
  }

  const replicate = new Replicate({ auth: token });

  try {
    const output = await replicate.run(FLUX2KLEIN_MODEL, {
      input: {
        image: imageFile,
        prompt: prompt,
        num_inference_steps: 28,
        guidance_scale: 3.5,
      },
    });

    // Output should be a URL to the generated image
    return NextResponse.json({ imageUrl: output });
  } catch (error) {
    console.error("Flux2Klein error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
