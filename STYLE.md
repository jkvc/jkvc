# STYLE.md

Concise record of visual design decisions used across the site.

## Palette

| Token             | Value     | Usage                                |
|-------------------|-----------|--------------------------------------|
| `--color-surface` | `#FAFAF8` | Page background (warm off-white)     |
| `--color-text`    | `#2C2C2C` | Default body text                    |
| `--color-text-heading` | `#1A1A1A` | Headings                        |
| `--color-text-muted`  | `#999`    | Subtitles, secondary text        |
| `--color-text-faint`  | `#CCC`    | Labels, placeholders             |
| `--color-gold`    | `#8A8578` | Accent (warm slate)                  |
| `--color-gold-dark`   | `#6B6860` | Accent hover / active            |
| `--color-gold-light`  | `#A8A196` | Accent subtle backgrounds        |
| `--color-border`  | `#E0E0E0` | Borders, dividers                    |
| `--color-border-dashed` | `#DDD`  | Dashed container borders           |

## Typography

- **Headings**: `font-serif` (Georgia) — `text-3xl tracking-tight`
- **Subtitles**: `text-[13px] leading-relaxed text-text-muted`
- **Section labels**: `text-[10px] uppercase tracking-widest text-text-faint`
- **Body**: System sans (Geist Sans)

## Shapes

- **Circular buttons**: `w-9 h-9` or `w-10 h-10`, `rounded-full`, `border border-border`, `text-[#AAA]` idle, `hover:border-gold/50 hover:text-gold` on hover.
- **Pill buttons**: `rounded-full px-4 py-1.5`, same border/color scheme.
- **Cards & containers**: `rounded-2xl` (large radius), dashed border uses `border-dashed border-border-dashed`.
- **Thumbnails**: `rounded-lg`, `border border-[#E8E8E8]`.

## Icons

Use **Font Awesome 7** (`@fortawesome/fontawesome-free`) for all icons. No hand-drawn inline SVGs unless truly custom. CSS imported globally in `globals.css`.

## Interaction patterns

- **Hover on circular/pill buttons**: border shifts to `gold/50`, text shifts to `gold`.
- **Active preset circles**: `bg-gold text-white shadow-sm`.
- **Loading indicators**: Circular icon containers with `animate-spin` while running, `fa-check` when done.
- **Dev-only UI**: Uses `DevOnlyButton` component (self-hides in production), pill shape with `fa-radiation` icons flanking text.

## Layout

- Page max-width: `max-w-2xl mx-auto`
- Page padding: `px-6 sm:px-8`, generous top padding (`pt-20`) for vertical centering feel.
- Bottom nav: centered circular home icon button with `mt-16`.
- Section spacing: `gap-6` between major blocks.

## Principles

1. **Neutral warmth** — warm off-white surface, warm slate accent. No saturated colors.
2. **Minimal chrome** — no heavy borders or shadows. Thin `1px` borders, subtle transitions.
3. **Circular controls** — buttons are circles or pills, never rectangles.
4. **Typography hierarchy** — serif for titles, sans for everything else, uppercase micro-labels for sections.
5. **Consistency** — same tokens everywhere. All pages share `globals.css` variables.
