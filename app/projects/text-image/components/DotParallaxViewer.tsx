"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SegmentResult } from "../lib/types";

interface Props {
  originalUrl: string;
  depthUrl: string;
  segments?: SegmentResult[];
}

interface Dot {
  x: number;
  y: number;
  depth: number;
  r: number;
  g: number;
  b: number;
  char: string;
  label?: string;
}

type Shape =
  | "circle"
  | "x"
  | "rounded-square"
  | "hexagon"
  | "uppercase"
  | "mono-uppercase"
  | "lowercase"
  | "label";

const SHAPES: { id: Shape; label: string; title: string; fontClass?: string; needsSegments?: boolean }[] = [
  { id: "circle", label: "●", title: "Circle" },
  { id: "x", label: "✕", title: "X" },
  { id: "rounded-square", label: "▢", title: "Rounded square" },
  { id: "hexagon", label: "⬡", title: "Hexagon" },
  { id: "uppercase", label: "A", title: "Random uppercase (sans-serif)", fontClass: "font-sans font-bold" },
  { id: "mono-uppercase", label: "M", title: "Random uppercase (monospace)", fontClass: "font-mono font-bold" },
  { id: "lowercase", label: "a", title: "Random lowercase (serif)", fontClass: "font-serif font-bold italic" },
  { id: "label", label: "Seg", title: "Segmentation label (monospace)", fontClass: "font-mono font-bold", needsSegments: true },
];

type Background = "black" | "white";

const BACKGROUNDS: { id: Background; label: string }[] = [
  { id: "black", label: "Black" },
  { id: "white", label: "White" },
];

type Sampling = "grid" | "depth-weighted";

const SAMPLINGS: { id: Sampling; label: string }[] = [
  { id: "grid", label: "Grid" },
  { id: "depth-weighted", label: "Depth-weighted" },
];

interface LabelGrid {
  cols: number;
  rows: number;
  lines: string[];
}

const labelGridCache = new Map<string, LabelGrid>();

function labelToGrid(label: string): LabelGrid {
  const cached = labelGridCache.get(label);
  if (cached) return cached;
  const text = label.replace(/\s/g, "").toUpperCase();
  const n = text.length;
  if (n === 0) {
    const grid: LabelGrid = { cols: 1, rows: 1, lines: ["."] };
    labelGridCache.set(label, grid);
    return grid;
  }
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const lines: string[] = [];
  for (let i = 0; i < rows; i++) {
    lines.push(text.slice(i * cols, (i + 1) * cols));
  }
  const grid: LabelGrid = { cols, rows, lines };
  labelGridCache.set(label, grid);
  return grid;
}

async function buildLabelMap(
  segments: SegmentResult[],
  width: number,
  height: number
): Promise<{ map: Uint16Array; labels: string[] }> {
  const map = new Uint16Array(width * height);
  const labels = segments.map((s) => s.label);
  for (let i = 0; i < segments.length; i++) {
    const maskImg = await loadImage(
      `data:image/png;base64,${segments[i].mask}`
    );
    const tmp = document.createElement("canvas");
    tmp.width = width;
    tmp.height = height;
    const ctx = tmp.getContext("2d")!;
    ctx.drawImage(maskImg, 0, 0, width, height);
    const data = ctx.getImageData(0, 0, width, height).data;
    for (let p = 0; p < data.length; p += 4) {
      if (data[p] > 128) map[p / 4] = i + 1;
    }
  }
  return { map, labels };
}

/**
 * Depth-weighted random sampling using CDF inversion.
 * Each pixel's sampling probability ∝ depth^bias.
 * bias=0 → uniform, bias=1 → linear, bias>1 → strongly favors near pixels.
 */
