# STYLE.md

Technical handbook design system. Neo-brutalist with architectural precision — warm paper, deep ink, spot red accent, hard offset shadows.

## Palette

| Token | HEX | Usage |
|---|---|---|
| `--color-paper` | `#f4f4f3` | Page background (cool neutral, handbook-ish) |
| `--color-surface` | `#ffffff` | Card/panel backgrounds (white) |
| `--color-surface-2` | `#e9e9e8` | Secondary surfaces, `KindStamp` chips, code blocks |
| `--color-surface-sunken` | `#f1f1f0` | Recessed surfaces, range-track fill |
| `--color-ink` | `#15140f` | Primary text, borders, stamp shadows (deep ink) |
| `--color-ink-muted` | `#4a4740` | Secondary text, body copy |
| `--color-ink-faint` | `#97938a` | Faint text, meta, timeline labels |
| `--color-rule` | `#d4d4d3` | Hairline rules, dividers, empty charge cells |
| `--color-hot` | `#C0392B` | Accent color (spot red / coral) |
| `--color-hot-deep` | `#8E2A20` | Accent hover/active (darker red) |

All colors live in CSS custom properties in `app/globals.css` under `@theme inline`. Legacy aliases (`--color-gold`, `--color-text`, etc.) still point at handbook tokens during migration — prefer the handbook names in new code.

### Shadows

Stamp shadows are flat, hard, and ink-colored — no blur:

| Token | Offset |
|---|---|
| `--shadow-sm` | 2×2px |
| `--shadow-md` | 4×4px |
| `--shadow-lg` | 6×6px |

Mapped to Tailwind as `shadow-sm`, `shadow-md`, `shadow-lg`.

## Page background

Every page sits on graph paper. `body::before` renders a fixed 24×24px grid (`opacity: 0.4`) with a radial mask that fades toward the bottom. Content stacks above it (`body > * { z-index: 1 }`). The optional `.handbook-grid` class duplicates the same pattern for local use.

Text selection inverts to hot red on white (`::selection`).

## Typography

- **Display serif** — `font-serif` = Fraunces (variable, SOFT + WONK + opsz). Reserved for the wordmark accent (`kv` in hot italic). Legacy support elsewhere; prefer sans for new work.
- **Sans body** — Geist Sans (default). Hero subtitles and descriptions use `text-sm` or `text-base` with `text-ink-muted` and relaxed leading.
- **Mono caption** — the `caption-mono` utility (Geist Mono, 11px, uppercase, `0.05em` tracking, bold). **Do not re-spell the raw Tailwind classes.** Pair with a color class (`text-ink-faint`, `text-hot`, `text-ink-muted`, etc.). Used for eyebrows, timeline labels, status text, filter pills, meta rows.
- **Display scale**
  - Home hero wordmark: `text-[64px] sm:text-[80px] leading-none`
  - Interior hero wordmark (About): `text-4xl sm:text-5xl leading-none`
  - Interior page titles (`PageStampHeader`, `SectionCard`): `font-sans font-black uppercase` — `text-4xl sm:text-5xl` for page heroes, `text-2xl sm:text-3xl` for section cards
  - Masonry card titles: `font-sans text-base font-extrabold uppercase leading-tight tracking-tight`
  - Body (About sections, general): `text-[15px] leading-relaxed text-ink-muted`
  - Post MDX body: `text-[14px] leading-[1.55] text-ink-muted`; headings are bold/black sans uppercase (`h1` 2rem, `h2` 1.625rem, `h3` 1.25rem)
  - Micro-caption: `caption-mono` + color token

## Shapes

- **Sharp corners everywhere** — `--radius-sm` through `--radius-xl` are all `0px`. Only circles (`rounded-full`) and the wordmark clip boxes break the rule.
- **Stamps** — 2px ink border + hard offset shadow on the same face element. Primary surface pattern for cards and controls.
- **Hairline rules** — `hairline` utility or `border-t-2 border-rule`. Used for dividers (`LabeledDivider`), filter-row separators, timeline rails — not as a substitute for stamp cards.
- **Dashed borders** — reserved for empty states and placeholder outlines.
- **Inverted slabs** — `bg-ink text-surface` with stamp face chrome. `ContactSlab` is the canonical example (sharp corners, `STAMP_CARD_SHADOW`).

