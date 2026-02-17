import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const imageFile = formData.get("image") as File | null;
  if (!imageFile) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  // Convert image to base64
  const bytes = await imageFile.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64Image = buffer.toString("base64");
  
  // Determine media type
  const mediaType = imageFile.type || "image/jpeg";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: `Analyze this image and identify ALL regions that contain any color (not white, not gray, not black - but actual colors like red, blue, green, yellow, etc.).

For each colored region you find, describe:
1. What the object/region is (e.g. "cat", "flower", "sky", "shirt")
2. What color(s) it has

Be thorough - find every single colored element in the image, no matter how small.

If the image is completely grayscale/white/black with NO colors at all, respond with "NO_COLOR_FOUND".

Format your response as a JSON array of objects with this structure:
[
  {"description": "red cat in center", "confidence": 0.95},
  {"description": "blue sky in background", "confidence": 0.90}
]

Only respond with the JSON array or "NO_COLOR_FOUND", nothing else.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Claude API error:", error);
      return NextResponse.json(
        { error: "Claude API request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Check if no color found
    if (content.trim() === "NO_COLOR_FOUND") {
      return NextResponse.json({ regions: [] });
    }

    // Parse the JSON response
    try {
      const regions = JSON.parse(content);
      return NextResponse.json({ regions });
    } catch (parseError) {
      console.error("Failed to parse Claude response:", content);
      return NextResponse.json(
        { error: "Failed to parse response", rawResponse: content },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error calling Claude API:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
