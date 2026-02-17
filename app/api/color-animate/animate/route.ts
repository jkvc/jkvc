import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";

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
    // Start the prediction
    const prediction = await replicate.predictions.create({
      version: await getModelVersion(replicate),
      input: {
        image: imageFile,
        num_frames: 81,
        fps: 8,
      },
    });

    // Return the prediction ID so client can poll for status
    return NextResponse.json({
      predictionId: prediction.id,
      status: prediction.status,
    });
  } catch (error) {
    console.error("Animation creation error:", error);
    return NextResponse.json(
      { error: "Failed to start animation" },
      { status: 500 }
    );
  }
}

// GET endpoint to check prediction status
export async function GET(request: NextRequest) {
  const token = process.env.REPLICATE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "REPLICATE_TOKEN not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const predictionId = searchParams.get("id");

  if (!predictionId) {
    return NextResponse.json(
      { error: "No prediction ID provided" },
      { status: 400 }
    );
  }

  const replicate = new Replicate({ auth: token });

  try {
    const prediction = await replicate.predictions.get(predictionId);

    return NextResponse.json({
      status: prediction.status,
      output: prediction.output,
      error: prediction.error,
    });
  } catch (error) {
    console.error("Error fetching prediction:", error);
    return NextResponse.json(
      { error: "Failed to fetch prediction status" },
      { status: 500 }
    );
  }
}

// Helper to get the latest model version
async function getModelVersion(replicate: Replicate): Promise<string> {
  try {
    const model = await replicate.models.get("wan-video", "wan-2.5-i2v-fast");
    if (model.latest_version?.id) {
      return model.latest_version.id;
    }
  } catch (error) {
    console.error("Failed to fetch model version:", error);
  }
  
  // Fallback - you may need to update this with the actual version hash
  throw new Error("Could not determine model version");
}
