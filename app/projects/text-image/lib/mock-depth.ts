/**
 * TODO: Replace with real monocular depth estimation (e.g. MiDaS, DPT).
 * Mock assigns depth based on vertical position: top = far (1.0), bottom = near (0.0).
 */
export function mockDepthEstimation(
  regions: { bbox: { y: number; height: number } }[],
  imageHeight: number
): number[] {
  return regions.map((region) => {
    const centerY = region.bbox.y + region.bbox.height / 2;
    const normalizedY = centerY / imageHeight;
    const baseDepth = 1.0 - normalizedY;
    const noise = Math.sin(region.bbox.y * 0.1) * 0.05;
    return Math.max(0, Math.min(1, baseDepth + noise));
  });
}
