import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { COMMENT_SYSTEM } from "@/app/projects/photo-commentator/lib/prompts";
import { HARD_LIMITS } from "@/app/projects/photo-commentator/lib/defaults";

type Media = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

const ALLOWED_MEDIA: Media[] = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

function clampInt(v: unknown, lo: number, hi: number, fallback: number): number {
  const n = typeof v === "string" ? parseInt(v, 10) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.max(lo, Math.min(hi, n));
}

/** Strip a single line down to at most `maxWords` words and normalize:
 *  lowercased, stripped of surrounding punctuation/quotes/numbering. */
function normalizeLine(raw: string, maxWords: number): string {
  let s = raw.trim();
  // Drop any leading numbering / bullets / dashes / quotes.
  s = s.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "");
  s = s.replace(/^["'`]+|["'`]+$/g, "");
  s = s.replace(/[.!?,;:]+$/g, "");
  s = s.toLowerCase();
  const words = s.split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(" ");
}

/** Strip surrounding ```json fences / leading "json" labels / stray prose
 *  before/after the JSON array. Returns the substring most likely to parse. */
function extractJsonArray(raw: string): string {
  let s = raw.trim();
  // Strip ```json ... ``` fences.
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  // Find the first '[' and last ']'.
  const start = s.indexOf("[");
  const end = s.lastIndexOf("]");
  if (start >= 0 && end > start) return s.slice(start, end + 1);
  return s;
}

interface RawCaption {
  index?: unknown;
  lines?: unknown;
}

import { withCharge } from "@/app/lib/server/charge";

export const POST = withCharge("photo-commentator-comment", async (request) => {
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

  const theme = ((formData.get("theme") as string | null) ?? "").trim();
  const numBoxes = clampInt(
    formData.get("numBoxes"),
    1,
    HARD_LIMITS.numBoxes,
    6
  );
  const maxLines = clampInt(formData.get("maxLines"), 1, HARD_LIMITS.maxLines, 2);
  const maxWordsPerLine = clampInt(
    formData.get("maxWordsPerLine"),
    1,
    HARD_LIMITS.maxWordsPerLine,
    8
  );
  const systemOverride = (formData.get("systemPrompt") as string | null)?.trim();

  const buffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const rawType = imageFile.type || "image/jpeg";
  const mediaType: Media = (ALLOWED_MEDIA as string[]).includes(rawType)
    ? (rawType as Media)
    : "image/jpeg";

  const systemTemplate =
    systemOverride && systemOverride.length > 0 ? systemOverride : COMMENT_SYSTEM;
  const system = systemTemplate
    .replace(/\{\{\s*theme\s*\}\}/g, theme || "neutral observational voice")
    .replace(/\{\{\s*numBoxes\s*\}\}/g, String(numBoxes))
    .replace(/\{\{\s*maxLines\s*\}\}/g, String(maxLines))
    .replace(/\{\{\s*maxWords\s*\}\}/g, String(maxWordsPerLine));

  const anthropic = new Anthropic({ apiKey });

  // ~30 tokens per line per box, plus structural overhead for JSON keys/braces.
  const max_tokens = 40 * maxLines * numBoxes + 128;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens,
    system,
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
            text: `Write distinct captions for each of the ${numBoxes} indexed boxes. Output JSON only.`,
          },
        ],
      },
    ],
  });

  const raw =
    message.content[0]?.type === "text" ? message.content[0].text : "";

  let parsed: RawCaption[] = [];
  try {
    const jsonStr = extractJsonArray(raw);
    const arr = JSON.parse(jsonStr);
    if (Array.isArray(arr)) parsed = arr as RawCaption[];
  } catch {
    return NextResponse.json(
      { error: "Could not parse model output as JSON", raw },
      { status: 502 }
    );
  }

  const captions: { index: number; lines: string[] }[] = [];
  for (const item of parsed) {
    const idx = typeof item.index === "number" ? item.index : Number(item.index);
    if (!Number.isFinite(idx)) continue;
    const linesIn = Array.isArray(item.lines) ? item.lines : [];
    const lines = linesIn
      .filter((l): l is string => typeof l === "string")
      .map((l) => normalizeLine(l, maxWordsPerLine))
      .filter((l) => l.length > 0)
      .slice(0, maxLines);
    captions.push({ index: idx, lines });
  }

  return NextResponse.json({ captions });
});
