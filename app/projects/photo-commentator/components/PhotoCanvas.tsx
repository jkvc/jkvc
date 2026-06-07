"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import type { Box, Caption, Tunables } from "../lib/types";
import { loadImage } from "../lib/image-utils";
import { renderPhotoCommentator } from "../lib/canvas-render";
import { STAMP_CARD_SHADOW, STAMP_FACE } from "@/app/lib/stamp";

interface Props {
  imageUrl: string;
  boxes: Box[];
  captions: Record<string, Caption>;
  tunables: Tunables;
  highlightBoxId?: string | null;
  className?: string;
}

export interface PhotoCanvasHandle {
  /** Provide direct access to the underlying canvas element for export /
   *  save-to-gallery flows. */
  getCanvas: () => HTMLCanvasElement | null;
}

/** A static <canvas> that draws the input image plus overlay captions and
 *  optional debug visualizations. The canvas pixel buffer is sized to the
 *  source image's natural dimensions (preserving aspect ratio); CSS scales
 *  the element to fill the column width. Re-renders synchronously whenever
 *  inputs change. No animation. */
const PhotoCanvas = forwardRef<PhotoCanvasHandle, Props>(function PhotoCanvas(
  { imageUrl, boxes, captions, tunables, highlightBoxId, className = "" },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  // Track the currently-loaded URL so we don't reload on every prop change.
  const loadedUrlRef = useRef<string | null>(null);
  // Image natural dimensions; drives canvas buffer size + aspect-ratio.
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useImperativeHandle(ref, () => ({ getCanvas: () => canvasRef.current }), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Load (or reuse) the source image.
      if (loadedUrlRef.current !== imageUrl) {
        try {
          const img = await loadImage(imageUrl);
          if (cancelled) return;
          imageRef.current = img;
          loadedUrlRef.current = imageUrl;
          setDims({ w: img.naturalWidth, h: img.naturalHeight });
        } catch {
          return;
        }
      }
      const img = imageRef.current;
      if (!img) return;

      const w = img.naturalWidth;
      const h = img.naturalHeight;
      // Make sure the canvas buffer matches image natural size — important
      // because props may change before dims state has flushed on first load.
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;

      renderPhotoCommentator({
        ctx,
        image: img,
        width: w,
        height: h,
        boxes,
        captions,
        tunables,
        highlightBoxId,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [imageUrl, boxes, captions, tunables, highlightBoxId]);

  // NOTE: width/height attributes are set IMPERATIVELY inside the effect
  // (canvas.width = w; canvas.height = h) and intentionally NOT bound from
  // JSX. Re-rendering React with new width/height props would re-set those
  // attributes — and setting a canvas's width/height (even to the same
  // value) wipes its pixel buffer, which would erase the freshly-drawn
  // frame on the very next render after we call setDims.
  return (
    <div className={twMerge(STAMP_FACE, STAMP_CARD_SHADOW, "overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        style={
          dims
            ? { aspectRatio: `${dims.w} / ${dims.h}` }
            : undefined
        }
        className="w-full h-auto block"
      />
    </div>
  );
});

export default PhotoCanvas;