## CSS utilities

Defined in `app/globals.css` via Tailwind v4 `@utility`. Compose with normal Tailwind classes.

| Class | Role |
|---|---|
| `caption-mono` | Canonical mono eyebrow — size, tracking, uppercase, mono family, bold |
| `hairline` | 2px `--color-rule` top border |
| `stamp-range` | Neo-brutalist range input — square thumb, ink border, 2×2px stamped shadow. Used by `<RangeField>` |
| `scrollbar-hidden` | Scrollable region without a visible scrollbar |
| `handbook-grid` | Local graph-paper background (same pattern as `body::before`) |

Native `<dialog>` modals use `dialog::backdrop` with 30% ink tint (`color-mix`).

## Stamp system (`app/lib/stamp.ts`)

Neo-brutalist **face** pattern. Border and shadow live on the same element. On hover the face translates −2px (−0.5 Tailwind units) while the shadow offset grows +2px so the stamp appears fixed on the page (no paper gap between face and shadow). Lift classes require `group` on an ancestor.

| Token / component | Idle shadow | Hover |
|---|---|---|
| `STAMP_FACE` | — | `border-2 border-ink transition-all duration-200 ease-out` (shared chrome) |
| `STAMP_CARD_SHADOW` / `<StampShell variant="card">` | `shadow-lg` (6×6px) | `STAMP_CARD_LIFT` when `interactive` |
| `STAMP_CONTROL_SHADOW` / `<Pill>`, `<IconCircleButton>`, `<StampShell variant="control">` | `shadow-sm` (2×2px) | `STAMP_CONTROL_LIFT` when eligible |
| `STAMP_BLEED` | — | `p-2 -m-2` — room for card shadow on an isolated hero (home wordmark, desktop `ContactSlab`) |
| `STAMP_BLEED_LG` | — | `lg:p-2 lg:-m-2` — desktop-only bleed when mobile inset comes from parent `px-2` |
| `STAMP_BLEED_TOP` | — | `-mt-2 pt-2` — top bleed in a `py-8` scroll lane without horizontal negative margin |
| `STAMP_BLEED_INSET` | — | `p-2` — padding on masonry/grid containers (no negative margin) |

### `<StampShell>` (`app/components/ui/StampShell.tsx`)

The primitive wrapper. Props: `variant` (`card` \| `control`), `interactive` (enables lift), `bleed` (default `true` for cards, `false` for masonry items and interior sections), `inline` (default `true` for controls), `faceClassName`, `className`.

Use `<StampShell>` for major cards and one-off stamped controls. Use `<Pill>` / `<IconCircleButton>` for editorial controls — they import the same tokens directly.

Deprecated wrap tokens (`STAMP_CONTROL_WRAP`, `STAMP_CARD_WRAP`, etc.) alias the shadow constants; some older call sites (e.g. `PostBody` images, `StatusPillRow`) still import them.

## Control sizing (`app/components/ui/controlSize.ts`)

Shared dimensions keep pills and icon buttons aligned at the same `size`:

| Size | Square (icon button) | Pill height | Pill padding-x | Icon glyph |
|---|---|---|---|---|
| `xs` | 28×28 (`w-7 h-7`) | `h-7` | `px-3.5` | 11px |
| `sm` | 36×36 (`w-9 h-9`) | `h-9` | `px-4` | 13px |
| `md` | 40×40 (`w-10 h-10`) | `h-10` | `px-5` | 14px |

Default pill size is `xs`. `ContactSlab` icon buttons use `xs` inverted.

## Structural components

### Brand & shell

- `Wordmark` (`app/components/brand/Wordmark.tsx`) — `jkvc` with italic Fraunces `kv` in hot red. Compact/upright ↔ full/italic cross-fade on hover. Respects `prefers-reduced-motion`. `defaultExpanded` pins the full name on first paint (About hero). `interactive={false}` disables hover toggle.
- `InteriorPageShell` (`app/components/editorial/InteriorPageShell.tsx`) — shared interior wrapper: `min-h-screen px-5 pb-16 pt-8 sm:px-8`, centered column. Default `max-w-3xl` (About, project pages). Admin and usage pass `max-w-2xl`.
- `PageStampHeader` (`app/components/editorial/PageStampHeader.tsx`) — interior page hero via `<StampShell variant="card">`. Top row: `KindStamp` eyebrow + optional date/location meta (`caption-mono text-ink-faint`). Body: default bold uppercase title + muted subtitle, or custom `children` (About uses wordmark + portrait). Optional `trailing` row (ref pills, actions).
- `ProjectPageFrame` (`app/components/project/ProjectPageFrame.tsx`) — project page scaffold inside `InteriorPageShell`: draft badge (`StampShell` control), `PageStampHeader` with kind meta and ref pills, then content with `contentTopClassName` default `mt-12`.

