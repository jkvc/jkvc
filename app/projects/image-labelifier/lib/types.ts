import type { ParticleConfig } from "./particle-config";

export interface GalleryItem {
  id: string;
  /** Rendered snapshot image (blob URL) */
  imageUrl: string;
  /** Original uploaded image (blob URL) */
  originalUrl: string;
  /** Depth map image (blob URL) */
  depthUrl: string;
  /** Segmentation result JSON (blob URL) */
  segmentsUrl: string;
  createdAt: number;
  width: number;
  height: number;
  labels: string[];
  /** Which mode was used when saving */
  mode: "presentation" | "expert";
  /** Preset id (presentation mode) or null (expert mode) */
  presetId: string | null;
  /** Full particle config snapshot so we can restore the exact view */
  config: ParticleConfig;
}

/** Raw segment from the Replicate segformer model */
export interface SegmentResult {
  label: string;
  mask: string; // base64-encoded PNG
  score: null;
}
