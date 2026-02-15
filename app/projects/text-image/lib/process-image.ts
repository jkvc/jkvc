import type { TextImageData, SegmentRegion } from "./types";
import { mockSegmentation } from "./mock-segmentation";
import { mockDepthEstimation } from "./mock-depth";
import { mockDominantColor } from "./mock-color";

/**
 * Process an uploaded image through all three mock models.
 *
 * TODO: Replace mock calls with real model inference endpoints.
 */
export async function processImage(
  file: File,
  onStep?: (step: string) => void
): Promise<TextImageData> {
  onStep?.("Loading image...");
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);

  const blob = await canvas.convertToBlob({ type: "image/png" });
  const originalDataUrl = await blobToDataUrl(blob);

  onStep?.("Running segmentation...");
  await delay(800);
  const rawRegions = mockSegmentation(bitmap.width, bitmap.height);

  onStep?.("Estimating depth...");
  await delay(400);
  const depths = mockDepthEstimation(rawRegions, bitmap.height);

  onStep?.("Detecting colors...");
  await delay(400);
  const colors = mockDominantColor(imageData, rawRegions);

  const regions: SegmentRegion[] = rawRegions.map((r, i) => ({
    ...r,
    depth: depths[i],
    color: colors[i],
  }));

  return { width: bitmap.width, height: bitmap.height, originalDataUrl, regions };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
