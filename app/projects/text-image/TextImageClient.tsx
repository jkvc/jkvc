"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { SegmentResult, GalleryItem } from "./lib/types";
import Gallery from "./components/Gallery";
import InferenceExplorer from "./components/InferenceExplorer";
import PresentationView from "./components/PresentationView";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ViewMode = "presentation" | "expert";
type Phase = "view" | "gallery";

/** Shared inference state lifted from InferenceExplorer */
export interface InferenceState {
  previewUrl: string | null;
  depthUrl: string | null;
  segments: SegmentResult[] | null;
  depthLoading: boolean;
  segLoading: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Helpers — derive phase + mode from the single ?mode= search param
// ---------------------------------------------------------------------------

function getInitialPhase(param: string | null): Phase {
  if (param === "gallery") return "gallery";
  return "view";
}

function getInitialMode(param: string | null): ViewMode {
  if (param === "expert") return "expert";
  return "presentation";
}

function modeToParam(phase: Phase, viewMode: ViewMode): string {
  if (phase === "gallery") return "gallery";
  return viewMode; // "presentation" | "expert"
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TextImageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const modeParam = searchParams.get("mode");
  const [phase, setPhase] = useState<Phase>(() => getInitialPhase(modeParam));
  const [mode, setMode] = useState<ViewMode>(() => getInitialMode(modeParam));

  // Shared inference state — persists across mode switches
  const [inference, setInference] = useState<InferenceState>({
    previewUrl: null,
    depthUrl: null,
    segments: null,
    depthLoading: false,
    segLoading: false,
    error: null,
  });

  // Gallery viewer state — when viewing a saved gallery item
  const [viewingItem, setViewingItem] = useState<GalleryItem | null>(null);

  // -------------------------------------------------------------------------
  // File upload handler (shared between modes)
  // -------------------------------------------------------------------------

  const handleFile = useCallback(async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setInference({
      previewUrl,
      depthUrl: null,
      segments: null,
      depthLoading: true,
      segLoading: true,
      error: null,
    });
    setViewingItem(null);

    const formData = new FormData();
    formData.append("image", file);

    const depthPromise = (async () => {
      try {
        const res = await fetch("/api/text-image/depth", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Depth request failed");
        setInference((prev) => ({ ...prev, depthUrl: data.depthUrl, depthLoading: false }));
      } catch (e) {
        setInference((prev) => ({
          ...prev,
          depthLoading: false,
          error: prev.error
            ? `${prev.error}; Depth: ${e instanceof Error ? e.message : "Unknown"}`
            : `Depth: ${e instanceof Error ? e.message : "Unknown error"}`,
        }));
      }
    })();

    const segPromise = (async () => {
      try {
        const segFormData = new FormData();
        segFormData.append("image", file);
        const res = await fetch("/api/text-image/segmentation", {
          method: "POST",
          body: segFormData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Segmentation request failed");
        setInference((prev) => ({ ...prev, segments: data.segments, segLoading: false }));
      } catch (e) {
        setInference((prev) => ({
          ...prev,
          segLoading: false,
          error: prev.error
            ? `${prev.error}; Seg: ${e instanceof Error ? e.message : "Unknown"}`
            : `Seg: ${e instanceof Error ? e.message : "Unknown error"}`,
        }));
      }
    })();

    await Promise.all([depthPromise, segPromise]);
  }, []);

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  const switchPhase = useCallback(
    (p: Phase) => {
      setPhase(p);
      const param = modeToParam(p, mode);
      router.replace(`?mode=${param}`, { scroll: false });
    },
    [router, mode]
  );

  const switchMode = useCallback(
    (m: ViewMode) => {
      setMode(m);
      setPhase("view");
      router.replace(`?mode=${m}`, { scroll: false });
    },
    [router]
  );

  // -------------------------------------------------------------------------
  // Gallery item viewer
  // -------------------------------------------------------------------------

  const handleViewGalleryItem = useCallback(
    (item: GalleryItem) => {
      setViewingItem(item);
      setInference({
        previewUrl: item.originalUrl,
        depthUrl: item.depthUrl,
        segments: null, // will be loaded from segmentsUrl
        depthLoading: false,
        segLoading: true,
        error: null,
      });
      // Fetch segments JSON from blob
      (async () => {
        try {
          const res = await fetch(item.segmentsUrl);
          const segments: SegmentResult[] = await res.json();
          setInference((prev) => ({ ...prev, segments, segLoading: false }));
        } catch {
          setInference((prev) => ({
            ...prev,
            segLoading: false,
            error: "Failed to load segmentation data",
          }));
        }
      })();

      const viewMode = item.mode === "expert" ? "expert" : "presentation";
      setMode(viewMode);
      setPhase("view");
      router.replace(`?mode=${viewMode}`, { scroll: false });
    },
    [router]
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const isLoading = inference.depthLoading || inference.segLoading;

  return (
    <div>
      {/* Top navigation: Phase tabs */}
      <div className="flex items-center gap-1.5 mb-8">
        <button
          className={`btn btn-sm rounded-full ${phase === "view" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => switchPhase("view")}
        >
          Canvas
        </button>
        <button
          className={`btn btn-sm rounded-full ${phase === "gallery" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => switchPhase("gallery")}
        >
          Gallery
        </button>

        {/* Mode toggle (only visible on view phase) */}
        {phase === "view" && (
          <div className="ml-auto flex items-center gap-1 bg-base-200/60 rounded-full p-0.5">
            <button
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                mode === "presentation"
                  ? "bg-base-content text-base-100"
                  : "text-base-content/40 hover:text-base-content/70"
              }`}
              onClick={() => switchMode("presentation")}
            >
              Presentation
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                mode === "expert"
                  ? "bg-base-content text-base-100"
                  : "text-base-content/40 hover:text-base-content/70"
              }`}
              onClick={() => switchMode("expert")}
            >
              Expert
            </button>
          </div>
        )}
      </div>

      {/* View phase */}
      {phase === "view" && mode === "presentation" && (
        <PresentationView
          inference={inference}
          onFile={handleFile}
          isLoading={isLoading}
          viewingItem={viewingItem}
        />
      )}

      {phase === "view" && mode === "expert" && (
        <InferenceExplorer
          inference={inference}
          onFile={handleFile}
          viewingItem={viewingItem}
        />
      )}

      {/* Gallery phase */}
      {phase === "gallery" && (
        <Gallery onViewItem={handleViewGalleryItem} />
      )}
    </div>
  );
}