### Editorial controls

- `Pill` (`app/components/editorial/Pill.tsx`) — **the** editorial pill button. Sharp corners, `caption-mono`, `STAMP_FACE` + control shadow. States: inactive (surface/ink-muted, lifts on hover), `active` (inverted ink), `inverted` (for dark surfaces — dim chrome, hot hover). Button or Link variant. **Do not hand-roll pills.**
- `IconCircleButton` (`app/components/ui/IconCircleButton.tsx`) — stamped icon or letter-label button. `shape`: `circle` (default, `rounded-full`) or `square`. `inverted` for dark surfaces (`ContactSlab`). Same active/inactive/lift rules as `Pill`.
- `KindStamp` (`app/components/editorial/KindStamp.tsx`) — eyebrow chip on `bg-surface-2`: mono hot 10px label + optional icon. Used on masonry cards and `PageStampHeader`.
- `LabeledDivider` (`app/components/editorial/LabeledDivider.tsx`) — `── LABEL ──` motif. `stub` (32px flanking lines) or `full` (flex-expanding). `caption-mono` + `hairline`.

### Home & projects

- `ProjectMasonryCard` (`app/components/ProjectMasonryCard.tsx`) — home masonry tile. `<StampShell variant="card" interactive>`. Thumbnail band with overlaid `KindStamp`, bold uppercase title, description, footer meta (ref icons, draft/published stamp glyph, date). Wrapped in `<Link className="group">` for hover lift.
- `ProjectRow` (`app/components/ProjectRow.tsx`) — **legacy** handbook row card (circle thumbnail, italic serif title). Retained for reference; home uses `ProjectMasonryCard`.
- `ProjectCard` — older gradient thumbnail card; not used on the current home page.

### Content & media

- `PostBody` (`app/components/post/PostBody.tsx`) — readable post renderer. MDX split on `---` becomes multiple `<StampShell variant="card">` sections with `gap-6`. Single-section posts render as a plain article. Images and `<pre>` get `STAMP_FACE` + control shadow. Export `<PostImage>` for width overrides.
- `ExampleGalleryStrip` (`app/components/ui/ExampleGalleryStrip.tsx`) — circular-thumbnail strip with optional `LabeledDivider` title.
- `ScrollingPano` (`app/components/ui/ScrollingPano.tsx`) — seamless horizontal panorama inside `ContactSlab`; seek-to-marker API.

### Footer & status

- `ContactSlab` (`app/components/editorial/ContactSlab.tsx`) — inverted ink block. `STAMP_FACE` + `STAMP_CARD_SHADOW`, scrolling panorama band, row of inverted `IconCircleButton`s (LinkedIn, GitHub, Scholar, email reveal), location pills that seek the pano. One per page — pinned to the bottom of the home left lane on desktop, inline below masonry on mobile.
- `ChargeStatusPanel` (`app/components/ChargeStatusPanel.tsx`) — stamp card rows per charge pool with cell indicators (`bg-ink` filled, `bg-hot` critical, `bg-rule` empty).
- `StatusPillRow` (`app/components/ui/StatusPillRow.tsx`) — pipeline step indicators (idle / running / complete / error) as stamped squares.
- `ConfirmDialog` (`app/components/ui/ConfirmDialog.tsx`) — native `<dialog>` modal; ink backdrop, centered `StampShell` card, `Pill` confirm/cancel.
- `RangeField` (`app/components/ui/RangeField.tsx`) — labeled `stamp-range` slider for project debug panels.

### About page patterns

Local to `app/about/page.tsx`:

