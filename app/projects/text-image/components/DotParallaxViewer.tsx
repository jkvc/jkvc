"use client";

import "@fortawesome/fontawesome-free/css/all.min.css";
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
  charZh: string;
  charIcon: string;
  label?: string;
  rotation: number;
}

type Shape =
  | "circle"
  | "x"
  | "rounded-square"
  | "hexagon"
  | "uppercase"
  | "mono-uppercase"
  | "lowercase"
  | "label"
  | "label-zh"
  | "label-icon";

const SHAPES: { id: Shape; label: string; title: string; fontClass?: string; needsSegments?: boolean }[] = [
  { id: "circle", label: "●", title: "Circle" },
  { id: "x", label: "✕", title: "X" },
  { id: "rounded-square", label: "▢", title: "Rounded square" },
  { id: "hexagon", label: "⬡", title: "Hexagon" },
  { id: "uppercase", label: "A", title: "Random uppercase (sans-serif)", fontClass: "font-sans font-bold" },
  { id: "mono-uppercase", label: "M", title: "Random uppercase (monospace)", fontClass: "font-mono font-bold" },
  { id: "lowercase", label: "a", title: "Random lowercase (serif)", fontClass: "font-serif font-bold italic" },
  { id: "label", label: "Seg", title: "Segmentation label (sans-serif)", fontClass: "font-sans font-bold", needsSegments: true },
  { id: "label-zh", label: "文", title: "Segmentation label (Traditional Chinese)", needsSegments: true },
  { id: "label-icon", label: "Ico", title: "Segmentation label (icons)", fontClass: "font-sans font-bold", needsSegments: true },
];

const LABEL_ZH_MAP: Record<string, string> = {
  wall: "壁", building: "樓", sky: "空", floor: "地", tree: "木",
  ceiling: "頂", road: "路", bed: "床", windowpane: "窗", grass: "草",
  cabinet: "櫃", sidewalk: "徑", person: "人", earth: "土", door: "門",
  table: "桌", mountain: "山", plant: "卉", curtain: "簾", chair: "椅",
  car: "車", water: "水", painting: "畫", sofa: "沙", shelf: "架",
  house: "宅", sea: "海", mirror: "鏡", rug: "毯", field: "野",
  armchair: "椅", seat: "座", fence: "籬", desk: "桌", rock: "岩",
  wardrobe: "衣", lamp: "燈", bathtub: "浴", railing: "欄", cushion: "墊",
  base: "基", box: "箱", column: "柱", signboard: "牌", chest: "箱",
  counter: "檯", sand: "沙", sink: "池", skyscraper: "廈", fireplace: "爐",
  refrigerator: "冰", grandstand: "臺", path: "徑", stairs: "梯", runway: "道",
  screen: "幕", stairway: "階", river: "川", bridge: "橋", bookcase: "櫃",
  blind: "簾", "coffee table": "几", toilet: "廁", flower: "花", book: "書",
  hill: "丘", bench: "凳", countertop: "檯", stove: "灶", palm: "椰",
  "kitchen island": "島", computer: "機", "swivel chair": "轉", boat: "舟",
  bar: "酒", arcade: "廊", hovel: "舍", bus: "巴", towel: "巾",
  light: "光", truck: "卡", tower: "塔", chandelier: "燭", awning: "篷",
  streetlight: "燈", booth: "亭", television: "螢", airplane: "飛", "dirt track": "泥",
  apparel: "衣", pole: "桿", land: "陸", bannister: "扶", escalator: "梯",
  ottoman: "墩", bottle: "瓶", buffet: "餐", poster: "報", stage: "臺",
  van: "廂", ship: "船", fountain: "泉", "conveyer belt": "帶", canopy: "幕",
  washer: "洗", plaything: "玩", pool: "池", stool: "凳", barrel: "桶",
  basket: "籃", waterfall: "瀑", tent: "帳", bag: "包", minibike: "摩",
  cradle: "搖", oven: "烤", ball: "球", food: "食", step: "階",
  tank: "罐", trade: "市", microwave: "微", pot: "壺", animal: "獸",
  bicycle: "騎", lake: "湖", dishwasher: "碗", blanket: "被", sculpture: "雕",
  hood: "罩", sconce: "燭", vase: "瓶", "traffic light": "燈", tray: "盤",
  ashcan: "桶", fan: "扇", pier: "埠", "crt screen": "幕", plate: "碟",
  monitor: "幕", "bulletin board": "榜", shower: "淋", radiator: "暖", glass: "杯",
  clock: "鐘", flag: "旗",
};

