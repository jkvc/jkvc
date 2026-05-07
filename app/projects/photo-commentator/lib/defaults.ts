import type { Tunables } from "./types";
import { THEME_SYSTEM, COMMENT_SYSTEM } from "./prompts";

/** Cap for the uploaded image's longest edge in canvas / image-pixel space.
 *  Aspect ratio is always preserved — short edge stays in proportion. The
 *  canvas is rendered at the resulting (W, H), then CSS scales it to fill
 *  the column width. Boxes, font, and crops are sized in this same space. */
export const MAX_LONGEST_EDGE = 768;

/** Longest-edge size of the full-image-with-box overlay sent to /comment.
 *  The LLM gets global context (the whole image) plus a bright green box
 *  around the region to caption, so we keep this at the same scale as the
 *  uploaded canvas — no further downsizing needed for caption quality. */
export const COMMENT_IMAGE_PX = MAX_LONGEST_EDGE;

/** Longest-edge size of the full-image thumbnail sent to /theme. */
export const THEME_RESIZE_PX = 512;

/** Stroke width of the green LLM-input box, as a fraction of min(W,H).
 *  Floor at 6 px to survive JPEG compression at lower resolutions. */
export const COMMENT_BOX_STROKE_FRAC = 0.012;

export const DEFAULT_TUNABLES: Tunables = {
  // Sampling
  numBoxes: 6,
  minBoxFrac: 0.2,
  maxBoxFrac: 0.4,
  separationIters: 20,

  // LLM
  maxLines: 2,
  maxWordsPerLine: 8,
  themeSystemPrompt: THEME_SYSTEM,
  commentSystemPrompt: COMMENT_SYSTEM,

  // Render
  fontPx: 12,
  textAnchorOffsetX: -0.01,
  textAnchorOffsetY: 0,
  textBoxWidthFrac: 0.3,
  textAlign: "left",
  showBoxes: true,
  showAnchors: true,
  textColor: "auto",
};

/** Hard caps applied in the API routes to defend against runaway debug
 *  values. Kept loose; defense in depth, not UX. */
export const HARD_LIMITS = {
  maxLines: 3,
  maxWordsPerLine: 12,
  numBoxes: 10,
} as const;
