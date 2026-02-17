import { NextRequest, NextResponse } from "next/server";
import { getRedisClient, REDIS_KEYS } from "@/app/projects/color-animate/lib/redis";

interface Params {
  params: Promise<{ id: string }>;
}

// GET - Fetch a specific session
export async function GET(request: NextRequest, { params }: Params) {
  const redis = getRedisClient();
  if (!redis) {
    return NextResponse.json(
      { error: "Redis not configured" },
      { status: 500 }
    );
  }

  try {
    const { id } = await params;
    const data = await redis.get(REDIS_KEYS.session(id));

    if (!data) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session: JSON.parse(data) });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific session
export async function DELETE(request: NextRequest, { params }: Params) {
  const redis = getRedisClient();
  if (!redis) {
    return NextResponse.json(
      { error: "Redis not configured" },
      { status: 500 }
    );
  }

  try {
    const { id } = await params;
    await redis.del(REDIS_KEYS.session(id));
    await redis.lrem(REDIS_KEYS.sessionList(), 0, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