function labelToZh(label: string): string {
  return LABEL_ZH_MAP[label] ?? "文";
}

const LABEL_ICON_MAP: Record<string, string> = {
  wall: "\uf0c8", building: "\uf1ad", sky: "\uf0c2", floor: "\uf0c8", tree: "\uf1bb",
  ceiling: "\uf0c8", road: "\uf018", bed: "\uf236", windowpane: "\uf0c8", grass: "\uf4d8",
  cabinet: "\uf0c8", sidewalk: "\uf018", person: "\uf183", earth: "\uf0ac", door: "\uf52b",
  table: "\uf0ce", mountain: "\uf6fc", plant: "\uf4d8", curtain: "\uf0c8", chair: "\uf6c0",
  car: "\uf1b9", water: "\uf043", painting: "\uf03e", sofa: "\uf4b8", shelf: "\uf0c8",
  house: "\uf015", sea: "\uf773", mirror: "\uf0c8", rug: "\ue569", field: "\uf06c",
  armchair: "\uf6c0", seat: "\uf6c0", fence: "\uf0c8", desk: "\uf0ce", rock: "\uf6fc",
  wardrobe: "\uf0c8", lamp: "\uf0eb", bathtub: "\uf2cd", railing: "\uf0c8", cushion: "\uf0c8",
  base: "\uf0c8", box: "\uf466", column: "\uf0c8", signboard: "\uf024", chest: "\uf466",
  counter: "\uf0ce", sand: "\uf0c8", sink: "\ue06d", skyscraper: "\uf1ad", fireplace: "\uf06d",
  refrigerator: "\uf2dc", grandstand: "\uf0c8", path: "\uf018", stairs: "\ue289", runway: "\uf018",
  screen: "\uf26c", stairway: "\ue289", river: "\uf773", bridge: "\ue4c8", bookcase: "\uf02d",
  blind: "\uf0c8", "coffee table": "\uf0ce", toilet: "\uf7d8", flower: "\uf4d8", book: "\uf02d",
  hill: "\uf6fc", bench: "\uf6c0", countertop: "\uf0ce", stove: "\uf06d", palm: "\uf1bb",
  "kitchen island": "\uf0ce", computer: "\uf390", "swivel chair": "\uf6c0", boat: "\uf21a",
  bar: "\uf0ce", arcade: "\uf557", hovel: "\uf015", bus: "\uf207", towel: "\uf0c8",
  light: "\uf0eb", truck: "\uf0d1", tower: "\uf66f", chandelier: "\uf0eb", awning: "\uf0c8",
  streetlight: "\uf0eb", booth: "\uf54e", television: "\uf26c", airplane: "\uf072",
  "dirt track": "\uf018", apparel: "\uf553", pole: "\uf0c8", land: "\uf0ac", bannister: "\uf0c8",
  escalator: "\ue289", ottoman: "\uf4b8", bottle: "\uf0c8", buffet: "\uf0ce", poster: "\uf03e",
  stage: "\uf0c8", van: "\uf0d1", ship: "\uf21a", fountain: "\uf043", "conveyer belt": "\uf0c8",
  canopy: "\uf0c8", washer: "\uf0c8", plaything: "\uf0c8", pool: "\uf5c5", stool: "\uf6c0",
  barrel: "\uf0c8", basket: "\uf0c8", waterfall: "\uf773", tent: "\ue57d", bag: "\uf0c8",
  minibike: "\uf21c", cradle: "\uf236", oven: "\uf06d", ball: "\uf0c8", food: "\uf2e7",
  step: "\ue289", tank: "\uf0c8", trade: "\uf54e", microwave: "\uf0c8", pot: "\uf7b6",
  animal: "\uf1b0", bicycle: "\uf206", lake: "\uf773", dishwasher: "\uf0c8", blanket: "\uf236",
  sculpture: "\uf5a6", hood: "\uf0c8", sconce: "\uf0eb", vase: "\uf0c8",
  "traffic light": "\uf0eb", tray: "\uf0c8", ashcan: "\uf0c8", fan: "\uf863", pier: "\ue4c8",
  "crt screen": "\uf26c", plate: "\uf0c8", monitor: "\uf390", "bulletin board": "\uf03e",
  shower: "\uf2cc", radiator: "\uf0c8", glass: "\uf4e3", clock: "\uf017", flag: "\uf024",
};

