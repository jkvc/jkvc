# jkvc

Personal website showcasing diffusion model inference algorithms and novel interactive experiences. Deployed on Vercel.

## Stack

- Next.js 16 (App Router)
- Tailwind CSS v4 + daisyUI v5
- TypeScript
- pnpm

## Getting Started

```bash
pnpm install
pnpm dev
```

Open http://localhost:42096.

## Project Structure

```
app/
  layout.tsx                         # Root layout, metadata, fonts, light theme
  page.tsx                           # Home page (projects grid + draft toggle)
  globals.css                        # Tailwind + daisyUI + Font Awesome imports
  components/
    ProjectCard.tsx                  # Reusable project thumbnail card
    DevOnlyButton.tsx                # Dev-only action button
    gallery/
      SaveActionPanel.tsx            # Shared save-to-gallery button/error shell
    project/
      ProjectPageFrame.tsx           # Shared project page wrapper
    ui/
      IconCircleButton.tsx           # Shared circular icon button/link
      ExampleGalleryStrip.tsx        # Shared examples/gallery thumbnails strip
      UploadDropZone.tsx             # Shared drag-drop/click upload container
      StatusPillRow.tsx              # Shared pipeline status pill row

  lib/
    client/
      blob-files.ts                  # Client helpers for blob/file payloads
    server/
      redis.ts                       # Shared Redis singleton
      gallery-store.ts               # Shared Redis gallery CRUD helpers

  projects/
    data.ts                          # Project metadata for home + pages
    [slug]/page.tsx                  # Generic fallback project page
    image-labelifier/
    image-reconstructor/
    magic-crankie/
```

## Build

```bash
# Safe build that won't conflict with a running dev server
CHECK_BUILD=1 pnpm run build
```

## Lint

```bash
pnpm lint
```

## Conventions

See `CLAUDE.md` for agent rules (build commands, commit policy, package manager).
