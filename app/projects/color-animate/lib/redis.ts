import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) {
    console.warn("REDIS_URL not configured");
    return null;
  }

  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 200, 1000);
      },
    });
  }

  return redis;
}

export const REDIS_KEYS = {
  session: (id: string) => `color-animate:session:${id}`,
  sessionList: () => `color-animate:sessions`,
};
