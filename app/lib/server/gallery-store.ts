import { getRedis } from "./redis";

export interface GalleryNamespace {
  galleryKey: string;
  itemKeyPrefix: string;
}

function toItemKey(ns: GalleryNamespace, id: string) {
  return `${ns.itemKeyPrefix}:${id}`;
}

export async function listGalleryItems<T>(
  ns: GalleryNamespace,
  limit = 5
): Promise<T[]> {
  const redis = getRedis();
  const ids = await redis.lrange(ns.galleryKey, 0, limit - 1);
  if (ids.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.get(toItemKey(ns, id));
  }
  const results = await pipeline.exec();

  const items: T[] = [];
  if (!results) return items;

  for (const [err, raw] of results) {
    if (err || typeof raw !== "string") continue;
    try {
      items.push(JSON.parse(raw) as T);
    } catch {
      // Ignore malformed records.
    }
  }

  return items;
}

export async function getGalleryItem<T>(
  ns: GalleryNamespace,
  id: string
): Promise<T | null> {
  const redis = getRedis();
  const raw = await redis.get(toItemKey(ns, id));
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export async function saveGalleryItem<T>(
  ns: GalleryNamespace,
  id: string,
  item: T
) {
  const redis = getRedis();
  await redis.set(toItemKey(ns, id), JSON.stringify(item));
  await redis.lpush(ns.galleryKey, id);
}

export async function removeGalleryItem(
  ns: GalleryNamespace,
  id: string
) {
  const redis = getRedis();
  await redis.del(toItemKey(ns, id));
  await redis.lrem(ns.galleryKey, 1, id);
}
