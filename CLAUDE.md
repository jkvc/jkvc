# CLAUDE.md

## Important Rules

### 1. Build Commands Must Use Separate Directory
If you need to run `pnpm run build` for any reason (only when it is appropriate for complex changes), you **must** use the separate build directory to avoid conflicts with a running dev server:

```bash
CHECK_BUILD=1 pnpm run build
```

This uses `.next-check` as the output directory instead of `.next`. See `next.config.ts` for implementation.

### 2. Never Commit or Push Without Explicit Permission
You are **never allowed** to commit or push any code unless the user explicitly tells you to do so in a **separate user message**. Do not proactively commit or push changes, even if they appear complete.

### 3. Keep CLAUDE.md Stable
Do **not** add frequently-changing content to this file such as:
- Lists of demos or features
- Specific environment variable names
- Configuration details that evolve with code

This file is for stable rules and conventions. Use code comments or README for implementation details.

### 4. Package Manager
This project uses **pnpm**. Never use `npm` or `yarn` commands.

### 5. Icons
Use **Font Awesome 7** (`@fortawesome/fontawesome-free`) for all icons. Do **not** hand-draw inline SVG paths unless an absolutely custom icon is needed that Font Awesome does not provide. The CSS is imported globally in `app/globals.css`.

### 6. Style Guide
All visual design decisions (palette, typography, border radii, button patterns, layout conventions) are documented in `STYLE.md` at the project root. Read and follow it when creating or modifying UI.

### 7. Prose Line Wrapping
Do **not** hard-wrap paragraphs in Markdown / MDX content (e.g. files under `posts/`, `README.md`, `STYLE.md`, any `.md` / `.mdx`). Write each paragraph, list item, and block-level element as a single unwrapped line. Editor word wrap is on — mid-paragraph line breaks make editing awkward and produce noisy diffs. Blank lines still separate blocks as usual.

### 8. Post layout and images
Each readable post is a **directory** named after the project `slug` (must match `app/projects/data.ts`):

- `posts/<slug>/content.mdx` — the MDX body
- `posts/<slug>/assets/` — images and other static files for that post (optional)

Do **not** use `posts/<slug>.mdx` at the top level. Inline images in MDX with a root-relative URL, e.g. `![](/post-assets/<slug>/hero.png)` (served from `app/post-assets`). Nested paths work: `assets/diagrams/x.png` → `![](/post-assets/<slug>/diagrams/x.png)`.

**Image width** — Defaults live in `app/components/post/PostBody.tsx` (`max-w-xl`, centered). In MDX: (1) `<PostImage columnWidth={0.5} />` for a **fraction of the text column** (same width as the `max-w-2xl` main column — `1` = full column); (2) `<PostImage maxWidth="2xl" />` for Tailwind max-width presets; (3) `<img className="…" />` with `tailwind-merge` overrides. Plain `![](/post-assets/...)` keeps the default.
