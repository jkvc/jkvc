import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const SIZE = 768;
const K = 5;
const MAX_ITERS = 15;
const CENTROID_EPS = 1.0;
const SUBSAMPLE_STRIDE = 4;
// Fixed seed so the same image produces the same frames across runs
// (important for gallery reproducibility and debugging).
const PRNG_SEED = 0xc0ffee;

// ---------------------------------------------------------------------------
// PRNG
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Color space conversions
// ---------------------------------------------------------------------------

function srgbToLinear(c: number): number {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  const x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175;
  const z = rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041;
  const xn = 0.95047;
  const yn = 1.0;
  const zn = 1.08883;
  const f = (t: number) =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const fx = f(x / xn);
  const fy = f(y / yn);
  const fz = f(z / zn);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/**
 * Perceptual colorfulness in LAB. Black, white, and gray all return ~0
 * regardless of lightness; vivid colors return large values. Avoids the
 * HSV-saturation pathology where near-black tones get high "saturation"
 * from tiny channel differences.
 */
function labChroma(a: number, b: number): number {
  return Math.sqrt(a * a + b * b);
}

// ---------------------------------------------------------------------------
// K-means (in LAB)
// ---------------------------------------------------------------------------

function kmeans(
  samples: Float32Array,
  k: number,
  rand: () => number
): Float32Array {
  const n = samples.length / 3;
  const centroids = new Float32Array(k * 3);

  // k-means++ init: first centroid uniform random, subsequent weighted by D^2.
  const firstIdx = Math.floor(rand() * n);
  centroids[0] = samples[firstIdx * 3];
  centroids[1] = samples[firstIdx * 3 + 1];
  centroids[2] = samples[firstIdx * 3 + 2];

  const minDistSq = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const dl = samples[i * 3] - centroids[0];
    const da = samples[i * 3 + 1] - centroids[1];
    const db = samples[i * 3 + 2] - centroids[2];
    minDistSq[i] = dl * dl + da * da + db * db;
  }

  for (let c = 1; c < k; c++) {
    let total = 0;
    for (let i = 0; i < n; i++) total += minDistSq[i];
    let target = rand() * total;
    let pickIdx = 0;
    for (let i = 0; i < n; i++) {
      target -= minDistSq[i];
      if (target <= 0) {
        pickIdx = i;
        break;
      }
    }
    centroids[c * 3] = samples[pickIdx * 3];
    centroids[c * 3 + 1] = samples[pickIdx * 3 + 1];
    centroids[c * 3 + 2] = samples[pickIdx * 3 + 2];
    for (let i = 0; i < n; i++) {
      const dl = samples[i * 3] - centroids[c * 3];
      const da = samples[i * 3 + 1] - centroids[c * 3 + 1];
      const db = samples[i * 3 + 2] - centroids[c * 3 + 2];
      const dsq = dl * dl + da * da + db * db;
      if (dsq < minDistSq[i]) minDistSq[i] = dsq;
    }
  }

  // Lloyd's iterations
  const assignments = new Uint8Array(n);
  const sums = new Float64Array(k * 3);
  const counts = new Uint32Array(k);

  for (let iter = 0; iter < MAX_ITERS; iter++) {
    for (let i = 0; i < n; i++) {
      let best = 0;
      let bestDist = Infinity;
      for (let c = 0; c < k; c++) {
        const dl = samples[i * 3] - centroids[c * 3];
        const da = samples[i * 3 + 1] - centroids[c * 3 + 1];
        const db = samples[i * 3 + 2] - centroids[c * 3 + 2];
        const d = dl * dl + da * da + db * db;
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }
      assignments[i] = best;
    }
    sums.fill(0);
    counts.fill(0);
    for (let i = 0; i < n; i++) {
      const c = assignments[i];
      sums[c * 3] += samples[i * 3];
      sums[c * 3 + 1] += samples[i * 3 + 1];
      sums[c * 3 + 2] += samples[i * 3 + 2];
      counts[c]++;
    }
    let delta = 0;
    for (let c = 0; c < k; c++) {
      if (counts[c] === 0) continue;
      const nl = sums[c * 3] / counts[c];
      const na = sums[c * 3 + 1] / counts[c];
      const nb = sums[c * 3 + 2] / counts[c];
      const dl = nl - centroids[c * 3];
      const da = na - centroids[c * 3 + 1];
      const db = nb - centroids[c * 3 + 2];
      delta += Math.sqrt(dl * dl + da * da + db * db);
      centroids[c * 3] = nl;
      centroids[c * 3 + 1] = na;
      centroids[c * 3 + 2] = nb;
    }
    if (delta < CENTROID_EPS) break;
  }
  return centroids;
}

