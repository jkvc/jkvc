/**
 * Shared sizing tokens for small editorial controls (circle icon buttons,
 * pills). Centralizing these keeps a category pill and an inline icon button
 * visually aligned at the same `size` — same height, same baseline — so they
 * compose cleanly in a row.
 *
 * - `square` — w-N h-N for circular controls (icon buttons).
 * - `height` — h-N for content-sized controls (pills); width is intrinsic.
 * - `pillPaddingX` — horizontal padding paired with `height` so a pill at the
 *   same size as a circle reads as the stadium-equivalent of the same chip.
 * - `circleIcon` — default glyph size for `IconCircleButton`.
 */

export type ControlSize = "xs" | "sm" | "md";

interface SizeSpec {
    square: string;
    height: string;
    pillPaddingX: string;
    circleIcon: string;
}

export const CONTROL_SIZE: Record<ControlSize, SizeSpec> = {
    xs: { square: "w-7 h-7", height: "h-7", pillPaddingX: "px-3.5", circleIcon: "text-[11px]" },
    sm: { square: "w-9 h-9", height: "h-9", pillPaddingX: "px-4", circleIcon: "text-[13px]" },
    md: { square: "w-10 h-10", height: "h-10", pillPaddingX: "px-5", circleIcon: "text-[14px]" },
};
