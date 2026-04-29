/** A single color-cluster mask from /api/image-reconstructor/cluster. */
export interface SegmentResult {
  label: string;
  mask: string; // base64 PNG
}

/** A single frame in the color-in sequence. */
export interface ColorInFrame {
  label: string;
  compositeUrl: string; // blob URL of the composited image
}

type Status = "idle" | "running" | "complete" | "error";

/** Overall processing state managed by the orchestrator. */
export interface ProcessingState {
  originalImageUrl: string | null; // 768x768 cropped
  sketchUrl: string | null;
  segments: SegmentResult[] | null;
  frames: ColorInFrame[];
  videoUrl: string | null;
  animationPrompt: string | null;

  sketchStatus: Status;
  segStatus: Status;
  promptStatus: Status;
  animationStatus: Status;
  compositingStatus: Status;

  currentStepLabel: string | null;
  error: string | null;
}

/** Persisted gallery item (Vercel Blob + Redis). */
export interface GalleryItem {
  id: string;
  createdAt: string;
  thumbnailUrl: string;
  originalUrl: string;
  sketchUrl: string;
  frameUrls: string[];
  segmentLabels: string[];
  videoUrl: string;
  animationPrompt: string;
}
