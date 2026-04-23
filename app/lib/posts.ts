import fs from "node:fs/promises";
import path from "node:path";

/**
 * Lightweight MDX file loader. Posts live at `./posts/<slug>.mdx` at the
 * project root (NOT inside `app/`, so Next.js doesn't try to route them).
 *
 * Frontmatter is optional — if present it's parsed by `gray-matter` at the
 * page render site. This helper just returns the raw file contents (or null
 * when the post file doesn't exist, so callers can gracefully fall back to
 * the "Coming soon" placeholder).
 */
export async function readPostSource(slug: string): Promise<string | null> {
  const filePath = path.join(process.cwd(), "posts", `${slug}.mdx`);
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}
