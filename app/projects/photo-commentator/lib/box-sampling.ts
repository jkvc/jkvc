import type { Box, Rect, Tunables } from "./types";

/** Mulberry32 — deterministic, tiny, good enough for layout sampling. */
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return function rng() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function rectsOverlap(a: Rect, b: Rect): { dx: number; dy: number } | null {
  const dx = a.w / 2 + b.w / 2 - Math.abs(a.cx - b.cx);
  const dy = a.h / 2 + b.h / 2 - Math.abs(a.cy - b.cy);
  if (dx <= 0 || dy <= 0) return null;
  return { dx, dy };
}

/** Farthest-point sampling over a square canvas with a fixed candidate-pool
 *  size. The first center is seeded near the middle so the layout stays
 *  visually balanced; subsequent centers go to the candidate that maximizes
 *  the minimum distance to the existing set. */
function sampleCenters(
  W: number,
  H: number,
  n: number,
  rng: () => number,
  margin: number
): { cx: number; cy: number }[] {
  const centers: { cx: number; cy: number }[] = [];
  if (n <= 0) return centers;

  const minX = margin;
  const minY = margin;
  const maxX = W - margin;
  const maxY = H - margin;

  centers.push({
    cx: clamp(W / 2 + (rng() - 0.5) * W * 0.3, minX, maxX),
    cy: clamp(H / 2 + (rng() - 0.5) * H * 0.3, minY, maxY),
  });

  const CANDIDATES = 30;
  while (centers.length < n) {
    let best = { cx: 0, cy: 0, score: -Infinity };
    for (let k = 0; k < CANDIDATES; k++) {
      const cx = minX + rng() * (maxX - minX);
      const cy = minY + rng() * (maxY - minY);
      let minD2 = Infinity;
      for (const c of centers) {
        const ddx = cx - c.cx;
        const ddy = cy - c.cy;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 < minD2) minD2 = d2;
      }
      if (minD2 > best.score) best = { cx, cy, score: minD2 };
    }
    centers.push({ cx: best.cx, cy: best.cy });
  }

  return centers;
}

/** Push overlapping AABBs apart along their axis of greatest overlap. Boxes
 *  are clamped back inside the canvas after each pass. The pass count is a
 *  knob (Tunables.separationIters); 20 is plenty for ~16 boxes. */
function separateBoxes(boxes: Rect[], W: number, H: number, iters: number) {
  for (let pass = 0; pass < iters; pass++) {
    let moved = false;
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        const o = rectsOverlap(a, b);
        if (!o) continue;

        // Resolve along the axis of LEAST penetration so boxes hop apart
        // through the closest exit.
        if (o.dx < o.dy) {
          const push = o.dx / 2 + 0.5;
          if (a.cx < b.cx) {
            a.cx -= push;
            b.cx += push;
          } else {
            a.cx += push;
            b.cx -= push;
          }
        } else {
          const push = o.dy / 2 + 0.5;
          if (a.cy < b.cy) {
            a.cy -= push;
            b.cy += push;
          } else {
            a.cy += push;
            b.cy -= push;
          }
        }
        moved = true;
      }
    }
    for (const r of boxes) {
      r.cx = clamp(r.cx, r.w / 2, W - r.w / 2);
      r.cy = clamp(r.cy, r.h / 2, H - r.h / 2);
    }
    if (!moved) break;
  }
}

/** Sample a set of boxes for the given canvas size given the supplied
 *  tunables. Each call generates a fresh non-deterministic seed so repeated
 *  re-samples (with the same tunables) produce different layouts. */
export function sampleBoxes(W: number, H: number, t: Tunables): Box[] {
  // Combine a millisecond timestamp with a random nibble so two same-tick
  // calls still differ.
  const seed = (Date.now() & 0xffffffff) ^ Math.floor(Math.random() * 0xffffffff);
  const rng = makeRng(seed);
  const minEdge = Math.min(W, H);
  const minBox = Math.max(8, t.minBoxFrac * minEdge);
  const maxBox = Math.max(minBox + 1, t.maxBoxFrac * minEdge);

  // Margin keeps initial centers inside the canvas. Boxes are still clamped
  // post-resize.
  const margin = maxBox / 2;
  const centers = sampleCenters(W, H, t.numBoxes, rng, margin);

  const rects: Rect[] = centers.map((c) => {
    const edge = minBox + rng() * (maxBox - minBox);
    return {
      cx: clamp(c.cx, edge / 2, W - edge / 2),
      cy: clamp(c.cy, edge / 2, H - edge / 2),
      w: edge,
      h: edge,
    };
  });

  separateBoxes(rects, W, H, t.separationIters);

  return rects.map((r, i) => ({
    id: `box_${i}_${seed.toString(36)}`,
    cx: r.cx,
    cy: r.cy,
    w: r.w,
    h: r.h,
  }));
}
