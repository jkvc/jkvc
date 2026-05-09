import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/app/lib/server/redis";
import {
  verifyAdminToken,
  setAdminCookie,
  clearAdminCookie,
} from "@/app/lib/server/admin-auth";

const RATE_KEY = "admin:login_attempts";
const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 300; // 5 minutes

async function isRateLimited(ip: string): Promise<boolean> {
  try {
    const redis = getRedis();
    const key = `${RATE_KEY}:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, WINDOW_SECONDS);
    return count > MAX_ATTEMPTS;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: "too_many_attempts" },
      { status: 429 },
    );
  }

  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { token } = body;
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const valid = await verifyAdminToken(token);
  if (!valid) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  await setAdminCookie(token);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
