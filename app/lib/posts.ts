import fs from "node:fs/promises";
import path from "node:path";

/**
 * Map of `Content-Type` for post assets (see `app/post-assets/.../route.ts`).
 * Keep in sync with the route's MIME list when adding extensions.
 */
export const POST_ASSET_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

/**
 * Public URL for an image (or other static file) colocated with a post:
 *   posts/<slug>/assets/<filename>
 *   → /post-assets/<slug>/<filename>
 *
 * Use in MDX: `![caption](/post-assets/<slug>/hero.png)`.
 * Nested paths work: `assets/diagrams/flow.png` →
 * `/post-assets/<slug>/diagrams/flow.png`.
 */
export function postAssetUrl(slug: string, ...segments: string[]): string {
  return ["/post-assets", slug, ...segments].join("/");
}

/**
 * MDX lives at `./posts/<slug>/content.mdx` (NOT inside `app/`, so Next.js
 * doesn't try to route it). Colocate images under
 * `./posts/<slug>/assets/` and reference them with `postAssetUrl` or
 * `![](/post-assets/<slug>/...)` in the post body.
 *
 * Returns the raw file contents, or `null` when the post file is missing.
 */
export async function readPostSource(slug: string): Promise<string | null> {
  const filePath = path.join(
    process.cwd(),
    "posts",
    slug,
    "content.mdx"
  );
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}
