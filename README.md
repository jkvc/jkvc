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

Open http://localhost:3000.

## Project Structure

```
app/
  layout.tsx          # Root layout, metadata, fonts, light theme
  page.tsx            # Single-page site (client component, scroll-triggered navbar)
  globals.css         # Tailwind + daisyUI imports
  components/
    ProjectCard.tsx   # Reusable thumbnail card with hover overlay
```

## Build

```bash
# Safe build that won't conflict with a running dev server
CHECK_BUILD=1 pnpm run build
```

## Conventions

See `CLAUDE.md` for agent rules (build commands, commit policy, package manager).
