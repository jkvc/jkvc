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
  char: string;
}

type Shape =
  | "circle"
  | "x"
  | "rounded-square"
  | "hexagon"
  | "uppercase"
  | "mono-uppercase"
  | "lowercase";

const SHAPES: { id: Shape; label: string; title: string; fontClass?: string }[] = [
  { id: "circle", label: "●", title: "Circle" },
  { id: "x", label: "✕", title: "X" },
  { id: "rounded-square", label: "▢", title: "Rounded square" },
  { id: "hexagon", label: "⬡", title: "Hexagon" },
  { id: "uppercase", label: "A", title: "Random uppercase (sans-serif)", fontClass: "font-sans font-bold" },
  { id: "mono-uppercase", label: "M", title: "Random uppercase (monospace)", fontClass: "font-mono font-bold" },
  { id: "lowercase", label: "a", title: "Random lowercase (serif)", fontClass: "font-serif font-bold italic" },
];

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

      const char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      dots.push({ x: px, y: py, depth, r, g, b, char });
    }
  }

  // Sort far-to-near so near dots draw on top
  dots.sort((a, b) => a.depth - b.depth);
  return dots;
}

function defaultBaseSize(spacing: number) {
  return Math.round(spacing * 0.365 * 10) / 10;
}

function defaultDepthMul(spacing: number) {
  return Math.round(spacing * 0.41 * 10) / 10;
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  x: number,
  y: number,
  radius: number,
  char: string
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
  }
}

export default function DotParallaxViewer({ originalUrl, depthUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const imageSizeRef = useRef({ width: 0, height: 0 });

  const [shape, setShape] = useState<Shape>("circle");
  const [dotsPerLongEdge, setDotsPerLongEdge] = useState(45);
  const [baseSize, setBaseSize] = useState(4.0);
  const [depthMul, setDepthMul] = useState(7.0);
  const [parallaxStrength, setParallaxStrength] = useState(40);
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
        const spacing = Math.max(w, h) / 45;
        setBaseSize(defaultBaseSize(spacing));
        setDepthMul(defaultDepthMul(spacing));
        dotsRef.current = computeDots(
          origDataRef.current,
          depthDataRef.current,
          45
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

    const isTextShape =
      shape === "uppercase" || shape === "mono-uppercase" || shape === "lowercase";

    function animate() {
      const ctx = canvas!.getContext("2d")!;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      if (isTextShape) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
      }

      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;
      const dots = dotsRef.current;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const ox = mx * parallaxStrength * d.depth;
        const oy = my * parallaxStrength * d.depth;
        const radius = baseSize + (d.depth - 0.5) * depthMul;
        const color = `rgba(${d.r},${d.g},${d.b},${opacity})`;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        drawShape(ctx, shape, d.x + ox, d.y + oy, radius, d.char);
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loaded, baseSize, depthMul, parallaxStrength, opacity, shape]);

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
        Particle Parallax
      </p>

      <div className="flex flex-wrap gap-1.5">
        {SHAPES.map((s) => (
          <button
            key={s.id}
            onClick={() => setShape(s.id)}
            className={`h-8 min-w-8 px-2.5 rounded-md text-sm transition-all ${
              shape === s.id
                ? "bg-base-content text-base-100"
                : "bg-base-200/60 text-base-content/40 hover:text-base-content/70 hover:bg-base-200"
            } ${s.fontClass ?? ""}`}
            title={s.title}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-base-content/60">
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