function assignAll(
  lab: Float32Array,
  centroids: Float32Array,
  k: number
): Uint8Array {
  const n = lab.length / 3;
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    let best = 0;
    let bestDist = Infinity;
    for (let c = 0; c < k; c++) {
      const dl = lab[i * 3] - centroids[c * 3];
      const da = lab[i * 3 + 1] - centroids[c * 3 + 1];
      const db = lab[i * 3 + 2] - centroids[c * 3 + 2];
      const d = dl * dl + da * da + db * db;
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    out[i] = best;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Mask encoding
// ---------------------------------------------------------------------------

async function clusterMaskPng(
  clusterLabels: Uint8Array,
  cluster: number,
  width: number,
  height: number
): Promise<{ mask: string; pixelCount: number }> {
  const buf = new Uint8Array(width * height);
  let pixelCount = 0;
  for (let i = 0; i < clusterLabels.length; i++) {
    if (clusterLabels[i] === cluster) {
      buf[i] = 255;
      pixelCount++;
    }
  }
  const png = await sharp(buf, {
    raw: { width, height, channels: 1 },
  })
    .png()
    .toBuffer();
  return { mask: png.toString("base64"), pixelCount };
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const imageFile = formData.get("image") as File | null;
  if (!imageFile) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await imageFile.arrayBuffer());

  const { data: rgb } = await sharp(buffer)
    .resize(SIZE, SIZE, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const numPixels = SIZE * SIZE;
  const lab = new Float32Array(numPixels * 3);
  for (let i = 0; i < numPixels; i++) {
    const [L, a, b] = rgbToLab(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]);
    lab[i * 3] = L;
    lab[i * 3 + 1] = a;
    lab[i * 3 + 2] = b;
  }

  const numSamples = Math.floor(numPixels / SUBSAMPLE_STRIDE);
  const samples = new Float32Array(numSamples * 3);
  for (let i = 0; i < numSamples; i++) {
    const src = i * SUBSAMPLE_STRIDE;
    samples[i * 3] = lab[src * 3];
    samples[i * 3 + 1] = lab[src * 3 + 1];
    samples[i * 3 + 2] = lab[src * 3 + 2];
  }

  const rand = mulberry32(PRNG_SEED);
  const centroids = kmeans(samples, K, rand);
  const clusterLabels = assignAll(lab, centroids, K);

  // One frame per cluster — all pixels of a given color reveal at once
  // (e.g. sky and water together if they share a cluster).
  const clusterMasks = await Promise.all(
    Array.from({ length: K }, async (_, c) => {
      const { mask, pixelCount } = await clusterMaskPng(
        clusterLabels,
        c,
        SIZE,
        SIZE
      );
      const chroma = labChroma(centroids[c * 3 + 1], centroids[c * 3 + 2]);
      return { mask, pixelCount, chroma };
    })
  );

  // Drop empty clusters (k-means may produce one if a centroid was orphaned).
  // Sort ascending by LAB chroma: neutrals (incl. black/white/gray) first,
  // vivid colors last.
  const segments = clusterMasks
    .filter((c) => c.pixelCount > 0)
    .sort((a, b) => a.chroma - b.chroma)
    .map((c) => ({
      label: "",
      mask: c.mask,
    }));

  return NextResponse.json({ segments });
}
