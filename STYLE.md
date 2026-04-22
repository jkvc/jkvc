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
- **Sans body** — Geist Sans (default).
- **Mono micro-caption** — Geist Mono, `text-[10px] uppercase tracking-[0.22em] text-ink-faint`. Used for masthead chrome, tag strings, dates, status labels.
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

## Structural components

- `Masthead` — top/bottom hairline rules, two mono micro-caption rows, dotted-ring mark on the right. Props-driven; per-page lines can override.
- `ProjectRow` — full-width row, circle thumbnail (64×64) left, red `№ 01` eyebrow + italic serif title + description + mono tag string center, plain year + status label + red status dot right. Hairline divider below, none on last item.
- `ContactSlab` — inverted dark block at the bottom of every page. Italic serif headline, mono tag string, row of circular icon-buttons (inverted variant).
- `IconCircleButton` — unchanged API; colors now flow from editorial tokens.

## Icons

Font Awesome 7 (`@fortawesome/fontawesome-free`). No hand-drawn inline SVGs unless truly custom (the dotted-ring mark is the sole exception).

## Interaction patterns

- **Circular/pill buttons** — idle `border-rule text-ink-muted`, hover `border-ink text-ink`.
- **Active preset** — `bg-ink text-surface`.
- **Red status dot** — solid `bg-hot` circle; use the existing `animate-ping` halo for `current: true` indicators (also recolored to `--color-hot`).
- **Loading** — spinner icon containers (`animate-spin` → `fa-check` on complete).

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
