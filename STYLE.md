# STYLE.md

Technical handbook design system. Neo-brutalist with architectural precision — warm paper, deep ink, spot red accent.

## Palette

| Token              | HEX       | Usage                                    |
|--------------------|-----------|------------------------------------------|
| `--color-paper`    | `#f4f4f3` | Page background (cool neutral, handbook-ish) |
| `--color-surface`  | `#ffffff` | Card/panel backgrounds (white)           |
| `--color-surface-2`| `#f4f2ee` | Secondary surfaces (slightly tinted)     |
| `--color-surface-sunken` | `#e9e6df` | Recessed surfaces (darker)        |
| `--color-ink`      | `#15140f` | Primary text, borders (deep ink)         |
| `--color-ink-muted`| `#4a4740` | Secondary text, muted content            |
| `--color-ink-faint`| `#97938a` | Faint text, subtle details               |
| `--color-rule`     | `#dcd8cf` | Hairline rules, dividers (warm gray)     |
| `--color-hot`      | `#C0392B` | Accent color (spot red / coral)          |
| `--color-hot-deep` | `#8E2A20` | Accent hover/active (darker red)         |

All colors live in CSS custom properties defined in `globals.css` under `@theme inline`.

## Typography

- **Display serif** — `font-serif` = Fraunces (variable, with SOFT + WONK + opsz axes). Used sparingly for wordmarks, pull-quotes. Legacy support only; prefer sans for new work.
- **Italic Fraunces** is a deliberate accent — row titles, pull-quotes, the accented segments of the wordmark.
- **Sans body** — Geist Sans (default). Project-page and About-page hero subtitles use `text-base text-ink-muted leading-[1.8]`.
- **Mono micro-caption** — use the `caption-mono` utility (Geist Mono, 10px, uppercase, 0.22em tracking). **Do not re-spell the raw Tailwind classes** — this is the single source of truth for the editorial eyebrow treatment used on category labels, timeline labels, status text, meta info.
- **Display scale**
  - Hero wordmark: `text-5xl sm:text-7xl leading-[0.8] tracking-[-0.03em]`
  - Section titles: `font-serif text-3xl sm:text-4xl leading-[1.15]`
  - Row titles: `font-sans font-semibold text-lg leading-tight`
  - Body: `text-[15px] leading-[1.8]`
  - Micro-caption: `caption-mono text-ink-muted`

## Shapes

- **Hairline rules** (`border-t-2 border-rule`) replace cards — no shadows, no heavy borders.
- **Dashed borders** reserved for empty states and placeholder outlines.
- **Circles & pills** — `rounded-full` only for circles (icon buttons, status dots) and pills (category filters, status badges). Radius scale: `--radius-*: 0px`, `--radius-full: 9999px`.
- **Inverted slabs** — `bg-ink text-surface rounded-2xl`, used once per page for the contact slab.

## CSS utilities

Defined in `app/globals.css` via Tailwind v4 `@utility`. Compose with normal Tailwind classes.

| Class | Role |
|---|---|
| `caption-mono` | The canonical mono eyebrow — size, tracking, uppercase, mono family. Pair with a color class (`text-ink-faint`, `text-hot`, etc.) |
| `hairline` | 2px `--color-rule` top border. Use for short label-divider stubs, inter-section rules, etc. |
| `scrollbar-hidden` | Scrollable region without a visible scrollbar |

## Stamp system (`app/lib/stamp.ts`)

Neo-brutalist **face** pattern. Shadow and border on the same element. On hover the face lifts −2px while the shadow offset grows +2px so the stamp stays fixed on the page (no paper gap).

| Token / component | Idle shadow | Hover |
|---|---|---|
| `STAMP_CARD_SHADOW` / `<StampShell variant="card">` | `shadow-lg` (6×6px) | `STAMP_CARD_LIFT` when `interactive` |
| `STAMP_CONTROL_SHADOW` / `<Pill>`, `<IconCircleButton>`, `<StampShell variant="control">` | `shadow-sm` (2×2px) | `STAMP_CONTROL_LIFT` |
| `STAMP_BLEED` | — | `p-2 -m-2` on isolated major cards |
| `STAMP_BLEED_INSET` | — | `p-2` on masonry/grid containers |