const FA_FALLBACK_ICON = "\uf005"; // star

function labelToIcon(label: string): string {
  return LABEL_ICON_MAP[label] ?? FA_FALLBACK_ICON;
}

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
    const labelIdx = labelMap ? labelMap.map[py * width + px] : 0;
    const label = labelIdx > 0 ? labelMap!.labels[labelIdx - 1] : undefined;
    const char = label
      ? label.replace(/\s/g, "").charAt(0).toUpperCase()
      : String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const charZh = label ? labelToZh(label) : "文";
    const charIcon = label ? labelToIcon(label) : FA_FALLBACK_ICON;
    const rotation = (Math.random() - 0.5) * (Math.PI / 2);

    dots.push({ x: px, y: py, depth, r: red, g: green, b: blue, char, charZh, charIcon, label, rotation });
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

      const labelIdx = labelMap ? labelMap.map[py * width + px] : 0;
      const label = labelIdx > 0 ? labelMap!.labels[labelIdx - 1] : undefined;
      const char = label
        ? label.replace(/\s/g, "").charAt(0).toUpperCase()
        : String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const charZh = label ? labelToZh(label) : "文";
      const charIcon = label ? labelToIcon(label) : FA_FALLBACK_ICON;
      const rotation = (Math.random() - 0.5) * (Math.PI / 2);
      dots.push({ x: px, y: py, depth, r, g, b, char, charZh, charIcon, label, rotation });
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

