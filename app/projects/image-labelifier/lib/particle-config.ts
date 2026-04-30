import type { Shape, Background, Sampling } from "./particle-types";

export interface ParticleConfig {
  shape: Shape;
  background: Background;
  sampling: Sampling;
  dotsPerLongEdge: number;
  totalPoints: number;
  depthBias: number;
  depthMul: number;
  parallaxStrength: number;
  opacity: number;
}
