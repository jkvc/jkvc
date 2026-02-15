"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  originalUrl: string;
  depthUrl: string;
}

interface Dot {
  x: number;
  y: number;
  depth: number;
  r: number;
  g: number;
  b: number;
}

function loadImage(
  src: string,
  crossOrigin?: string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getImageData(img: HTMLImageElement, w: number, h: number): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

function computeDots(
  origData: ImageData,
  depthData: ImageData,
  dotsPerLongEdge: number
): Dot[] {
  const { width, height } = origData;
  const longerEdge = Math.max(width, height);
  const spacing = longerEdge / dotsPerLongEdge;
  const dots: Dot[] = [];

  const halfSpacing = spacing / 2;
  for (let y = halfSpacing; y < height; y += spacing) {
    for (let x = halfSpacing; x < width; x += spacing) {
      const px = Math.round(x);
      const py = Math.round(y);
      if (px >= width || py >= height) continue;

      const idx = (py * width + px) * 4;
      const r = origData.data[idx];
      const g = origData.data[idx + 1];
      const b = origData.data[idx + 2];
      const depth = depthData.data[idx] / 255;

      dots.push({ x: px, y: py, depth, r, g, b });
    }
  }

  // Sort far-to-near so near dots draw on top
  dots.sort((a, b) => a.depth - b.depth);
  return dots;
}

function defaultBaseSize(spacing: number) {
  return Math.round(spacing * 0.3 * 10) / 10;
}

function defaultDepthMul(spacing: number) {
  return Math.round(spacing * 0.8 * 10) / 10;
}

export default function DotParallaxViewer({ originalUrl, depthUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const imageSizeRef = useRef({ width: 0, height: 0 });

  const [dotsPerLongEdge, setDotsPerLongEdge] = useState(50);
  const [baseSize, setBaseSize] = useState(4.6);
  const [depthMul, setDepthMul] = useState(12.3);
  const [parallaxStrength, setParallaxStrength] = useState(20);
  const [opacity, setOpacity] = useState(1.0);
  const [loaded, setLoaded] = useState(false);

  const origDataRef = useRef<ImageData | null>(null);
  const depthDataRef = useRef<ImageData | null>(null);

  // Load images once
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);

    (async () => {
      try {
        const [origImg, depthImg] = await Promise.all([
          loadImage(originalUrl),
          loadImage(depthUrl, "anonymous"),
        ]);

        if (cancelled) return;

        const w = origImg.naturalWidth;
        const h = origImg.naturalHeight;
        imageSizeRef.current = { width: w, height: h };

        origDataRef.current = getImageData(origImg, w, h);
        depthDataRef.current = getImageData(depthImg, w, h);

        // Compute initial dots
        const spacing = Math.max(w, h) / 50;
        setBaseSize(defaultBaseSize(spacing));
        setDepthMul(defaultDepthMul(spacing));
        dotsRef.current = computeDots(
          origDataRef.current,
          depthDataRef.current,
          50
        );
        setLoaded(true);
      } catch {
        // CORS or load failure — silently skip
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [originalUrl, depthUrl]);

  // Recompute dots when density changes
  useEffect(() => {
    if (!origDataRef.current || !depthDataRef.current) return;
    dotsRef.current = computeDots(
      origDataRef.current,
      depthDataRef.current,
      dotsPerLongEdge
    );
    const spacing =
      Math.max(imageSizeRef.current.width, imageSizeRef.current.height) /
      dotsPerLongEdge;
    setBaseSize(defaultBaseSize(spacing));
    setDepthMul(defaultDepthMul(spacing));
  }, [dotsPerLongEdge]);

  // Animation loop
  useEffect(() => {
    if (!loaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = imageSizeRef.current;
    canvas.width = width;
    canvas.height = height;

    function animate() {
      const ctx = canvas!.getContext("2d")!;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;
      const dots = dotsRef.current;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const ox = mx * parallaxStrength * d.depth;
        const oy = my * parallaxStrength * d.depth;
        const radius = baseSize + d.depth * depthMul;

        ctx.beginPath();
        ctx.arc(d.x + ox, d.y + oy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${d.r},${d.g},${d.b},${opacity})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loaded, baseSize, depthMul, parallaxStrength, opacity]);

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

  if (!loaded) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner text-base-content/30" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-base-content/40 uppercase tracking-widest">
        Dot Parallax
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs text-base-content/60">
        <label className="flex flex-col gap-1">
          <span>Dots/edge: {dotsPerLongEdge}</span>
          <input
            type="range"
            min={10}
            max={200}
            step={1}
            value={dotsPerLongEdge}
            onChange={(e) => setDotsPerLongEdge(Number(e.target.value))}
            className="range range-xs range-primary"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span>Base size: {baseSize.toFixed(1)}</span>
          <input
            type="range"
            min={0.5}
            max={8}
            step={0.1}
            value={baseSize}
            onChange={(e) => setBaseSize(Number(e.target.value))}
            className="range range-xs range-primary"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span>Depth mul: {depthMul.toFixed(1)}</span>
          <input
            type="range"
            min={0}
            max={16}
            step={0.1}
            value={depthMul}
            onChange={(e) => setDepthMul(Number(e.target.value))}
            className="range range-xs range-primary"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span>Parallax: {parallaxStrength}</span>
          <input
            type="range"
            min={0}
            max={60}
            step={1}
            value={parallaxStrength}
            onChange={(e) => setParallaxStrength(Number(e.target.value))}
            className="range range-xs range-primary"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span>Opacity: {opacity.toFixed(1)}</span>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.1}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="range range-xs range-primary"
          />
        </label>
      </div>

      <div
        ref={containerRef}
        className="relative w-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-lg border border-base-300"
        />
      </div>
    </div>
  );
}
