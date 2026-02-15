"use client";

import {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import type {
  TextImageData,
  NormalizedMousePosition,
  PreRenderedLayer,
} from "../lib/types";
import { preRenderLayers, compositeWithParallax } from "../lib/canvas-renderer";

export interface ParallaxCanvasHandle {
  getSnapshot: () => Promise<Blob | null>;
}

interface Props {
  data: TextImageData;
}

const ParallaxCanvas = forwardRef<ParallaxCanvasHandle, Props>(
  ({ data }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const layersRef = useRef<PreRenderedLayer[]>([]);
    const mousePosRef = useRef<NormalizedMousePosition>({ x: 0, y: 0 });
    const rafRef = useRef<number>(0);
    const [parallaxEnabled, setParallaxEnabled] = useState(true);

    useEffect(() => {
      layersRef.current = preRenderLayers(data);
    }, [data]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = data.width;
      canvas.height = data.height;

      const config = { maxShift: 20, enabled: parallaxEnabled };

      function animate() {
        compositeWithParallax(
          canvas!,
          layersRef.current,
          mousePosRef.current,
          config
        );
        rafRef.current = requestAnimationFrame(animate);
      }
      rafRef.current = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(rafRef.current);
    }, [data, parallaxEnabled]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mousePosRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
      };
    }, []);

    const handleMouseLeave = useCallback(() => {
      mousePosRef.current = { x: 0, y: 0 };
    }, []);

    useImperativeHandle(ref, () => ({
      getSnapshot: async () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      },
    }));

    return (
      <div className="flex flex-col gap-3">
        <div
          ref={containerRef}
          className="relative w-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <canvas ref={canvasRef} className="w-full h-auto rounded-lg" />
        </div>
        <label className="flex items-center gap-2 text-xs text-base-content/50 cursor-pointer w-fit">
          <input
            type="checkbox"
            className="checkbox checkbox-xs"
            checked={parallaxEnabled}
            onChange={(e) => setParallaxEnabled(e.target.checked)}
          />
          Parallax
        </label>
      </div>
    );
  }
);

ParallaxCanvas.displayName = "ParallaxCanvas";
export default ParallaxCanvas;
