/**
 * Shared Redis client using ioredis.
 *
 * Reuses a single connection across invocations within the same
 * serverless container / dev server process.
 */

import Redis from "ioredis";

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error("REDIS_URL is not configured");
    client = new Redis(url);
  }
  return client;
}
