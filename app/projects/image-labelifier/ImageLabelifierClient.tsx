"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { SegmentResult, GalleryItem } from "./lib/types";
import InferenceExplorer from "./components/InferenceExplorer";
import PresentationView from "./components/PresentationView";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ViewMode = "presentation" | "expert";

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

/** Resize an image file so its longest edge is at most `maxEdge` px. */
function resizeImage(file: File, maxEdge: number): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const { naturalWidth: w, naturalHeight: h } = img;
            if (w <= maxEdge && h <= maxEdge) {
                resolve(file);
                return;
            }
            const scale = maxEdge / Math.max(w, h);
            const nw = Math.round(w * scale);
            const nh = Math.round(h * scale);

            const canvas = document.createElement("canvas");
            canvas.width = nw;
            canvas.height = nh;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0, nw, nh);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error("Resize failed"));
                    resolve(new File([blob], file.name, { type: "image/jpeg" }));
                },
                "image/jpeg",
                0.92
            );
        };
        img.onerror = () => reject(new Error("Failed to load image for resizing"));
        img.src = URL.createObjectURL(file);
    });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ImageLabelifierClient() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const modeParam = searchParams.get("mode");
    const [mode, setMode] = useState<ViewMode>(
        modeParam === "expert" ? "expert" : "presentation"
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

    // Gallery items shown as examples in the upload area
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [viewingItem, setViewingItem] = useState<GalleryItem | null>(null);

    // Fetch gallery items on mount
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/image-labelifier/gallery");
                if (res.ok) {
                    const data: GalleryItem[] = await res.json();
                    setGalleryItems(data.slice(0, 10));
                }
            } catch {
                // gallery fetch error — non-critical
            }
        })();
    }, []);

    // -------------------------------------------------------------------------
    // File upload handler (shared between modes)
    // -------------------------------------------------------------------------

    const handleFile = useCallback(async (file: File) => {
        // Resize to 720px longest edge before inference
        const resizedFile = await resizeImage(file, 720);

        const previewUrl = URL.createObjectURL(resizedFile);
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
        formData.append("image", resizedFile);

        const depthPromise = (async () => {
            try {
                const res = await fetch("/api/image-labelifier/depth", {
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
                segFormData.append("image", resizedFile);
                const res = await fetch("/api/image-labelifier/segmentation", {
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
    // Reset — clear inference state to go back to upload view
    // -------------------------------------------------------------------------

    const handleReset = useCallback(() => {
        setInference({
            previewUrl: null,
            depthUrl: null,
            segments: null,
            depthLoading: false,
            segLoading: false,
            error: null,
        });
        setViewingItem(null);
    }, []);

    // -------------------------------------------------------------------------
    // Gallery item selection — load a saved example
    // -------------------------------------------------------------------------

    const handleSelectGalleryItem = useCallback(
        (item: GalleryItem) => {
            setViewingItem(item);
            setInference({
                previewUrl: item.originalUrl,
                depthUrl: item.depthUrl,
                segments: null,
                depthLoading: false,
                segLoading: true,
                error: null,
            });
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
        },
        []
    );

    const handleDeleteGalleryItem = useCallback(
        async (id: string) => {
            await fetch(`/api/image-labelifier/gallery/${id}`, { method: "DELETE" });
            setGalleryItems((prev) => prev.filter((item) => item.id !== id));
        },
        []
    );

    // -------------------------------------------------------------------------
    // Navigation
    // -------------------------------------------------------------------------

    const switchMode = useCallback(
        (m: ViewMode) => {
            setMode(m);
            router.replace(`?mode=${m}`, { scroll: false });
        },
        [router]
    );

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    const isLoading = inference.depthLoading || inference.segLoading;

    return (
        <div>
            {mode === "presentation" && (
                <PresentationView
                    inference={inference}
                    onFile={handleFile}
                    onReset={handleReset}
                    onSwitchToExpert={() => switchMode("expert")}
                    isLoading={isLoading}
                    viewingItem={viewingItem}
                    galleryItems={galleryItems}
                    onSelectGalleryItem={handleSelectGalleryItem}
                    onDeleteGalleryItem={handleDeleteGalleryItem}
                />
            )}

            {mode === "expert" && (
                <InferenceExplorer
                    inference={inference}
                    onReset={handleReset}
                    onSwitchToPresentation={() => switchMode("presentation")}
                    viewingItem={viewingItem}
                    galleryItems={galleryItems}
                    onSelectGalleryItem={handleSelectGalleryItem}
                    onDeleteGalleryItem={handleDeleteGalleryItem}
                />
            )}
        </div>
    );
}
