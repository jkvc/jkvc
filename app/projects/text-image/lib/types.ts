export interface SegmentRegion {
  id: string;
  label: string;
  bbox: { x: number; y: number; width: number; height: number };
  mask: boolean[][];
  depth: number;
  color: [number, number, number];
}

export interface TextImageData {
  width: number;
  height: number;
  originalDataUrl: string;
  regions: SegmentRegion[];
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  originalUrl: string;
  createdAt: number;
  width: number;
  height: number;
  labels: string[];
}

export interface NormalizedMousePosition {
  x: number;
  y: number;
}

export interface ParallaxConfig {
  maxShift: number;
  enabled: boolean;
}

export interface PreRenderedLayer {
  canvas: HTMLCanvasElement;
  region: SegmentRegion;
}
