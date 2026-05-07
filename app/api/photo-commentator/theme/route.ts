import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { THEME_SYSTEM } from "@/app/projects/photo-commentator/lib/prompts";

type Media = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

const ALLOWED_MEDIA: Media[] = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export async function POST(request: NextRequest) {
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

  const systemOverride = (formData.get("systemPrompt") as string | null)?.trim();

  const buffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const rawType = imageFile.type || "image/jpeg";
  const mediaType: Media = (ALLOWED_MEDIA as string[]).includes(rawType)
    ? (rawType as Media)
    : "image/jpeg";

  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 80,
    system: systemOverride && systemOverride.length > 0 ? systemOverride : THEME_SYSTEM,
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
            text: "Pick the comedic register / voice / setting for captions overlaid on this photo.",
          },
        ],
      },
    ],
  });

  const theme =
    message.content[0]?.type === "text"
      ? message.content[0].text.trim().replace(/^["'`]|["'`]$/g, "")
      : "";

  console.log("[photo-commentator/theme] →", theme);

  return NextResponse.json({ theme });
}
