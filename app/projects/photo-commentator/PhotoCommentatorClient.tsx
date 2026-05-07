"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type {
  Box,
  Caption,
  GalleryItem,
  ProcessingState,
  Tunables,
} from "./lib/types";
import {
  DEFAULT_TUNABLES,
  MAX_LONGEST_EDGE,
  COMMENT_IMAGE_PX,
  COMMENT_BOX_STROKE_FRAC,
  THEME_RESIZE_PX,
} from "./lib/defaults";
import { sampleBoxes } from "./lib/box-sampling";
import {
  imageWithAllBoxes,
  loadImage,
  meanLuma,
  resizeToFit,
  resizeWhole,
} from "./lib/image-utils";
import PresentationView from "./components/PresentationView";
import DebugView from "./components/DebugView";

type ViewMode = "presentation" | "debug";

const INITIAL_STATE: ProcessingState = {
  originalImageUrl: null,
  boxes: [],
  theme: null,
  captions: {},
  themeStatus: "idle",
  overallStatus: "idle",
  error: null,
};

function appendError(prev: string | null, msg: string): string {
  return prev ? `${prev}; ${msg}` : msg;
}

/** Send the full image with ALL color-coded + indexed boxes in a SINGLE
 *  /comment request. The model returns one JSON object per box, which we
 *  fan back into per-box caption state.
 *
 *  This replaces the older parallel-fan-out flow: a single call with the
 *  whole layout in view lets the model see all regions at once and give
 *  each box a distinct caption (the prompt explicitly forbids repetition).
 */
async function runCommentsBatch(opts: {
  image: HTMLImageElement;
  imageW: number;
  imageH: number;
  boxes: Box[];
  theme: string;
  tunables: Tunables;
  setState: React.Dispatch<React.SetStateAction<ProcessingState>>;
}) {
  const { image, imageW, imageH, boxes, theme, tunables, setState } = opts;
  if (boxes.length === 0) return;

  // Mark every box "running" so the inspector reflects in-flight status.
  setState((p) => {
    const next = { ...p.captions };
    for (const b of boxes) {
      next[b.id] = {
        ...(next[b.id] ?? { lines: [] }),
        status: "running",
        lines: [],
      };
    }
    return { ...p, captions: next, overallStatus: "running" };
  });

  try {
    const strokePx = Math.max(
      6,
      Math.min(imageW, imageH) * COMMENT_BOX_STROKE_FRAC
    );
    const imageFile = await imageWithAllBoxes(
      image,
      boxes,
      imageW,
      imageH,
      COMMENT_IMAGE_PX,
      strokePx,
      // Index labels need to read at LLM-input scale; tie label size to
      // overall image size, not the user's render fontPx tunable.
      Math.max(18, Math.min(imageW, imageH) * 0.04),
      `boxes_${boxes.length}.jpg`
    );

    const form = new FormData();
    form.append("image", imageFile);
    form.append("theme", theme);
    form.append("numBoxes", String(boxes.length));
    form.append("maxLines", String(tunables.maxLines));
    form.append("maxWordsPerLine", String(tunables.maxWordsPerLine));
    form.append("systemPrompt", tunables.commentSystemPrompt);

    const res = await fetch("/api/photo-commentator/comment", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error ?? "Comment failed");
    }

    type CaptionItem = { index: number; lines: string[] };
    const items: CaptionItem[] = Array.isArray(data?.captions)
      ? data.captions
      : [];

    // Fan results back to per-box state. Model is asked to emit boxes in
    // index order, but we tolerate missing or out-of-order entries by
    // matching on `index`.
    setState((p) => {
      const next = { ...p.captions };
      const seen = new Set<number>();
      for (const item of items) {
        const idx = Math.trunc(item.index);
        if (!Number.isFinite(idx) || idx < 0 || idx >= boxes.length) continue;
        if (seen.has(idx)) continue;
        seen.add(idx);
        const b = boxes[idx];
        next[b.id] = {
          status: "complete",
          lines: Array.isArray(item.lines) ? item.lines : [],
          meanLuma: meanLuma(image, b, imageW, imageH),
        };
      }
      // Any box the model dropped: mark error so the row shows as failed.
      for (let i = 0; i < boxes.length; i++) {
        if (!seen.has(i)) {
          next[boxes[i].id] = {
            ...(next[boxes[i].id] ?? { lines: [] }),
            status: "error",
          };
        }
      }
      const statuses = boxes.map((b) => next[b.id]?.status ?? "idle");
      const allComplete = statuses.every((s) => s === "complete");
      const anyError = statuses.some((s) => s === "error");
      return {
        ...p,
        captions: next,
        overallStatus: allComplete
          ? "complete"
          : anyError
            ? "error"
            : "running",
      };
    });
  } catch (e) {
    setState((p) => {
      const next = { ...p.captions };
      for (const b of boxes) {
        next[b.id] = { ...(next[b.id] ?? { lines: [] }), status: "error" };
      }
      return {
        ...p,
        captions: next,
        overallStatus: "error",
        error: appendError(
          p.error,
          `Comments: ${e instanceof Error ? e.message : "failed"}`
        ),
      };
    });
  }
}

