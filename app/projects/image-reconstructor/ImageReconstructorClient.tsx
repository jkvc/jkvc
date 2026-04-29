"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type {
  ProcessingState,
  SegmentResult,
  ColorInFrame,
  GalleryItem,
} from "./lib/types";
// NOTE: `segments` here are k-means color clusters produced by
// /api/image-reconstructor/cluster (LAB clustering, sorted ascending chroma),
// not semantic segments. Type/state names retained to limit churn.
import PresentationView from "./components/PresentationView";
import ExpertView from "./components/ExpertView";

type ViewMode = "presentation" | "expert";

const SIZE = 768;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Center-crop to max inscribing square, then resize to SIZExSIZE. */
function centerCropAndResize(file: File): Promise<{ file: File; url: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      const side = Math.min(w, h);
      const sx = Math.floor((w - side) / 2);
      const sy = Math.floor((h - side) / 2);

      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Crop failed"));
          const cropped = new File([blob], "cropped.jpg", {
            type: "image/jpeg",
          });
          resolve({ file: cropped, url: URL.createObjectURL(blob) });
        },
        "image/jpeg",
        0.92
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

/** Load an image from URL into an HTMLImageElement. */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Get pixel data from an image element. */
function getPixelData(
  img: HTMLImageElement,
  w: number,
  h: number
): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

