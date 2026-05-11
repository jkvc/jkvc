import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import { withCharge } from "@/app/lib/server/charge";

export const POST = withCharge("image-reconstructor-generate-prompt", async (request) => {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "CLAUDE_API_KEY not configured" },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const imageFile = formData.get("image") as File | null;
  if (!imageFile) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const buffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mediaType = (imageFile.type || "image/jpeg") as
    | "image/jpeg"
    | "image/png"
    | "image/gif"
    | "image/webp";

  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: `You are an animation prompt generator for image-to-video AI models. Given an image, write a single detailed animation prompt that describes natural, subtle movement for the scene. Focus on subject movement, lighting shifts, and atmospheric details such as wind, water ripples, swaying foliage, or breathing. The camera must remain perfectly static — no panning, tilting, zooming, tracking, or any camera movement whatsoever. The prompt should be 2-3 sentences, vivid and specific. Output ONLY the prompt text, nothing else.`,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          {
            type: "text",
            text: "Generate a detailed animation prompt for this image.",
          },
        ],
      },
    ],
  });

  const prompt =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";

  console.log("[generate-prompt] Claude response:", prompt);

  return NextResponse.json({ prompt });
});
