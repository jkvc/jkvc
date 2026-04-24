import fs from "node:fs/promises";
import path from "node:path";
import { POST_ASSET_MIME } from "@/app/lib/posts";
import { NextResponse } from "next/server";

function contentTypeForPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return POST_ASSET_MIME[ext] ?? "application/octet-stream";
}

/**
 * Serves static files from `posts/<slug>/assets/<...path>` at
 * GET /post-assets/<slug>/...
 *
 * Next.js does not serve files outside `public/` on its own, so this route
 * colocates post images with the MDX without duplicating them under `public/`.
 * Paths are validated to stay under the post's `assets` directory.
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string; path?: string[] }> }
) {
  const { slug, path: segments = [] } = await context.params;

  if (!/^[a-z0-9-]+$/i.test(slug) || segments.length === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const assetsDir = path.resolve(
    process.cwd(),
    "posts",
    slug,
    "assets"
  );
  const filePath = path.join(assetsDir, ...segments);
  const resolved = path.resolve(filePath);
  const relative = path.relative(assetsDir, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const data = await fs.readFile(resolved);
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentTypeForPath(resolved),
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return new NextResponse("Not found", { status: 404 });
    }
    throw err;
  }
}