/** Build color-in frames by overlaying original pixels onto sketch per segment. */
async function buildColorInFrames(
  sketchUrl: string,
  originalUrl: string,
  segments: SegmentResult[]
): Promise<ColorInFrame[]> {
  const sketchImg = await loadImage(sketchUrl);
  const originalImg = await loadImage(originalUrl);

  const sketchData = getPixelData(sketchImg, SIZE, SIZE);
  const originalData = getPixelData(originalImg, SIZE, SIZE);

  // Server returns segments pre-sorted in the desired reveal order
  // (ascending centroid saturation). Just load masks; defensively skip empty ones.
  const masksOrdered: {
    label: string;
    data: ImageData;
  }[] = [];

  for (const seg of segments) {
    const maskSrc = `data:image/png;base64,${seg.mask}`;
    const maskImg = await loadImage(maskSrc);
    const maskData = getPixelData(maskImg, SIZE, SIZE);
    let hasPixels = false;
    for (let i = 0; i < maskData.data.length; i += 4) {
      if (maskData.data[i] > 128) {
        hasPixels = true;
        break;
      }
    }
    if (hasPixels) {
      masksOrdered.push({ label: seg.label, data: maskData });
    }
  }

  // Build frames
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  // Start with sketch
  const basePixels = new Uint8ClampedArray(sketchData.data);
  ctx.putImageData(new ImageData(basePixels, SIZE, SIZE), 0, 0);

  const frames: ColorInFrame[] = [];

  // Frame 0: pure sketch
  const sketchBlob = await new Promise<Blob>((res) =>
    canvas.toBlob((b) => res(b!), "image/jpeg", 0.92)
  );
  frames.push({
    label: "Sketch",
    compositeUrl: URL.createObjectURL(sketchBlob),
  });

  // For each segment (in server-provided reveal order), overlay original pixels
  // where mask is active.
  for (const mask of masksOrdered) {
    for (let i = 0; i < mask.data.data.length; i += 4) {
      if (mask.data.data[i] > 128) {
        basePixels[i] = originalData.data[i];
        basePixels[i + 1] = originalData.data[i + 1];
        basePixels[i + 2] = originalData.data[i + 2];
        basePixels[i + 3] = originalData.data[i + 3];
      }
    }
    ctx.putImageData(new ImageData(basePixels, SIZE, SIZE), 0, 0);

    const blob = await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b!), "image/jpeg", 0.92)
    );
    frames.push({
      label: mask.label,
      compositeUrl: URL.createObjectURL(blob),
    });
  }

  return frames;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const INITIAL_STATE: ProcessingState = {
  originalImageUrl: null,
  sketchUrl: null,
  segments: null,
  frames: [],
  videoUrl: null,
  animationPrompt: null,
  sketchStatus: "idle",
  segStatus: "idle",
  promptStatus: "idle",
  animationStatus: "idle",
  compositingStatus: "idle",
  currentStepLabel: null,
  error: null,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ImageReconstructorClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const modeParam = searchParams.get("mode");
  const [mode, setMode] = useState<ViewMode>(
    modeParam === "expert" ? "expert" : "presentation"
  );

  const [state, setState] = useState<ProcessingState>(INITIAL_STATE);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  // Refs to track compositing readiness across async calls
  const sketchUrlRef = useRef<string | null>(null);
  const segmentsRef = useRef<SegmentResult[] | null>(null);
  const originalUrlRef = useRef<string | null>(null);
  const compositingStarted = useRef(false);

  // Fetch gallery on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/image-reconstructor/gallery");
        if (res.ok) {
          const data: GalleryItem[] = await res.json();
          setGalleryItems(data.slice(0, 5));
        }
      } catch {
        // non-critical
      }
    })();
  }, []);

  // ---- Compositing trigger ----
  const tryComposite = useCallback(async () => {
    if (
      compositingStarted.current ||
      !sketchUrlRef.current ||
      !segmentsRef.current ||
      !originalUrlRef.current
    )
      return;
    compositingStarted.current = true;

    setState((p) => ({
      ...p,
      compositingStatus: "running",
      currentStepLabel: "Building color-in frames...",
    }));

    try {
      const frames = await buildColorInFrames(
        sketchUrlRef.current,
        originalUrlRef.current,
        segmentsRef.current
      );
      setState((p) => ({
        ...p,
        frames,
        compositingStatus: "complete",
        currentStepLabel: null,
      }));
    } catch {
      setState((p) => ({
        ...p,
        compositingStatus: "error",
        error: (p.error ? p.error + "; " : "") + "Compositing failed",
      }));
    }
  }, []);

  // ---- File upload handler ----
  const handleFile = useCallback(
    async (file: File) => {
      // Reset refs
      sketchUrlRef.current = null;
      segmentsRef.current = null;
      originalUrlRef.current = null;
      compositingStarted.current = false;

      const { file: cropped, url: previewUrl } =
        await centerCropAndResize(file);
      originalUrlRef.current = previewUrl;

      setState({
        ...INITIAL_STATE,
        originalImageUrl: previewUrl,
        sketchStatus: "running",
        segStatus: "running",
        promptStatus: "running",
      });

      const formData = new FormData();
      formData.append("image", cropped);

      // Fire sketch, clustering, prompt concurrently
      // Animation fires after prompt is ready

      // Sketch
      (async () => {
        try {
          const sketchForm = new FormData();
          sketchForm.append("image", cropped);
          const res = await fetch("/api/image-reconstructor/sketch", {
            method: "POST",
            body: sketchForm,
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Sketch failed");
          sketchUrlRef.current = data.sketchUrl;
          setState((p) => ({
            ...p,
            sketchUrl: data.sketchUrl,
            sketchStatus: "complete",
          }));
          tryComposite();
        } catch (e) {
          setState((p) => ({
            ...p,
            sketchStatus: "error",
            error:
              (p.error ? p.error + "; " : "") +
              `Sketch: ${e instanceof Error ? e.message : "Unknown"}`,
          }));
        }
      })();

      // Color clustering (k-means in LAB → connected components)
      (async () => {
        try {
          const segForm = new FormData();
          segForm.append("image", cropped);
          const res = await fetch("/api/image-reconstructor/cluster", {
            method: "POST",
            body: segForm,
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Clustering failed");
          segmentsRef.current = data.segments;
          setState((p) => ({
            ...p,
            segments: data.segments,
            segStatus: "complete",
          }));
          tryComposite();
        } catch (e) {
          setState((p) => ({
            ...p,
            segStatus: "error",
            error:
              (p.error ? p.error + "; " : "") +
              `Clustering: ${e instanceof Error ? e.message : "Unknown"}`,
          }));
        }
      })();

      // Prompt generation → then animation
      (async () => {
        try {
          const promptForm = new FormData();
          promptForm.append("image", cropped);
          const res = await fetch("/api/image-reconstructor/generate-prompt", {
            method: "POST",
            body: promptForm,
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Prompt generation failed");
          setState((p) => ({
            ...p,
            animationPrompt: data.prompt,
            promptStatus: "complete",
            animationStatus: "running",
          }));

          // Now fire animation with the prompt
          const animForm = new FormData();
          animForm.append("image", cropped);
          animForm.append("prompt", data.prompt);
          const animRes = await fetch("/api/image-reconstructor/animate", {
            method: "POST",
            body: animForm,
          });
          const animData = await animRes.json();
          if (!animRes.ok)
            throw new Error(animData.error || "Animation failed");
          setState((p) => ({
            ...p,
            videoUrl: animData.videoUrl,
            animationStatus: "complete",
          }));
        } catch (e) {
          setState((p) => ({
            ...p,
            promptStatus: p.promptStatus === "running" ? "error" : p.promptStatus,
            animationStatus:
              p.promptStatus === "complete" ? "error" : p.animationStatus,
            error:
              (p.error ? p.error + "; " : "") +
              (e instanceof Error ? e.message : "Animation pipeline failed"),
          }));
        }
      })();
    },
    [tryComposite]
  );

  // ---- Reset ----
  const handleReset = useCallback(() => {
    sketchUrlRef.current = null;
    segmentsRef.current = null;
    originalUrlRef.current = null;
    compositingStarted.current = false;
    setState(INITIAL_STATE);
  }, []);

  // ---- Gallery item selection ----
  const handleSelectGalleryItem = useCallback((item: GalleryItem) => {
    const frames: ColorInFrame[] = item.frameUrls.map((url, i) => ({
      compositeUrl: url,
      label: item.segmentLabels[i] || `Frame ${i + 1}`,
    }));

    setState({
      originalImageUrl: item.originalUrl,
      sketchUrl: item.sketchUrl,
      segments: null,
      frames,
      videoUrl: item.videoUrl || null,
      animationPrompt: item.animationPrompt || null,
      sketchStatus: "complete",
      segStatus: "complete",
      promptStatus: "complete",
      animationStatus: item.videoUrl ? "complete" : "idle",
      compositingStatus: "complete",
      currentStepLabel: null,
      error: null,
    });
  }, []);

  const handleDeleteGalleryItem = useCallback(async (id: string) => {
    await fetch(`/api/image-reconstructor/gallery/${id}`, {
      method: "DELETE",
    });
    setGalleryItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const refreshGallery = useCallback(async () => {
    try {
      const res = await fetch("/api/image-reconstructor/gallery");
      if (res.ok) {
        const data: GalleryItem[] = await res.json();
        setGalleryItems(data.slice(0, 5));
      }
    } catch {
      // non-critical
    }
  }, []);

  // ---- Mode switch ----
  const switchMode = useCallback(
    (m: ViewMode) => {
      setMode(m);
      router.replace(`?mode=${m}`, { scroll: false });
    },
    [router]
  );

  // ---- Render ----
  return (
    <div>
      {mode === "presentation" && (
        <PresentationView
          state={state}
          onFile={handleFile}
          onReset={handleReset}
          onSwitchToExpert={() => switchMode("expert")}
          galleryItems={galleryItems}
          onSelectGalleryItem={handleSelectGalleryItem}
          onDeleteGalleryItem={handleDeleteGalleryItem}
          onGallerySaved={refreshGallery}
        />
      )}

      {mode === "expert" && (
        <ExpertView
          state={state}
          onFile={handleFile}
          onReset={handleReset}
          onSwitchToPresentation={() => switchMode("presentation")}
          galleryItems={galleryItems}
          onSelectGalleryItem={handleSelectGalleryItem}
          onDeleteGalleryItem={handleDeleteGalleryItem}
          onGallerySaved={refreshGallery}
        />
      )}
    </div>
  );
}