export default function DotParallaxViewer({ originalUrl, depthUrl, segments }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const imageSizeRef = useRef({ width: 0, height: 0 });

  const [shape, setShape] = useState<Shape>("circle");
  const [background, setBackground] = useState<Background>("white");
  const [sampling, setSampling] = useState<Sampling>("grid");
  const [dotsPerLongEdge, setDotsPerLongEdge] = useState(45);
  const [totalPoints, setTotalPoints] = useState(1800);
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
      shape === "uppercase" || shape === "mono-uppercase" || shape === "lowercase" || shape === "label" || shape === "label-zh" || shape === "label-icon";
    const isLabel = shape === "label" || shape === "label-zh" || shape === "label-icon";
    const isZh = shape === "label-zh";
    const isIcon = shape === "label-icon";
    const brightnessMul = background === "white" ? 0.8 : 1.2;
    const proximityThresholdSq = (Math.max(width, height) * 0.1) ** 2;
    const ctx = canvas.getContext("2d")!;

    // Pre-allocate typed arrays once (reused across frames)
    let oxArr = new Float32Array(0);
    let oyArr = new Float32Array(0);
    let distSqArr: Float32Array | null = null;

    // Pre-build color LUT: brightness-adjusted RGB for each dot
    // Rebuilt when dots change (via effect re-run)
    const dots = dotsRef.current;
    const len = dots.length;
    const colorR = new Uint8Array(len);
    const colorG = new Uint8Array(len);
    const colorB = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      colorR[i] = Math.min(255, dots[i].r * brightnessMul) | 0;
      colorG[i] = Math.min(255, dots[i].g * brightnessMul) | 0;
      colorB[i] = Math.min(255, dots[i].b * brightnessMul) | 0;
    }
    // Pre-allocate offset/distance arrays
    oxArr = new Float32Array(len);
    oyArr = new Float32Array(len);
    distSqArr = new Float32Array(len);

    // Pre-cache font string (for non-proximity dots where radius is uniform-ish)
    let lastFontSize = -1;

    function animate() {
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

      const cursorActive = mx !== 0 || my !== 0;
      const cursorX = cursorActive ? (mx + 1) / 2 * width : 0;
      const cursorY = cursorActive ? (my + 1) / 2 * height : 0;

      // Single pass: find closest + precompute offsets and squared distances
      let closestIdx = -1;
      let minDistSq = Infinity;

      for (let i = 0; i < len; i++) {
        const d = dots[i];
        const ox = mx * parallaxStrength * d.depth;
        const oy = my * parallaxStrength * d.depth;
        oxArr[i] = ox;
        oyArr[i] = oy;
        if (cursorActive) {
          const dx = cursorX - (d.x + ox);
          const dy = cursorY - (d.y + oy);
          const dSq = dx * dx + dy * dy;
          distSqArr![i] = dSq;
          if (dSq < minDistSq) {
            minDistSq = dSq;
            closestIdx = i;
          }
        }
      }

      // Draw all dots (skip closest, drawn last)
      lastFontSize = -1;
      for (let i = 0; i < len; i++) {
        if (i === closestIdx) continue;
        const d = dots[i];
        let radius = Math.max(0.5, baseSize + (d.depth - 0.5) * depthMul);

        if (cursorActive && distSqArr![i] < proximityThresholdSq) {
          radius *= 1 + (1 - distSqArr![i] / proximityThresholdSq);
        }

        const drawX = d.x + oxArr[i];
        const drawY = d.y + oyArr[i];
        ctx.fillStyle = `rgba(${colorR[i]},${colorG[i]},${colorB[i]},${opacity})`;
        ctx.strokeStyle = ctx.fillStyle;
        const ch = isIcon ? d.charIcon : isZh ? d.charZh : d.char;
        if (isLabel) {
          ctx.translate(drawX, drawY);
          ctx.rotate(d.rotation);
          drawShapeInline(ctx, shape, radius, ch, d.label, false);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        } else {
          drawShape(ctx, shape, drawX, drawY, radius, ch, d.label);
        }
      }

      // Draw the closest dot last (on top), enlarged
      if (closestIdx >= 0) {
        const d = dots[closestIdx];
        const drawX = d.x + oxArr[closestIdx];
        const drawY = d.y + oyArr[closestIdx];
        const radius = Math.max(0.5, baseSize + (d.depth - 0.5) * depthMul) * 3;
        if (isLabel) {
          ctx.shadowColor = background === "black" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)";
          ctx.shadowBlur = radius * 1.5;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
        ctx.fillStyle = `rgba(${colorR[closestIdx]},${colorG[closestIdx]},${colorB[closestIdx]},${opacity})`;
        ctx.strokeStyle = ctx.fillStyle;
        const ch = isIcon ? d.charIcon : isZh ? d.charZh : d.char;
        if (isLabel) {
          ctx.translate(drawX, drawY);
          ctx.rotate(d.rotation);
          // Only "label" shape expands to full word; zh and icon just enlarge
          drawShapeInline(ctx, shape, radius, ch, d.label, shape === "label");
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        } else {
          drawShape(ctx, shape, drawX, drawY, radius, ch, d.label);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    // Inlined text draw for label shapes -- avoids switch overhead and
    // skips ctx.font set when fontSize hasn't changed
    // Track last font type to avoid redundant font changes across shapes
    let lastFontType: "label" | "label-zh" | "label-icon" | "" = "";

    function drawShapeInline(
      ctx2: CanvasRenderingContext2D,
      sh: Shape,
      radius: number,
      ch: string,
      label: string | undefined,
      expanded: boolean
    ) {
      const fontSize = radius * 2.5;
      const fontSizeRounded = fontSize | 0;
      const fontType = sh as "label" | "label-zh" | "label-icon";
      if (fontSizeRounded !== lastFontSize || fontType !== lastFontType) {
        lastFontSize = fontSizeRounded;
        lastFontType = fontType;
        if (sh === "label-zh") {
          ctx2.font = `900 ${fontSizeRounded}px "Noto Sans TC","Microsoft JhengHei",sans-serif`;
        } else if (sh === "label-icon") {
          ctx2.font = `900 ${fontSizeRounded}px "Font Awesome 7 Free"`;
        } else {
          ctx2.font = `900 ${fontSizeRounded}px Arial Black,sans-serif`;
        }
      }
      if (!expanded) {
        ctx2.fillText(ch, 0, 0);
      } else {
        const word = (label ?? ch).replace(/\s/g, "").toUpperCase();
        const firstCharW = ctx2.measureText(ch).width;
        ctx2.textAlign = "left";
        ctx2.fillText(word, -firstCharW / 2, 0);
        ctx2.textAlign = "center";
      }
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
                  max={3000}
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
        className="relative w-full cursor-none"
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
