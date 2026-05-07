import type { Box, Rect } from "./types";
import { colorForBoxIndex } from "./colors";

/** Load a URL into an HTMLImageElement. */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/** Resize the input image so its longest edge is at most `maxLongestEdge`,
 *  preserving aspect ratio. Images smaller than the cap are passed through
 *  unchanged (just re-encoded as JPEG). Returns the resized File plus a blob
 *  URL preview AND the resulting (width, height) in image pixels — these are
 *  the canvas-space coordinates that boxes / fonts / text widths are sized
 *  against. */
export function resizeToFit(
  file: File,
  maxLongestEdge: number
): Promise<{ file: File; url: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: srcW, naturalHeight: srcH } = img;
      const longest = Math.max(srcW, srcH);
      const scale = longest > maxLongestEdge ? maxLongestEdge / longest : 1;
      const dw = Math.max(1, Math.round(srcW * scale));
      const dh = Math.max(1, Math.round(srcH * scale));

      const canvas = document.createElement("canvas");
      canvas.width = dw;
      canvas.height = dh;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, dw, dh);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Resize encode failed"));
            return;
          }
          const out = new File([blob], "resized.jpg", { type: "image/jpeg" });
          resolve({
            file: out,
            url: URL.createObjectURL(blob),
            width: dw,
            height: dh,
          });
        },
        "image/jpeg",
        0.92
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

/** Render the whole image with ALL sampled boxes drawn on top, each with a
 *  rotating palette stroke and a 2-digit index label at its top-left. The
 *  output's longest edge is capped at `targetMaxEdge` (preserving aspect
 *  ratio). The LLM consumes this single image and writes one caption per
 *  indexed box.
 *
 *  The drawing primitives intentionally match the on-canvas debug overlay
 *  in `canvas-render.ts` so users can directly compare what they see to
 *  what the model sees. */
export function imageWithAllBoxes(
  image: HTMLImageElement,
  boxes: Box[],
  /** Image width in canvas-coord space (the same space `boxes` live in). */
  imageW: number,
  imageH: number,
  targetMaxEdge: number,
  /** Stroke width in canvas-coord pixels. */
  strokePx: number,
  /** Index label font size in canvas-coord pixels. */
  labelFontPx: number,
  filename = "image-with-boxes.jpg"
): Promise<File> {
  return new Promise((resolve, reject) => {
    const longest = Math.max(imageW, imageH);
    const scale = longest > targetMaxEdge ? targetMaxEdge / longest : 1;
    const dw = Math.max(1, Math.round(imageW * scale));
    const dh = Math.max(1, Math.round(imageH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = dw;
    canvas.height = dh;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas 2D context unavailable"));
      return;
    }
    ctx.drawImage(image, 0, 0, dw, dh);

    const sw = Math.max(2, Math.round(strokePx * scale));
    const lf = Math.max(12, Math.round(labelFontPx * scale));

    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      const color = colorForBoxIndex(i);

      const bx = (b.cx - b.w / 2) * scale;
      const by = (b.cy - b.h / 2) * scale;
      const bw = b.w * scale;
      const bh = b.h * scale;

      ctx.lineJoin = "miter";
      ctx.lineWidth = sw;
      ctx.strokeStyle = color;
      ctx.strokeRect(bx, by, bw, bh);

      const label = i.toString().padStart(2, "0");
      const lx = bx + Math.max(3, lf * 0.25);
      const ly = by + Math.max(3, lf * 0.25);

      ctx.font = `700 ${lf}px ui-sans-serif, system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = color;
      ctx.fillText(label, lx, ly);
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Box-overlay encode failed"));
          return;
        }
        resolve(new File([blob], filename, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9
    );
  });
}

/** Resize the full image so its longest edge is `targetMaxEdge`, returning a
 *  JPEG File. Used for the /theme call. */
export function resizeWhole(
  image: HTMLImageElement,
  targetMaxEdge: number,
  filename = "full.jpg"
): Promise<File> {
  return new Promise((resolve, reject) => {
    const longest = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = longest > targetMaxEdge ? targetMaxEdge / longest : 1;
    const dw = Math.max(1, Math.round(image.naturalWidth * scale));
    const dh = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = dw;
    canvas.height = dh;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas 2D context unavailable"));
      return;
    }
    ctx.drawImage(image, 0, 0, dw, dh);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Resize encode failed"));
          return;
        }
        resolve(new File([blob], filename, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9
    );
  });
}

/** Mean luma (0..1) of a rectangular region of an image, sampled on an
 *  off-screen canvas. Used to choose adaptive text color per box. */
export function meanLuma(
  image: HTMLImageElement,
  rect: Rect,
  imageW: number,
  imageH: number
): number {
  const sw = Math.max(1, Math.round(rect.w));
  const sh = Math.max(1, Math.round(rect.h));
  const sx = Math.max(0, Math.round(rect.cx - sw / 2));
  const sy = Math.max(0, Math.round(rect.cy - sh / 2));

  const scaleX = image.naturalWidth / imageW;
  const scaleY = image.naturalHeight / imageH;
  const ssx = Math.round(sx * scaleX);
  const ssy = Math.round(sy * scaleY);
  const ssw = Math.max(1, Math.round(sw * scaleX));
  const ssh = Math.max(1, Math.round(sh * scaleY));

  // Downsample to a tiny tile — we only need an average.
  const dw = Math.min(32, ssw);
  const dh = Math.min(32, ssh);

  const canvas = document.createElement("canvas");
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0.5;
  ctx.drawImage(image, ssx, ssy, ssw, ssh, 0, 0, dw, dh);

  let data: ImageData;
  try {
    data = ctx.getImageData(0, 0, dw, dh);
  } catch {
    return 0.5;
  }

  let sum = 0;
  const n = data.data.length / 4;
  for (let i = 0; i < data.data.length; i += 4) {
    const r = data.data[i] / 255;
    const g = data.data[i + 1] / 255;
    const b = data.data[i + 2] / 255;
    sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  return sum / n;
}

/** Export the given canvas as a PNG File. */
export function exportPng(
  canvas: HTMLCanvasElement,
  filename = "photo-commentator.png"
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("PNG encode failed"));
        return;
      }
      resolve(new File([blob], filename, { type: "image/png" }));
    }, "image/png");
  });
}
