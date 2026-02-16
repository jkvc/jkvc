export interface GalleryItem {
  id: string;
  imageUrl: string;
  originalUrl: string;
  createdAt: number;
  width: number;
  height: number;
  labels: string[];
}

/** Raw segment from the Replicate segformer model */
export interface SegmentResult {
  label: string;
  mask: string; // base64-encoded PNG
  score: null;
}