- `SectionCard` — `StampShell variant="card"` with `SectionHead` (bold uppercase `h2`, optional subhead). Body sections (`Hi`, `Experience`, `Resume`) use `gap-6` spacing matching `PostBody`.
- Portrait photo — `STAMP_FACE` + `STAMP_CONTROL_SHADOW` on the hero image (no `StampShell` wrapper).
- Timeline — `caption-mono` date/role row, bold org name, hot ping dot for `current` entries, `bg-rule` rail.

## Icons

Font Awesome 7 (`@fortawesome/fontawesome-free`). No hand-drawn SVG paths unless truly custom.

## Interaction patterns

- **Stamp hover** — face translates −2px; shadow offset grows +2px (`STAMP_CONTROL_LIFT` / `STAMP_CARD_LIFT`). Requires `group` on the interactive ancestor. Active and inverted controls skip lift.
- **Circular/square buttons and pills** — use `<Pill>` or `<IconCircleButton>`; never hand-roll shadows or borders.
- **Active state** — `bg-ink text-surface border-ink` (light surfaces). Built into `<Pill active>` and `<IconCircleButton active>`.
- **Inverted surfaces** — `ContactSlab`, dark presentation chrome. Use `inverted` prop on controls; active inverted flips to light surface.
- **Red status dot** — solid `bg-hot` circle; `animate-ping` halo for `current: true` indicators (About timeline, `ContactSlab` role dot).
- **Loading** — `fa-spinner animate-spin` in stamped containers; `fa-check` on complete. See `StatusPillRow`.
- **Links in prose** — `text-hot` underline with `decoration-hot/40`, bold weight (`PostBody` `a` element).

## Layout

### Interior pages

- Wrapper: `InteriorPageShell` — `pt-8 px-5 sm:px-8 pb-16`
- Column width: `max-w-3xl` default; `max-w-2xl` for admin, usage
- Hero: `PageStampHeader` (no separate masthead strip)
- Content offset below hero: `mt-12`
- Section spacing: `gap-6` between stamp cards
- Footer: `ContactSlab` at `mt-16` (About)

### Home page (`app/page.tsx`)

Breakpoint driven by `useWideLayout` (`lg` / 1024px). Crossing the breakpoint wraps layout changes in View Transitions when supported (`home-aside`, `home-hero`, `home-filters`, `home-masonry`, `home-contact`); respects `prefers-reduced-motion`. Shell morph uses `transition-[max-width,padding,gap] duration-500` with `cubic-bezier(0.22, 1, 0.36, 1)`.

**Desktop (`wide`)** — `max-w-5xl h-dvh px-8`, `grid grid-cols-[2fr_3fr] gap-10`:

- Left lane (~40%): fixed height, `py-8`, `justify-between`. Wordmark stamp (`STAMP_BLEED`), filter pills + drafts toggle, `ContactSlab` pinned via `mt-auto` (`STAMP_BLEED`).
- Right lane (~60%): sole scroll region (`h-dvh overflow-y-auto scrollbar-hidden py-8`). Two-column CSS masonry (`columns-2 gap-4 px-2`, `STAMP_BLEED_TOP`, `break-inside-avoid` on cards).

**Mobile / narrow** — `max-w-[35.4rem]`, single-column document scroll (`py-12 sm:py-20 px-2`). Hero and filters get `px-2` inset. Masonry stays two columns. `ContactSlab` below the grid.

### Project playables

Interactive demos use the stamp system in debug/control panels: `Pill` and `StampShell` for actions, `RangeField` for sliders, `IconCircleButton` for back/reset (often `shape="square"`). Presentation views wrap content in stamped containers consistent with the interior page language.

### Résumé (`/resume`)

Separate printable layout — US Letter sheet centered on a soft preview surface. Not part of the stamp card system; optimized for print (`⌘P`).

## Do / don't

| Do | Don't |
|---|---|
| Import stamp tokens from `app/lib/stamp.ts` | Hand-roll offset shadows or 2px borders |
| Use `<Pill>`, `<IconCircleButton>`, `<StampShell>` | Build one-off control chrome |
| Use `caption-mono` for eyebrows and meta | Re-type mono size/tracking/uppercase |
| Use `InteriorPageShell` + `PageStampHeader` on new interior pages | Roll custom page padding/hero per route |
| Set `bleed={false}` on masonry cards and multi-card grids | Apply `STAMP_BLEED` inside CSS columns (clips neighbors) |
| Split readable posts on `---` for stamp sections | Wrap single-section posts in unnecessary shells |
