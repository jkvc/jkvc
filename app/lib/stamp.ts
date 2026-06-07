/**
 * Neo-brutalist stamp tokens — shadow and border on the face. On hover the face
 * lifts while its box-shadow offset grows by the same amount so the stamp
 * appears fixed on the page (no paper gap between face and shadow).
 *
 * Controls: 2px shadow · Major cards: 6px shadow · Lift: 2px
 */

/** Face chrome — 2px ink border. Pair with a shadow token below. */
export const STAMP_FACE =
    "border-2 border-ink transition-all duration-200 ease-out";

/** Idle shadows (offset matches `--shadow-sm` / `--shadow-lg` in globals.css). */
export const STAMP_CONTROL_SHADOW = "shadow-sm";
export const STAMP_CARD_SHADOW = "shadow-lg";

/**
 * Lift + shadow compensation. Requires `group` on an ancestor.
 * Translate −2px; shadow +2px → net stamp position unchanged.
 */
export const STAMP_CONTROL_LIFT =
    "group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[4px_4px_0_0_var(--color-ink)]";

export const STAMP_CARD_LIFT =
    "group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[8px_8px_0_0_var(--color-ink)]";

/** @deprecated Use STAMP_CONTROL_SHADOW on the face — wrap shadow causes lift gaps. */
export const STAMP_CONTROL_WRAP = STAMP_CONTROL_SHADOW;
/** @deprecated Use STAMP_CONTROL_SHADOW on the face. */
export const STAMP_CONTROL_WRAP_IDLE = STAMP_CONTROL_SHADOW;
/** @deprecated Use STAMP_CARD_SHADOW on the face. */
export const STAMP_CARD_WRAP = STAMP_CARD_SHADOW;
/** @deprecated Use STAMP_CARD_SHADOW on the face. */
export const STAMP_CARD_WRAP_IDLE = STAMP_CARD_SHADOW;
/** @deprecated Use STAMP_CONTROL_LIFT or STAMP_CARD_LIFT. */
export const STAMP_LIFT = STAMP_CONTROL_LIFT;

/** Bleed room for a single isolated card (hero). Avoid on CSS-column masonry items. */
export const STAMP_BLEED = "p-2 -m-2";

/** Desktop-only variant of {@link STAMP_BLEED} — use when mobile inset comes from a parent `px-2`. */
export const STAMP_BLEED_LG = "lg:p-2 lg:-m-2";

/** Top-only bleed — matches hero face top in a `py-8` lane without horizontal `-m-2`. */
export const STAMP_BLEED_TOP = "-mt-2 pt-2";

/** Bleed room on a shared masonry / grid container (no negative margin). */
export const STAMP_BLEED_INSET = "p-2";
