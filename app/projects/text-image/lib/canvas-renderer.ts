import type {
  TextImageData,
  SegmentRegion,
  NormalizedMousePosition,
  ParallaxConfig,
  PreRenderedLayer,
} from "./types";
import { computeParallaxOffset } from "./parallax-engine";

/**
 * Pre-render all region layers to offscreen canvases (called once after processing).
 * Each region gets its own canvas with the class label tiled and clipped to the mask.
 */
export function preRenderLayers(data: TextImageData): PreRenderedLayer[] {
  return [...data.regions]
    .sort((a, b) => b.depth - a.depth)
    .map((region) => {
      const offscreen = document.createElement("canvas");
      offscreen.width = data.width;
      offscreen.height = data.height;
      const ctx = offscreen.getContext("2d")!;
      renderRegionToCanvas(ctx, region);
      return { canvas: offscreen, region };
    });
}

function renderRegionToCanvas(
  ctx: CanvasRenderingContext2D,
  region: SegmentRegion
): void {
  const { bbox, mask, label, color } = region;
  const [r, g, b] = color;

  const fontSize = Math.max(8, Math.min(bbox.width, bbox.height) / 6);
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.textBaseline = "top";

  const textWidth = ctx.measureText(label).width;
  const lineHeight = fontSize * 1.15;

  // Build clip path from mask using rectangular runs for performance
  ctx.save();
  ctx.beginPath();
  for (let row = 0; row < mask.length; row++) {
    let runStart = -1;
    for (let col = 0; col <= mask[row].length; col++) {
      const active = col < mask[row].length && mask[row][col];
      if (active && runStart === -1) {
        runStart = col;
      } else if (!active && runStart !== -1) {
        ctx.rect(bbox.x + runStart, bbox.y + row, col - runStart, 1);
        runStart = -1;
      }
    }
  }
  ctx.clip();

  // Tile the label text across the bounding box
  const pad = 30;
  for (
    let y = bbox.y - pad;
    y < bbox.y + bbox.height + pad;
    y += lineHeight
  ) {
    for (
      let x = bbox.x - pad;
      x < bbox.x + bbox.width + pad;
      x += textWidth + fontSize * 0.3
    ) {
      ctx.fillText(label, x, y);
    }
  }

  ctx.restore();
}

/**
 * Composite pre-rendered layers with parallax offsets.
 * Called on every animation frame — fast because it's only drawImage calls.
 */
export function compositeWithParallax(
  mainCanvas: HTMLCanvasElement,
  layers: PreRenderedLayer[],
  mousePos: NormalizedMousePosition,
  config: ParallaxConfig
): void {
  const ctx = mainCanvas.getContext("2d")!;
  ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

  for (const layer of layers) {
    const offset = config.enabled
      ? computeParallaxOffset(mousePos, layer.region.depth, config.maxShift)
      : { x: 0, y: 0 };
    ctx.drawImage(layer.canvas, offset.x, offset.y);
  }
}
