/**
 * Canvas2D shape renderers for individual particles.
 *
 * `renderParticle`      – general-purpose (all shapes, non-label path)
 * `renderLabelParticle` – optimised fast path for label-based text shapes
 *                         (avoids switch overhead, deduplicates ctx.font)
 */

import type { Shape } from "./particle-types";

// ---------------------------------------------------------------------------
// General-purpose renderer (used for non-label shapes)
// ---------------------------------------------------------------------------

export function renderParticle(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  x: number,
  y: number,
  radius: number,
  char: string,
  label?: string,
  labelExpanded?: boolean
): void {
  switch (shape) {
    case "circle":
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "x": {
      const s = radius * 0.8;
      ctx.lineWidth = Math.max(1, radius * 0.35);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - s, y - s);
      ctx.lineTo(x + s, y + s);
      ctx.moveTo(x + s, y - s);
      ctx.lineTo(x - s, y + s);
      ctx.stroke();
      break;
    }
    case "rounded-square": {
      const half = radius * 0.85;
      const corner = radius * 0.25;
      ctx.beginPath();
      ctx.roundRect(x - half, y - half, half * 2, half * 2, corner);
      ctx.fill();
      break;
    }
    case "hexagon": {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const hx = x + radius * Math.cos(angle);
        const hy = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "uppercase": {
      const fontSize = radius * 2.5;
      ctx.font = `900 ${fontSize}px Arial Black,sans-serif`;
      ctx.fillText(char, x, y);
      break;
    }
    case "mono-uppercase": {
      const fontSize = radius * 2.8;
      ctx.font = `900 ${fontSize}px Courier New,monospace`;
      ctx.fillText(char, x, y);
      break;
    }
    case "lowercase": {
      const fontSize = radius * 2.5;
      ctx.font = `900 ${fontSize}px Georgia,serif`;
      ctx.fillText(char.toLowerCase(), x, y);
      break;
    }
    case "label": {
      const fontSize = radius * 2.5;
      ctx.font = `900 ${fontSize}px Arial Black,sans-serif`;
      if (!labelExpanded) {
        ctx.fillText(char, x, y);
      } else {
        const word = (label ?? char).replace(/\s/g, "").toUpperCase();
        const firstCharW = ctx.measureText(char).width;
        ctx.textAlign = "left";
        ctx.fillText(word, x - firstCharW / 2, y);
        ctx.textAlign = "center";
      }
      break;
    }
    case "label-zh": {
      const fontSize = radius * 2.5;
      ctx.font = `900 ${fontSize}px "Noto Sans TC","Microsoft JhengHei",sans-serif`;
      ctx.fillText(char, x, y);
      break;
    }
    case "label-icon": {
      const fontSize = radius * 2.5;
      ctx.font = `900 ${fontSize}px "Font Awesome 7 Free"`;
      ctx.fillText(char, x, y);
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Inlined label renderer (hot path, minimises ctx.font changes)
// ---------------------------------------------------------------------------

export interface LabelRendererState {
  lastFontSize: number;
  lastFontType: "label" | "label-zh" | "label-icon" | "";
}

export function createLabelRendererState(): LabelRendererState {
  return { lastFontSize: -1, lastFontType: "" };
}

/**
 * Draws a label-based particle at the origin (caller must translate/rotate).
 * Caches font setting across calls to avoid redundant ctx.font changes.
 */
export function renderLabelParticle(
  ctx: CanvasRenderingContext2D,
  state: LabelRendererState,
  shape: Shape,
  radius: number,
  ch: string,
  label: string | undefined,
  expanded: boolean
): void {
  const fontSize = radius * 2.5;
  const fontSizeRounded = fontSize | 0;
  const fontType = shape as "label" | "label-zh" | "label-icon";
  if (fontSizeRounded !== state.lastFontSize || fontType !== state.lastFontType) {
    state.lastFontSize = fontSizeRounded;
    state.lastFontType = fontType;
    if (shape === "label-zh") {
      ctx.font = `900 ${fontSizeRounded}px "Noto Sans TC","Microsoft JhengHei",sans-serif`;
    } else if (shape === "label-icon") {
      ctx.font = `900 ${fontSizeRounded}px "Font Awesome 7 Free"`;
    } else {
      ctx.font = `900 ${fontSizeRounded}px Arial Black,sans-serif`;
    }
  }
  if (!expanded) {
    ctx.fillText(ch, 0, 0);
  } else {
    const word = (label ?? ch).replace(/\s/g, "").toUpperCase();
    const firstCharW = ctx.measureText(ch).width;
    ctx.textAlign = "left";
    ctx.fillText(word, -firstCharW / 2, 0);
    ctx.textAlign = "center";
  }
}
