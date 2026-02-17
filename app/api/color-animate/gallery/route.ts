import { NextRequest, NextResponse } from "next/server";
import { getRedisClient, REDIS_KEYS } from "@/app/projects/color-animate/lib/redis";
import type { ColorAnimateSession } from "@/app/projects/color-animate/lib/types";

// GET - List all sessions
export async function GET() {
  const redis = getRedisClient();
  if (!redis) {
    return NextResponse.json(
      { error: "Redis not configured" },
      { status: 500 }
    );
  }

  try {
    const sessionIds = await redis.lrange(REDIS_KEYS.sessionList(), 0, -1);
    const sessions: ColorAnimateSession[] = [];

    for (const id of sessionIds) {
      const data = await redis.get(REDIS_KEYS.session(id));
      if (data) {
        sessions.push(JSON.parse(data));
      }
    }

    // Sort by most recent first
    sessions.sort((a, b) => b.updatedAt - a.updatedAt);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST - Create or update a session
export async function POST(request: NextRequest) {
  const redis = getRedisClient();
  if (!redis) {
    return NextResponse.json(
      { error: "Redis not configured" },
      { status: 500 }
    );
  }

  try {
    const session: ColorAnimateSession = await request.json();

    // Save session
    await redis.set(
      REDIS_KEYS.session(session.id),
      JSON.stringify(session),
      "EX",
      60 * 60 * 24 * 7 // 7 days TTL
    );

    // Add to list if new
    const exists = await redis.lpos(REDIS_KEYS.sessionList(), session.id);
    if (exists === null) {
      await redis.lpush(REDIS_KEYS.sessionList(), session.id);
      // Keep only last 100 sessions
      await redis.ltrim(REDIS_KEYS.sessionList(), 0, 99);
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("Error saving session:", error);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }
}
