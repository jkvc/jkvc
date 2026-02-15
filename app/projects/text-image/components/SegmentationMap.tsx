"use client";

import { useEffect, useRef } from "react";
import type { SegmentResult } from "../lib/types";

// Distinct colors for segmentation classes
const PALETTE: [number, number, number][] = [
  [230, 25, 75],   // red
  [60, 180, 75],   // green
  [255, 225, 25],  // yellow
  [0, 130, 200],   // blue
  [245, 130, 48],  // orange
  [145, 30, 180],  // purple
  [70, 240, 240],  // cyan
  [240, 50, 230],  // magenta
  [210, 245, 60],  // lime
  [250, 190, 212], // pink
  [0, 128, 128],   // teal
  [220, 190, 255], // lavender
  [170, 110, 40],  // brown
  [255, 250, 200], // beige
  [128, 0, 0],     // maroon
  [170, 255, 195], // mint
  [128, 128, 0],   // olive
  [255, 215, 180], // apricot
  [0, 0, 128],     // navy
  [128, 128, 128], // grey
];

interface Props {
  originalUrl: string;
  segments: SegmentResult[];
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function SegmentationMap({ originalUrl, segments }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const canvas = canvasRef.current;
      if (!canvas || segments.length === 0) return;

      // Load original image to get dimensions
      const origImg = await loadImage(originalUrl);
      if (cancelled) return;

      const w = origImg.naturalWidth;
      const h = origImg.naturalHeight;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d")!;

      // Draw original at reduced opacity as background
      ctx.drawImage(origImg, 0, 0);
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, w, h);

      // Decode and overlay each segment mask
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const [r, g, b] = PALETTE[i % PALETTE.length];

        // Decode base64 mask
        const maskImg = await loadImage(
          `data:image/png;base64,${seg.mask}`
        );
        if (cancelled) return;

        // Draw mask to a temp canvas to read pixels
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = w;
        tmpCanvas.height = h;
        const tmpCtx = tmpCanvas.getContext("2d")!;
        tmpCtx.drawImage(maskImg, 0, 0, w, h);
        const maskData = tmpCtx.getImageData(0, 0, w, h);

        // Create colored overlay from mask
        const overlay = ctx.createImageData(w, h);
        for (let p = 0; p < maskData.data.length; p += 4) {
          if (maskData.data[p] > 128) {
            overlay.data[p] = r;
            overlay.data[p + 1] = g;
            overlay.data[p + 2] = b;
            overlay.data[p + 3] = 140; // semi-transparent
          }
        }

        // Composite overlay
        const overlayCanvas = document.createElement("canvas");
        overlayCanvas.width = w;
        overlayCanvas.height = h;
        const overlayCtx = overlayCanvas.getContext("2d")!;
        overlayCtx.putImageData(overlay, 0, 0);
        ctx.drawImage(overlayCanvas, 0, 0);
      }

      // Draw labels
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const [r, g, b] = PALETTE[i % PALETTE.length];

        // Find centroid of this mask
        const maskImg = await loadImage(
          `data:image/png;base64,${seg.mask}`
        );
        if (cancelled) return;
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = w;
        tmpCanvas.height = h;
        const tmpCtx = tmpCanvas.getContext("2d")!;
        tmpCtx.drawImage(maskImg, 0, 0, w, h);
        const maskData = tmpCtx.getImageData(0, 0, w, h);

        let cx = 0, cy = 0, count = 0;
        for (let py = 0; py < h; py++) {
          for (let px = 0; px < w; px++) {
            const idx = (py * w + px) * 4;
            if (maskData.data[idx] > 128) {
              cx += px;
              cy += py;
              count++;
            }
          }
        }

        if (count > 0) {
          cx = Math.round(cx / count);
          cy = Math.round(cy / count);

          const fontSize = Math.max(10, Math.min(16, Math.sqrt(count) / 8));
          ctx.font = `bold ${fontSize}px sans-serif`;
          // Draw text with background
          const metrics = ctx.measureText(seg.label);
          const tw = metrics.width + 6;
          const th = fontSize + 4;
          ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
          ctx.beginPath();
          ctx.roundRect(cx - tw / 2, cy - th / 2, tw, th, 3);
          ctx.fill();
          // Text color: white or black based on luminance
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          ctx.fillStyle = lum > 150 ? "#000" : "#fff";
          ctx.fillText(seg.label, cx, cy);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [originalUrl, segments]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-auto rounded-lg border border-base-300"
    />
  );
}
