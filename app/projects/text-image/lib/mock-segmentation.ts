import type { SegmentRegion } from "./types";

const LABEL_ROWS = ["sky", "sky", "tree", "grass", "road"];
const VARIATIONS: Record<string, string[]> = {
  sky: ["sky", "cloud", "sky"],
  tree: ["tree", "building", "tree"],
  grass: ["grass", "flower", "grass"],
  road: ["road", "sidewalk", "road"],
};

/**
 * TODO: Replace with real semantic segmentation model (e.g. SegFormer, DeepLab).
 * Mock divides image into a 5x6 grid with labels assigned by vertical position.
 */
export function mockSegmentation(
  width: number,
  height: number
): Omit<SegmentRegion, "depth" | "color">[] {
  const COLS = 6;
  const ROWS = 5;
  const cellW = Math.ceil(width / COLS);
  const cellH = Math.ceil(height / ROWS);

  const regions: Omit<SegmentRegion, "depth" | "color">[] = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const baseLabel = LABEL_ROWS[row];
      const variants = VARIATIONS[baseLabel] ?? [baseLabel];
      const label = variants[col % variants.length];

      const x = col * cellW;
      const y = row * cellH;
      const w = Math.min(cellW, width - x);
      const h = Math.min(cellH, height - y);

      const mask = Array.from({ length: h }, () =>
        Array.from({ length: w }, () => true)
      );

      regions.push({
        id: `region-${row}-${col}`,
        label,
        bbox: { x, y, width: w, height: h },
        mask,
      });
    }
  }

  return regions;
}
