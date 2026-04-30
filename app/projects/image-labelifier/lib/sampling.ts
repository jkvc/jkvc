/**
 * Particle sampling algorithms — generate Particle arrays from image data.
 *
 * Two strategies:
 *   - Grid: uniform spacing along both axes
 *   - Depth-weighted: CDF inversion sampling biased by depth
 */

import type { Particle, LabelMap } from "./particle-types";
import type { SegmentResult } from "./types";
import { labelToZh, labelToIcon, FA_FALLBACK_ICON } from "./label-maps";
import { loadImage } from "./image-utils";

// ---------------------------------------------------------------------------
// Label map decoder (segmentation masks → per-pixel label index)
// ---------------------------------------------------------------------------

export async function decodeSegmentationMasks(
  segments: SegmentResult[],
  width: number,
  height: number
): Promise<LabelMap> {
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

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function particleFromPixel(
  origData: ImageData,
  depthData: ImageData,
  px: number,
  py: number,
  labelMap?: LabelMap | null
): Particle {
  const { width } = origData;
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
  return { x: px, y: py, depth, r, g, b, char, charZh, charIcon, label, rotation };
}

// ---------------------------------------------------------------------------
// Grid sampling
// ---------------------------------------------------------------------------

export function sampleParticlesGrid(
  origData: ImageData,
  depthData: ImageData,
  dotsPerLongEdge: number,
  labelMap?: LabelMap | null
): Particle[] {
  const { width, height } = origData;
  const longerEdge = Math.max(width, height);
  const spacing = longerEdge / dotsPerLongEdge;
  const particles: Particle[] = [];

  const halfSpacing = spacing / 2;
  for (let y = halfSpacing; y < height; y += spacing) {
    for (let x = halfSpacing; x < width; x += spacing) {
      const px = Math.round(x);
      const py = Math.round(y);
      if (px >= width || py >= height) continue;
      particles.push(particleFromPixel(origData, depthData, px, py, labelMap));
    }
  }

  // Sort far-to-near so near particles draw on top
  particles.sort((a, b) => a.depth - b.depth);
  return particles;
}

// ---------------------------------------------------------------------------
// Depth-weighted sampling (CDF inversion)
// ---------------------------------------------------------------------------

/**
 * Each pixel's sampling probability ∝ depth^bias.
 * bias=0 → uniform, bias=1 → linear, bias>1 → strongly favors near pixels.
 */
export function sampleParticlesWeighted(
  origData: ImageData,
  depthData: ImageData,
  totalPoints: number,
  depthBias: number,
  labelMap?: LabelMap | null
): Particle[] {
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
  const particles: Particle[] = [];
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

    particles.push(particleFromPixel(origData, depthData, px, py, labelMap));
  }

  particles.sort((a, b) => a.depth - b.depth);
  return particles;
}

// ---------------------------------------------------------------------------
// Default parameter helpers
// ---------------------------------------------------------------------------

export function defaultBaseSize(spacing: number) {
  return Math.round(spacing * 0.365 * 10) / 10;
}

export function defaultDepthMul(spacing: number) {
  return Math.round(spacing * 0.41 * 10) / 10;
}