function computeDotsDepthWeighted(
  origData: ImageData,
  depthData: ImageData,
  totalPoints: number,
  depthBias: number,
  labelMap?: { map: Uint16Array; labels: string[] } | null
): Dot[] {
  const { width, height } = origData;

  // Subsample every 2px for CDF construction (keeps memory reasonable)
  const step = 2;
  const cols = Math.ceil(width / step);
  const rows = Math.ceil(height / step);
  const n = cols * rows;
  const weights = new Float64Array(n);
  let totalWeight = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const px = col * step;
      const py = row * step;
      const idx = (py * width + px) * 4;
      const depth = depthData.data[idx] / 255;
      const w = Math.pow(depth + 0.01, depthBias); // epsilon avoids zero weight
      const i = row * cols + col;
      weights[i] = w;
      totalWeight += w;
    }
  }

  // Build CDF
  const cdf = new Float64Array(n);
  cdf[0] = weights[0] / totalWeight;
  for (let i = 1; i < n; i++) {
    cdf[i] = cdf[i - 1] + weights[i] / totalWeight;
  }

  // Sample via inverse CDF with binary search
  const dots: Dot[] = [];
  for (let s = 0; s < totalPoints; s++) {
    const r = Math.random();
    let lo = 0;
    let hi = n - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < r) lo = mid + 1;
      else hi = mid;
    }

    const col = lo % cols;
    const row = Math.floor(lo / cols);
    // Jitter within the step cell
    const px = Math.min(width - 1, col * step + Math.floor(Math.random() * step));
    const py = Math.min(height - 1, row * step + Math.floor(Math.random() * step));

    const idx = (py * width + px) * 4;
    const red = origData.data[idx];
    const green = origData.data[idx + 1];
    const blue = origData.data[idx + 2];
    const depth = depthData.data[idx] / 255;
    const char = String.fromCharCode(65 + Math.floor(Math.random() * 26));

    const labelIdx = labelMap ? labelMap.map[py * width + px] : 0;
    const label = labelIdx > 0 ? labelMap!.labels[labelIdx - 1] : undefined;

    dots.push({ x: px, y: py, depth, r: red, g: green, b: blue, char, label });
  }

  dots.sort((a, b) => a.depth - b.depth);
  return dots;
}

function createBlurredBackground(
  img: HTMLImageElement,
  w: number,
  h: number
): HTMLCanvasElement {
  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext("2d")!;
  ctx.filter = "blur(20px)";
  // Draw slightly oversized to avoid transparent edges from blur
  ctx.drawImage(img, -40, -40, w + 80, h + 80);
  ctx.filter = "none";
  return offscreen;
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
  dotsPerLongEdge: number,
  labelMap?: { map: Uint16Array; labels: string[] } | null
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
      const labelIdx = labelMap ? labelMap.map[py * width + px] : 0;
      const label = labelIdx > 0 ? labelMap!.labels[labelIdx - 1] : undefined;
      dots.push({ x: px, y: py, depth, r, g, b, char, label });
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
  char: string,
  label?: string
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
      const text = label ?? char;
      const grid = labelToGrid(text);
      const side = radius * 1.7;
      const charWidthRatio = 0.6;
      const fontSize = Math.min(
        side / (grid.cols * charWidthRatio),
        side / grid.rows
      );
      ctx.font = `900 ${fontSize}px Courier New,monospace`;
      const totalH = grid.rows * fontSize;
      const startY = y - totalH / 2 + fontSize / 2;
      for (let r = 0; r < grid.rows; r++) {
        ctx.fillText(grid.lines[r], x, startY + r * fontSize);
      }
      break;
    }
  }
}

