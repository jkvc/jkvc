import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getRedis } from "./redis";

const REDIS_KEY = "admin:token";
const COOKIE_NAME = "admin_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Verify a candidate token against the value stored in Redis.
 * Returns true only if Redis has a token set AND it matches.
 */
export async function verifyAdminToken(candidate: string): Promise<boolean> {
  if (!candidate) return false;
  try {
    const stored = await getRedis().get(REDIS_KEY);
    if (!stored) return false;
    const a = Buffer.from(candidate);
    const b = Buffer.from(stored);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Check whether the current request has a valid admin cookie.
 * Safe to call from API routes and server components.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

/**
 * Set the admin cookie after successful login.
 */
export async function setAdminCookie(token: string): Promise<void> {
  const jar = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/**
 * Clear the admin cookie (logout).
 */
export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