export default function PhotoCommentatorClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const modeParam = searchParams.get("mode");
  const [mode, setMode] = useState<ViewMode>(
    modeParam === "debug" ? "debug" : "presentation"
  );

  const [state, setState] = useState<ProcessingState>(INITIAL_STATE);
  const [tunables, setTunables] = useState<Tunables>(DEFAULT_TUNABLES);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  // Cached source image for re-running individual boxes / regenerate without
  // re-uploading.
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const sourceFileRef = useRef<File | null>(null);

  // Fetch gallery on mount.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/photo-commentator/gallery");
        if (res.ok) {
          const data: GalleryItem[] = await res.json();
          setGalleryItems(data.slice(0, 5));
        }
      } catch {
        // non-critical
      }
    })();
  }, []);

  /** Run the full pipeline against the currently cached source image and
   *  current tunables. Used by both initial upload and "regenerate". */
  const runPipeline = useCallback(
    async (file: File, image: HTMLImageElement, t: Tunables) => {
      const imageW = image.naturalWidth;
      const imageH = image.naturalHeight;
      const boxes = sampleBoxes(imageW, imageH, t);

      const initialCaptions: Record<string, Caption> = {};
      for (const b of boxes) {
        initialCaptions[b.id] = { status: "idle", lines: [] };
      }

      setState((p) => ({
        ...p,
        boxes,
        captions: initialCaptions,
        theme: null,
        themeStatus: "running",
        overallStatus: "running",
        error: null,
      }));

      // Theme call
      let theme = "";
      try {
        const themeFile = await resizeWhole(image, THEME_RESIZE_PX, "theme.jpg");
        const form = new FormData();
        form.append("image", themeFile);
        form.append("systemPrompt", t.themeSystemPrompt);
        const res = await fetch("/api/photo-commentator/theme", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Theme failed");
        theme = (data?.theme ?? "").toString();

        setState((p) => ({
          ...p,
          theme,
          themeStatus: "complete",
        }));
      } catch (e) {
        setState((p) => ({
          ...p,
          themeStatus: "error",
          overallStatus: "error",
          error: appendError(
            p.error,
            `Theme: ${e instanceof Error ? e.message : "failed"}`
          ),
        }));
        return;
      }

      // Single-shot batch call with all color-coded indexed boxes.
      await runCommentsBatch({
        image,
        imageW,
        imageH,
        boxes,
        theme,
        tunables: t,
        setState,
      });

      // Suppress unused-file warning if we ever stop persisting it.
      void file;
    },
    []
  );

  const handleFile = useCallback(
    async (file: File) => {
      try {
        const { file: resized, url } = await resizeToFit(
          file,
          MAX_LONGEST_EDGE
        );
        const image = await loadImage(url);

        sourceFileRef.current = resized;
        sourceImageRef.current = image;

        setState({
          ...INITIAL_STATE,
          originalImageUrl: url,
          themeStatus: "running",
          overallStatus: "running",
        });

        await runPipeline(resized, image, tunables);
      } catch (e) {
        setState((p) => ({
          ...p,
          themeStatus: "error",
          overallStatus: "error",
          error: appendError(
            p.error,
            e instanceof Error ? e.message : "Upload failed"
          ),
        }));
      }
    },
    [tunables, runPipeline]
  );

  /** Re-sample boxes ONLY — cheap, no LLM calls. Existing captions are
   *  cleared because their box ids no longer match. */
  const handleResample = useCallback(() => {
    const image = sourceImageRef.current;
    if (!image) return;
    const boxes = sampleBoxes(image.naturalWidth, image.naturalHeight, tunables);
    const captions: Record<string, Caption> = {};
    for (const b of boxes) {
      captions[b.id] = { status: "idle", lines: [] };
    }
    setState((p) => ({
      ...p,
      boxes,
      captions,
      overallStatus: "idle",
    }));
  }, [tunables]);

  /** Re-fire the whole pipeline against the cached image. */
  const handleRegenerate = useCallback(async () => {
    const file = sourceFileRef.current;
    const image = sourceImageRef.current;
    if (!file || !image) return;
    await runPipeline(file, image, tunables);
  }, [runPipeline, tunables]);

  /** Re-fire the comments batch only (skipping theme). With a single-shot
   *  caption call there's no per-box rerun anymore — re-running one box
   *  means re-running all of them, so the inspector's per-row "rotate"
   *  button maps to a full caption regenerate. */
  const handleRerunBox = useCallback(
    async (_boxId: string) => {
      const image = sourceImageRef.current;
      if (!image || !state.theme || state.boxes.length === 0) return;
      await runCommentsBatch({
        image,
        imageW: image.naturalWidth,
        imageH: image.naturalHeight,
        boxes: state.boxes,
        theme: state.theme,
        tunables,
        setState,
      });
    },
    [state.boxes, state.theme, tunables]
  );

  const handleReset = useCallback(() => {
    sourceImageRef.current = null;
    sourceFileRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  const handleSelectGalleryItem = useCallback(
    async (item: GalleryItem) => {
      try {
        const captions: Record<string, Caption> = {};
        for (const b of item.boxes) {
          captions[b.id] = { status: "idle", lines: [] };
        }
        for (const c of item.captions) {
          captions[c.boxId] = { status: "complete", lines: c.lines };
        }

        // Load the stored image so re-runs / re-samples work without
        // re-uploading. meanLuma is filled in once the image resolves.
        const image = await loadImage(item.originalUrl);
        sourceImageRef.current = image;
        // No File ref because the caller can't actually re-derive a File
        // post-load without re-fetching; that's fine, runPipeline only needs
        // the image.

        for (const b of item.boxes) {
          if (captions[b.id]?.status === "complete") {
            captions[b.id] = {
              ...captions[b.id],
              meanLuma: meanLuma(
                image,
                b,
                image.naturalWidth,
                image.naturalHeight
              ),
            };
          }
        }

        setState({
          originalImageUrl: item.originalUrl,
          boxes: item.boxes,
          theme: item.theme,
          captions,
          themeStatus: "complete",
          overallStatus: "complete",
          error: null,
        });
        setTunables(item.tunables);
      } catch (e) {
        setState((p) => ({
          ...p,
          error: appendError(
            p.error,
            `Load: ${e instanceof Error ? e.message : "failed"}`
          ),
        }));
      }
    },
    []
  );

  const handleDeleteGalleryItem = useCallback(async (id: string) => {
    await fetch(`/api/photo-commentator/gallery/${id}`, { method: "DELETE" });
    setGalleryItems((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const refreshGallery = useCallback(async () => {
    try {
      const res = await fetch("/api/photo-commentator/gallery");
      if (res.ok) {
        const data: GalleryItem[] = await res.json();
        setGalleryItems(data.slice(0, 5));
      }
    } catch {
      // non-critical
    }
  }, []);

  const switchMode = useCallback(
    (m: ViewMode) => {
      setMode(m);
      router.replace(`?mode=${m}`, { scroll: false });
    },
    [router]
  );

  return (
    <div>
      {mode === "presentation" && (
        <PresentationView
          state={state}
          tunables={tunables}
          onFile={handleFile}
          onReset={handleReset}
          onSwitchToDebug={() => switchMode("debug")}
          galleryItems={galleryItems}
          onSelectGalleryItem={handleSelectGalleryItem}
          onDeleteGalleryItem={handleDeleteGalleryItem}
          onGallerySaved={refreshGallery}
        />
      )}

      {mode === "debug" && (
        <DebugView
          state={state}
          tunables={tunables}
          setTunables={setTunables}
          onFile={handleFile}
          onReset={handleReset}
          onResample={handleResample}
          onRegenerate={handleRegenerate}
          onRerunBox={handleRerunBox}
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