export default function DotParallaxViewer({ originalUrl, depthUrl, segments }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const imageSizeRef = useRef({ width: 0, height: 0 });

  const [shape, setShape] = useState<Shape>("circle");
  const [background, setBackground] = useState<Background>("black");
  const [sampling, setSampling] = useState<Sampling>("grid");
  const [dotsPerLongEdge, setDotsPerLongEdge] = useState(45);
  const [totalPoints, setTotalPoints] = useState(3000);
  const [depthBias, setDepthBias] = useState(0.7);
  const [baseSize, setBaseSize] = useState(4.0);
  const [depthMul, setDepthMul] = useState(7.0);
  const [parallaxStrength, setParallaxStrength] = useState(70);
  const [opacity, setOpacity] = useState(1.0);
  const [loaded, setLoaded] = useState(false);
  const [labelMapReady, setLabelMapReady] = useState(false);

  const origDataRef = useRef<ImageData | null>(null);
  const depthDataRef = useRef<ImageData | null>(null);
  const blurredBgRef = useRef<HTMLCanvasElement | null>(null);
  const labelMapRef = useRef<{ map: Uint16Array; labels: string[] } | null>(null);

  const hasSegments = !!(segments && segments.length > 0);

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
        blurredBgRef.current = createBlurredBackground(origImg, w, h);

        // Compute initial dots (grid default)
        const spacing = Math.max(w, h) / 45;
        setBaseSize(defaultBaseSize(spacing));
        setDepthMul(defaultDepthMul(spacing));
        dotsRef.current = computeDots(
          origDataRef.current,
          depthDataRef.current,
          45
        );
        setLoaded(true);
        // Note: if sampling was already set to depth-weighted before load,
        // the recompute effect below will pick it up.
      } catch {
        // CORS or load failure — silently skip
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [originalUrl, depthUrl]);

  // Build label map when segments arrive
  useEffect(() => {
    if (!segments || segments.length === 0) {
      labelMapRef.current = null;
      setLabelMapReady(false);
      return;
    }
    const { width, height } = imageSizeRef.current;
    if (width === 0 || height === 0) return;

    let cancelled = false;
    (async () => {
      const result = await buildLabelMap(segments, width, height);
      if (cancelled) return;
      labelMapRef.current = result;
      setLabelMapReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [segments]);

  // Recompute dots when sampling params or label map change
  useEffect(() => {
    if (!origDataRef.current || !depthDataRef.current) return;
    if (sampling === "grid") {
      dotsRef.current = computeDots(
        origDataRef.current,
        depthDataRef.current,
        dotsPerLongEdge,
        labelMapRef.current
      );
      const spacing =
        Math.max(imageSizeRef.current.width, imageSizeRef.current.height) /
        dotsPerLongEdge;
      setBaseSize(defaultBaseSize(spacing));
      setDepthMul(defaultDepthMul(spacing));
    } else {
      dotsRef.current = computeDotsDepthWeighted(
        origDataRef.current,
        depthDataRef.current,
        totalPoints,
        depthBias,
        labelMapRef.current
      );
      setDepthMul(0.0);
    }
  }, [sampling, dotsPerLongEdge, totalPoints, depthBias, labelMapReady]);

  // Animation loop
  useEffect(() => {
    if (!loaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = imageSizeRef.current;
    canvas.width = width;
    canvas.height = height;

    const isTextShape =
      shape === "uppercase" || shape === "mono-uppercase" || shape === "lowercase" || shape === "label";

    function animate() {
      const ctx = canvas!.getContext("2d")!;
      ctx.clearRect(0, 0, width, height);
      if (blurredBgRef.current) {
        ctx.drawImage(blurredBgRef.current, 0, 0);
      }
      ctx.fillStyle = background === "white" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
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
        const radius = Math.max(0.5, baseSize + (d.depth - 0.5) * depthMul);
        const color = `rgba(${d.r},${d.g},${d.b},${opacity})`;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        drawShape(ctx, shape, d.x + ox, d.y + oy, radius, d.char, d.label);
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loaded, baseSize, depthMul, parallaxStrength, opacity, shape, background]);

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
    <div className="flex flex-col gap-6">
      <p className="text-xs text-base-content/40 uppercase tracking-widest">
        Particle Parallax
      </p>

      {/* Particle Shape */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-base-content/50 font-medium">Shape</p>
        <div className="flex flex-wrap gap-1.5">
          {SHAPES.map((s) => {
            const disabled = !!(s.needsSegments && !hasSegments);
            return (
              <button
                key={s.id}
                onClick={() => !disabled && setShape(s.id)}
                disabled={disabled}
                className={`h-8 min-w-8 px-2.5 rounded-md text-sm transition-all ${
                  disabled
                    ? "bg-base-200/30 text-base-content/20 cursor-not-allowed"
                    : shape === s.id
                      ? "bg-base-content text-base-100"
                      : "bg-base-200/60 text-base-content/40 hover:text-base-content/70 hover:bg-base-200"
                } ${s.fontClass ?? ""}`}
                title={disabled ? `${s.title} (needs segmentation data)` : s.title}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Background */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-base-content/50 font-medium">Background</p>
        <div className="flex flex-wrap gap-1.5">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => setBackground(bg.id)}
              className={`h-8 px-3 rounded-md text-xs transition-all ${
                background === bg.id
                  ? "bg-base-content text-base-100"
                  : "bg-base-200/60 text-base-content/40 hover:text-base-content/70 hover:bg-base-200"
              }`}
            >
              {bg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sampling */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-base-content/50 font-medium">Sampling</p>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLINGS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSampling(s.id)}
              className={`h-8 px-3 rounded-md text-xs transition-all ${
                sampling === s.id
                  ? "bg-base-content text-base-100"
                  : "bg-base-200/60 text-base-content/40 hover:text-base-content/70 hover:bg-base-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-base-content/60 mt-1">
          {sampling === "grid" ? (
            <label className="flex flex-col gap-1">
              <span>Dots/edge: {dotsPerLongEdge}</span>
              <input
                type="range"
                min={10}
                max={100}
                step={1}
                value={dotsPerLongEdge}
                onChange={(e) => setDotsPerLongEdge(Number(e.target.value))}
                className="range range-xs range-primary"
              />
            </label>
          ) : (
            <>
              <label className="flex flex-col gap-1">
                <span>Points: {totalPoints}</span>
                <input
                  type="range"
                  min={200}
                  max={8000}
                  step={100}
                  value={totalPoints}
                  onChange={(e) => setTotalPoints(Number(e.target.value))}
                  className="range range-xs range-primary"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span>Depth bias: {depthBias.toFixed(1)}</span>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.1}
                  value={depthBias}
                  onChange={(e) => setDepthBias(Number(e.target.value))}
                  className="range range-xs range-primary"
                />
              </label>
            </>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-base-content/50 font-medium">Options</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-base-content/60">
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
              max={150}
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
