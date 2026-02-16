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
// Helpers
// ---------------------------------------------------------------------------

function getInitialPhase(tab: string | null): Phase {
  if (tab === "gallery") return "gallery";
  return "view";
}

function getInitialMode(tab: string | null): ViewMode {
  if (tab === "expert") return "expert";
  return "presentation";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TextImageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>(() =>
    getInitialPhase(searchParams.get("tab"))
  );
  const [mode, setMode] = useState<ViewMode>(() =>
    getInitialMode(searchParams.get("tab"))
  );

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
      if (p === "gallery") {
        router.replace("?tab=gallery", { scroll: false });
      } else {
        router.replace(window.location.pathname, { scroll: false });
      }
    },
    [router]
  );

  const switchMode = useCallback(
    (m: ViewMode) => {
      setMode(m);
      // Stay on "view" phase when switching modes
      setPhase("view");
      router.replace(
        m === "expert" ? "?tab=expert" : window.location.pathname,
        { scroll: false }
      );
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
      router.replace(window.location.pathname, { scroll: false });
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
