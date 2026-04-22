# STYLE.md

Editorial / deli-zine design system. Cool cream paper and warm-black ink (Anthropic-inspired), one red accent.

## Palette

| Token                  | Value     | Usage                                      |
|------------------------|-----------|--------------------------------------------|
| `--color-surface`      | `#F0EEE6` | Page background (cool cream paper, Anthropic-ish) |
| `--color-surface-deep` | `#E8E6DC` | Hover tints on paper, inset panels         |
| `--color-ink`          | `#141413` | Body text, headings, inverted-slab bg      |
| `--color-ink-muted`    | `#3D3D3A` | Caption text, secondary text               |
| `--color-ink-faint`    | `#87867F` | Micro-captions, mono eyebrows              |
| `--color-rule`         | `#D4D2C9` | Hairline rules, dashed borders             |
| `--color-hot`          | `#C0392B` | Spot red — wordmark accent, status dots    |
| `--color-hot-deep`     | `#8E2A20` | Red hover / active                         |

Legacy `--color-gold*`, `--color-text*`, `--color-border*` are aliased to editorial tokens and will be deleted once consumers migrate.

## Typography

- **Display serif** — `font-serif` = Fraunces (variable, with SOFT + WONK + opsz axes). Used for wordmarks, section titles, pull-quotes.
- **Italic Fraunces** is a deliberate accent — row titles, pull-quotes, the accented segments of the wordmark.
- **Sans body** — Geist Sans (default). Project-page and About-page hero subtitles use `text-base text-ink-muted leading-relaxed`.
- **Mono micro-caption** — use the `caption-mono` utility (Geist Mono, 10px, uppercase, 0.22em tracking). **Do not re-spell the raw Tailwind classes** — this is the single source of truth for the editorial eyebrow treatment used on masthead chrome, tag strings, dates, status labels, pill buttons, labeled dividers, and status row captions.
- **Display scale**
  - Hero wordmark: `text-6xl leading-none tracking-[-0.03em]`
  - Section titles: `font-serif text-3xl`
  - Row titles: `font-serif italic text-xl`
  - Body: `text-[15px] leading-relaxed`

## Shapes

- **Hairline rules** (`border-t border-rule`) replace cards — no shadows, no heavy borders.
- **Dashed borders** reserved for the dotted-ring mark and category pill row.
- **Circles & pills** — unchanged. `w-9/h-9` or `w-10/h-10` circles, `rounded-full px-4 py-1.5` pills.
- **Inverted slabs** — `bg-ink text-surface rounded-2xl`, used once per page for the contact slab.

## Brand

- **Wordmark** — `jkvc` with `kv` in hot red italic Fraunces. On hover/focus each letter expands to its full name (`j → Junshen`, `kv → Kevin`, `c → Chen`) via CSS transitions. Respects `prefers-reduced-motion`.
- **Dotted-ring mark** — 24 evenly-spaced dots on a circle, fill `--color-hot`. Reused as `/favicon.svg` and OG image.

## CSS utilities

Defined in `app/globals.css` via Tailwind v4 `@utility`. Compose with normal Tailwind classes.

| Class | Role |
|---|---|
| `caption-mono` | The canonical mono eyebrow — size, tracking, uppercase, mono family. Pair with a color class (`text-ink-faint`, `text-hot`, etc.) |
| `hairline` | 1px `--color-rule` top border. Use for short label-divider stubs, inter-section rules, etc. |

## Structural components

- `Wordmark` — `jkvc`, `kv` in hot italic Fraunces. On hover/focus each letter expands to its full name. Respects `prefers-reduced-motion`.
- `Pill` (`app/components/editorial/Pill.tsx`) — **the** editorial pill button. `caption-mono` typography, rounded-full, hairline border, active-inverts-to-ink state. Button or Link. Use for filters, toggles, inline CTAs. **Do not hand-roll pills.**
- `LabeledDivider` (`app/components/editorial/LabeledDivider.tsx`) — `── LABEL ──` motif. `stub` variant for short accent stubs flanking a caption; `full` variant for flex-span section dividers. Uses `caption-mono` + `hairline`.
- `RecipeHeader` (`app/components/editorial/RecipeHeader.tsx`) — top/bottom hairline meta strip for project and About pages. Back arrow, red `№ NN` issue label, right-aligned meta string.
- `ContactSlab` (`app/components/editorial/ContactSlab.tsx`) — inverted dark block at the bottom of home/about. Row of circular icon-buttons (inverted variant), pulsing red dot, location line.
- `IconCircleButton` (`app/components/ui/IconCircleButton.tsx`) — circular icon button. Sizes: `xs` (28px, inline) · `sm` (36px) · `md` (40px, used in `ContactSlab`). Inverted variant for dark surfaces.
- `ProjectRow` (`app/components/ProjectRow.tsx`) — home-row card. Circle thumbnail (80×80) left, red `№ NN` eyebrow + italic serif title + description center, right column stacks status label+dot on top and YYYY-MM-DD date below.
- `ExampleGalleryStrip` (`app/components/ui/ExampleGalleryStrip.tsx`) — circular-thumbnail strip with an optional `LabeledDivider` title above.

## Icons

Font Awesome 7 (`@fortawesome/fontawesome-free`). No hand-drawn inline SVGs unless truly custom (the dotted-ring mark is the sole exception).

## Interaction patterns

- **Circular/pill buttons** — idle `border-rule text-ink-muted`, hover `border-ink text-ink`. Use `<Pill>` or `<IconCircleButton>`; never hand-roll.
- **Active state** — `bg-ink text-surface border-ink`. Built into `<Pill active>` and `<IconCircleButton active>`.
- **Red status dot** — solid `bg-hot` circle; use the existing `animate-ping` halo for `current: true` indicators (also recolored to `--color-hot`).
- **Loading** — spinner icon containers (`animate-spin` → `fa-check` on complete). See `StatusPillRow`.
- **Row enlargement on hover** — `transition-transform duration-300 group-hover:scale-[1.025]` on the row, `group-hover:scale-[1.08]` on the circular thumbnail. Center-origin (symmetric).

## Layout

- Page max-width: `max-w-2xl mx-auto`
- Page padding: `px-6 sm:px-8`
- Hero top margin: `mt-16` (masthead sits above)
- Section spacing: `gap-6` between major blocks

## Principles

1. **One hot color** — red is reserved. Everything else is paper and ink.
2. **Hairlines over cards** — rules divide; boxes intrude.
3. **Italic as accent** — Fraunces italic where ink would be too quiet.
4. **Mono micro-captions** — every piece of metadata reads as letterpress chrome.
5. **Inverted slab once** — exactly one dark block per page, for the contact/CTA.
