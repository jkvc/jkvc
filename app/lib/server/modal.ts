import { KLEIN_DEMO_RESOLUTION } from "@/app/lib/klein-demo";

const MODAL_KLEIN_STREAM_URL =
  "https://kevinehc--lunas-courageous-adventure-stream.modal.run";

const MODAL_KEY = process.env.MODAL_KEY;
const MODAL_SECRET = process.env.MODAL_SECRET;

export const KLEIN_ROUTE_PATH = "klein9b.image";

export interface KleinStreamRequest {
  prompt: string;
  seed?: number;
  resolution?: [number, number];
  condImages?: string[];
}

export function getModalStreamConfig(): {
  url: string;
  key: string;
  secret: string;
} {
  if (!MODAL_KEY || !MODAL_SECRET) {
    throw new Error("Modal proxy credentials are not configured");
  }
  return {
    url: MODAL_KLEIN_STREAM_URL,
    key: MODAL_KEY,
    secret: MODAL_SECRET,
  };
}

export function buildKleinStreamPayload(body: KleinStreamRequest): Record<string, unknown> {
  const prompt = body.prompt.trim();
  if (!prompt) {
    throw new Error("prompt is required");
  }

  const resolution = body.resolution ?? KLEIN_DEMO_RESOLUTION;
  const seed = body.seed ?? Math.floor(Math.random() * 2 ** 31);

  const inputs: Record<string, unknown> = {
    prompt,
    seed,
    resolution,
  };

  const payload: Record<string, unknown> = {
    path: KLEIN_ROUTE_PATH,
    inputs,
  };

  const condImages = body.condImages?.filter(Boolean) ?? [];
  if (condImages.length > 0) {
    inputs.cond_images = condImages;
    payload.translator = { cond_images: "list_apply[imageb64_to_tensor]" };
  }

  return payload;
}
