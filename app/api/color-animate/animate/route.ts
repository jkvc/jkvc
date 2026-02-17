import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";

const WAN_I2V_MODEL = "wan-video/wan-2.5-i2v-fast";

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

  try {
    // Use replicate.run which handles model version automatically
    const output = await replicate.run(WAN_I2V_MODEL, {
      input: {
        image: imageFile,
        num_frames: 81,
        fps: 8,
      },
    });

    // Output should be a video URL
    return NextResponse.json({
      videoUrl: output,
      status: "completed",
    });
  } catch (error) {
    console.error("Animation creation error:", error);
    return NextResponse.json(
      { error: "Failed to create animation" },
      { status: 500 }
    );
  }
}
