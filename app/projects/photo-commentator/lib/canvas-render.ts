import type { Box, Caption, Tunables } from "./types";
import { colorForBoxIndex } from "./colors";

/** Drawing primitives only — no DOM, no React. Pure on a 2D context. */

const FONT_FAMILY =
  "ui-sans-serif, system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif";

function pickTextColor(t: Tunables, luma: number | undefined): string {
  if (t.textColor === "white") return "#FFFFFF";
  if (t.textColor === "black") return "#0E0E0E";
  if (luma === undefined) return "#FFFFFF";
  return luma < 0.5 ? "#FFFFFF" : "#0E0E0E";
}

function strokeColor(textColor: string): string {
  return textColor === "#FFFFFF"
    ? "rgba(0,0,0,0.55)"
    : "rgba(255,255,255,0.65)";
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/** Greedy word-wrap. Returns the input split into lines that each fit within
 *  `maxWidth` when measured with the current `ctx.font`. Long single words
 *  fall through unchanged (we do not break inside a word — the captions are
 *  short enough that this never matters in practice). */
function wrapLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const out: string[] = [];
  let cur = words[0];
  for (let i = 1; i < words.length; i++) {
    const trial = `${cur} ${words[i]}`;
    if (ctx.measureText(trial).width <= maxWidth) {
      cur = trial;
    } else {
      out.push(cur);
      cur = words[i];
    }
  }
  out.push(cur);
  return out;
}

interface CaptionLayout {
  /** Wrapped lines after applying word-wrap inside the text box. */
  lines: string[];
  /** Text box left edge after image-edge clamping. */
  tbLeft: number;
  /** Text box right edge after clamping. */
  tbRight: number;
  /** Text box top edge after clamping (centered around `ay`). */
  tbTop: number;
  lineH: number;
  /** Where to position the FIRST line's baseline-y (textBaseline = "middle"). */
  firstLineY: number;
  /** X-coordinate to pass to fillText/strokeText, depending on textAlign. */
  textX: number;
}

/** 5% safe-area padding inside each image edge — the text box can never
 *  cross these guard rails, even if its anchor would push it past. */
const SAFE_PAD_FRAC = 0.05;

function layoutCaption(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  ax: number,
  ay: number,
  fontPx: number,
  imageW: number,
  imageH: number,
  tunables: Tunables
): CaptionLayout {
  const padX = imageW * SAFE_PAD_FRAC;
  const padY = imageH * SAFE_PAD_FRAC;
  const safeW = Math.max(1, imageW - 2 * padX);
  const safeH = Math.max(1, imageH - 2 * padY);

  const tbWidth = clamp(tunables.textBoxWidthFrac * imageW, 24, safeW);
  const wrapped = lines.flatMap((l) => wrapLine(ctx, l, tbWidth));

  // Horizontal: centered on ax, then clamped to safe area.
  const idealLeft = ax - tbWidth / 2;
  const tbLeft = clamp(idealLeft, padX, padX + safeW - tbWidth);
  const tbRight = tbLeft + tbWidth;

  // Vertical: total height of wrapped block centered on ay, clamped to
  // safe area.
  const lineH = Math.max(1, Math.round(fontPx * 1.18));
  const totalH = lineH * Math.max(1, wrapped.length);
  const idealTop = ay - totalH / 2;
  const tbTop = clamp(idealTop, padY, padY + Math.max(0, safeH - totalH));
  // First line's center-y (textBaseline = "middle").
  const firstLineY = tbTop + lineH / 2;

  let textX: number;
  switch (tunables.textAlign) {
    case "left":
      textX = tbLeft;
      break;
    case "right":
      textX = tbRight;
      break;
    case "center":
    default:
      textX = (tbLeft + tbRight) / 2;
      break;
  }

  return {
    lines: wrapped,
    tbLeft,
    tbRight,
    tbTop,
    lineH,
    firstLineY,
    textX,
  };
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  layout: CaptionLayout,
  fontPx: number,
  textColor: string,
  align: Tunables["textAlign"]
) {
  ctx.font = `600 ${fontPx}px ${FONT_FAMILY}`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";

  // Two-pass: stroke (halo) then fill, on each line. Cheaper and crisper than
  // a real shadow for short captions over busy photo backgrounds.
  ctx.lineWidth = Math.max(2, Math.round(fontPx * 0.18));
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.strokeStyle = strokeColor(textColor);
  for (let i = 0; i < layout.lines.length; i++) {
    ctx.strokeText(layout.lines[i], layout.textX, layout.firstLineY + i * layout.lineH);
  }

  ctx.fillStyle = textColor;
  for (let i = 0; i < layout.lines.length; i++) {
    ctx.fillText(layout.lines[i], layout.textX, layout.firstLineY + i * layout.lineH);
  }
}

export interface RenderInput {
  ctx: CanvasRenderingContext2D;
  image: HTMLImageElement;
  width: number;
  height: number;
  boxes: Box[];
  captions: Record<string, Caption>;
  tunables: Tunables;
  /** When set, the matching box is highlighted (debug "click to highlight"). */
  highlightBoxId?: string | null;
}

/** Single static draw — image + (optional) box overlay + (optional) anchor
 *  dots + completed captions with word-wrap, alignment, and image-edge
 *  clamping. Called every time inputs change. */
export function renderPhotoCommentator({
  ctx,
  image,
  width,
  height,
  boxes,
  captions,
  tunables,
  highlightBoxId,
}: RenderInput) {
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  // Box overlay (debug). Each box gets a rotating palette color, plus a
  // small zero-padded index label at the top-left corner so users can
  // correlate boxes with rows in the Inspector.
  if (tunables.showBoxes) {
    ctx.setLineDash([]);
    const labelFont = Math.max(16, Math.round(tunables.fontPx * 1.6));
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      const isHighlighted = highlightBoxId && b.id === highlightBoxId;
      const color = colorForBoxIndex(i);

      ctx.lineWidth = isHighlighted ? 5 : 3;
      ctx.strokeStyle = color;
      ctx.strokeRect(b.cx - b.w / 2, b.cy - b.h / 2, b.w, b.h);

      const label = i.toString().padStart(2, "0");
      const lx = b.cx - b.w / 2 + Math.max(3, labelFont * 0.25);
      const ly = b.cy - b.h / 2 + Math.max(3, labelFont * 0.25);

      ctx.font = `700 ${labelFont}px ${FONT_FAMILY}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = color;
      ctx.fillText(label, lx, ly);
    }
  }

  // Captions.
  for (const b of boxes) {
    const c = captions[b.id];
    if (!c || c.status !== "complete" || c.lines.length === 0) continue;

    const ax = b.cx + tunables.textAnchorOffsetX * b.w;
    const ay = b.cy + tunables.textAnchorOffsetY * b.h;
    const color = pickTextColor(tunables, c.meanLuma);

    // Set font BEFORE measuring for wrap.
    ctx.font = `600 ${tunables.fontPx}px ${FONT_FAMILY}`;
    const layout = layoutCaption(
      ctx,
      c.lines,
      ax,
      ay,
      tunables.fontPx,
      width,
      height,
      tunables
    );
    drawCaption(ctx, layout, tunables.fontPx, color, tunables.textAlign);

    if (tunables.showAnchors) {
      ctx.beginPath();
      ctx.arc(ax, ay, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 193, 50, 0.95)";
      ctx.fill();
    }
  }
}
