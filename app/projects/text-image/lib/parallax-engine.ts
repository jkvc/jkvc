import type { NormalizedMousePosition } from "./types";

/**
 * Compute pixel offset for a layer given mouse position and depth.
 * depth=0 (near) shifts the most, depth=1 (far) barely moves.
 */
export function computeParallaxOffset(
  mousePos: NormalizedMousePosition,
  depth: number,
  maxShift: number
): { x: number; y: number } {
  const factor = (1 - depth) * maxShift;
  return {
    x: mousePos.x * factor,
    y: mousePos.y * factor,
  };
}