Use `<StampShell>` for major cards and hand-rolled controls. Use `<Pill>` / `<IconCircleButton>` for editorial controls — they import the same tokens.

## Structural components

- `Wordmark` — `jkvc` with italic Fraunces `kv` in hot red. Animated expansion on hover reveals `Junshen Kevin Chen`. Respects `prefers-reduced-motion`. Supports `defaultExpanded` and `interactive` props for About page usage.
- `Pill` (`app/components/editorial/Pill.tsx`) — **the** editorial pill button. `caption-mono` typography, rounded-full, hairline border, active-inverts-to-ink state. Button or Link variant. Use for category filters, status badges. **Do not hand-roll pills.**
- `LabeledDivider` (`app/components/editorial/LabeledDivider.tsx`) — `── LABEL ──` motif. `stub` variant for short flanking lines, `full` variant for flex-expanding lines. Uses `caption-mono` + `hairline`.
- `KindStamp` (`app/components/editorial/KindStamp.tsx`) — masonry/interior eyebrow chip (mono hot label + optional icon on `bg-surface-2`).
- `PageStampHeader` (`app/components/editorial/PageStampHeader.tsx`) — interior page hero card via `<StampShell variant="card">`: back square `IconCircleButton`, `KindStamp` eyebrow, optional date/location meta, title + subtitle (or custom children).
- `InteriorPageShell` (`app/components/editorial/InteriorPageShell.tsx`) — shared `pt-8` page wrapper and max-width column for about, projects, usage, admin.
- `ContactSlab` (`app/components/editorial/ContactSlab.tsx`) — inverted dark block at the bottom of pages. Row of circular icon-buttons, pulsing red dot for current role, location label.
- `IconCircleButton` (`app/components/ui/IconCircleButton.tsx`) — circular icon button. Sizes: `xs` (28px, inline) · `sm` (36px) · `md` (40px, used in `ContactSlab`). Inverted variant for dark surfaces.
- `ProjectRow` (`app/components/ProjectRow.tsx`) — legacy handbook row card. Circle thumbnail (80×80) left, red `№ NN` eyebrow + italic serif title + description center, right column stacks status label+dot on top and YYYY-MM-DD date below. Retained for reference; home page uses `ProjectMasonryCard`.
- `ProjectMasonryCard` — home masonry tile via `<StampShell variant="card" interactive>`. Full meta below thumbnail.
- `ExampleGalleryStrip` (`app/components/ui/ExampleGalleryStrip.tsx`) — circular-thumbnail strip with an optional `LabeledDivider` title above.

## Icons

Font Awesome 7 (`@fortawesome/fontawesome-free`). No hand-drawn SVG paths unless truly custom.

## Interaction patterns

- **Stamp hover** — shadow on the face. On hover, face translates −2px while shadow offset grows +2px so the stamp stays fixed (`STAMP_CONTROL_LIFT` / `STAMP_CARD_LIFT`). Major cards idle at `shadow-lg`; controls at `shadow-sm`.
- **Circular/pill buttons** — use `<Pill>` or `<IconCircleButton>`; never hand-roll.
- **Active state** — `bg-ink text-surface border-ink`. Built into `<Pill active>` and `<IconCircleButton active>`.
- **Red status dot** — solid `bg-hot` circle; use the existing `animate-ping` halo for `current: true` indicators (also recolored to `--color-hot`).
- **Loading** — spinner icon containers (`animate-spin` → `fa-check` on complete). See `StatusPillRow`.

## Layout

- Page max-width: `max-w-2xl mx-auto` (interior pages); home page uses `max-w-5xl`
- Page padding: `px-6 sm:px-8` (home: `px-5 sm:px-8`)
- Hero top margin: interior pages use `InteriorPageShell` (`pt-8`); no separate masthead strip
- Section spacing: `gap-6` between major blocks
- **Home page** — `lg:grid lg:grid-cols-[2fr_3fr]` inside `lg:h-dvh`: left ~40% lane fixed (wordmark card, filter pills, `ContactSlab` pinned to bottom via `mt-auto`); right ~60% is the sole scroll region (`lg:h-dvh overflow-y-auto scrollbar-hidden`) with two-column CSS masonry (`columns-2`, `break-inside-avoid` on cards). Collapses to normal document scroll below `lg`; masonry stays two columns on phone.
