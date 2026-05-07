/** Photo Commentator — shared types.
 *
 *  Pipeline:
 *    1. upload + center-crop+resize to CANVAS_SIZE on the client
 *    2. sample N axis-aligned square boxes (farthest-point + AABB separation)
 *    3. POST /theme  (full image)        → tone string
 *    4. POST /comment x N (per-box crop) → 1..maxLines short lines
 *    5. canvas: draw image + each completed caption near its box anchor
 */

export type Status = "idle" | "running" | "complete" | "error";

/** Axis-aligned rectangle in canvas pixel space (cx,cy = center). */
export interface Rect {
  cx: number;
  cy: number;
  w: number;
  h: number;
}

/** A single sampled box. The LLM is shown the FULL image with a green
 *  rectangle drawn around this box and asked to caption the boxed region —
 *  no per-box cropping, so the model has full global context. */
export interface Box extends Rect {
  id: string;
}

/** Per-box caption record. */
export interface Caption {
  status: Status;
  lines: string[];
  /** Cached mean luma (0..1) of the underlying image inside the box.
   *  Computed once when the image first loads; used by adaptive text color. */
  meanLuma?: number;
}

/** Knobs exposed in DebugPanel — single source of truth. */
export interface Tunables {
  // Box sampling
  numBoxes: number;
  /** min box edge as fraction of min(W, H). */
  minBoxFrac: number;
  /** max box edge as fraction of min(W, H). */
  maxBoxFrac: number;
  /** AABB separation passes after sampling. */
  separationIters: number;

  // LLM
  maxLines: number;
  maxWordsPerLine: number;
  themeSystemPrompt: string;
  commentSystemPrompt: string;

  // Render
  fontPx: number;
  /** Text anchor offset from box center, as fraction of box edge. */
  textAnchorOffsetX: number;
  textAnchorOffsetY: number;
  /** Width of the text wrap box as a fraction of image width. The text box is
   *  centered horizontally on (box.cx + offsetX*box.w) but clamped so it
   *  never exits the image bounds. */
  textBoxWidthFrac: number;
  /** Text alignment within the (fixed-width) text box. */
  textAlign: "left" | "center" | "right";
  showBoxes: boolean;
  showAnchors: boolean;
  textColor: "auto" | "white" | "black";
}

/** Top-level orchestrator state. */
export interface ProcessingState {
  originalImageUrl: string | null;
  boxes: Box[];
  theme: string | null;
  /** Keyed by Box.id. */
  captions: Record<string, Caption>;

  themeStatus: Status;
  /** Aggregate of per-box statuses (running while any box is running, etc.). */
  overallStatus: Status;
  error: string | null;
}

/** Persisted gallery item (Vercel Blob + Redis). */
export interface GalleryItem {
  id: string;
  createdAt: string;
  thumbnailUrl: string;
  originalUrl: string;
  theme: string;
  boxes: Box[];
  captions: { boxId: string; lines: string[] }[];
  tunables: Tunables;
}
