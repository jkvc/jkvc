"use client";

import { useCallback, useState } from "react";
import type { SegmentResult } from "../lib/types";
import DotParallaxViewer from "./DotParallaxViewer";
import SegmentationMap from "./SegmentationMap";

const TEST_IMAGES = [
  { name: "mactree", src: "/test_images/mactree.jpg" },
  { name: "a", src: "/test_images/a.jpg" },
  { name: "b", src: "/test_images/b.jpg" },
  { name: "c", src: "/test_images/c.jpg" },
];

export default function DebugDepth() {
  const [depthUrl, setDepthUrl] = useState<string | null>(null);
  const [segments, setSegments] = useState<SegmentResult[] | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [depthLoading, setDepthLoading] = useState(false);
  const [segLoading, setSegLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = depthLoading || segLoading;

  const handleFile = useCallback(async (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));
    setDepthUrl(null);
    setSegments(null);
    setError(null);
    setDepthLoading(true);
    setSegLoading(true);

    const formData = new FormData();
    formData.append("image", file);

    // Fire depth and segmentation concurrently
    const depthPromise = (async () => {
      try {
        const res = await fetch("/api/text-image/depth", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Depth request failed");
        setDepthUrl(data.depthUrl);
      } catch (e) {
        setError((prev) =>
          prev
            ? `${prev}; Depth: ${e instanceof Error ? e.message : "Unknown"}`
            : `Depth: ${e instanceof Error ? e.message : "Unknown error"}`
        );
      } finally {
        setDepthLoading(false);
      }
    })();

    const segPromise = (async () => {
      try {
        // Need a separate FormData since the body stream can only be read once
        const segFormData = new FormData();
        segFormData.append("image", file);
        const res = await fetch("/api/text-image/segmentation", {
          method: "POST",
          body: segFormData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Segmentation request failed");
        setSegments(data.segments);
      } catch (e) {
        setError((prev) =>
          prev
            ? `${prev}; Seg: ${e instanceof Error ? e.message : "Unknown"}`
            : `Seg: ${e instanceof Error ? e.message : "Unknown error"}`
        );
      } finally {
        setSegLoading(false);
      }
    })();

    await Promise.all([depthPromise, segPromise]);
  }, []);

  const handleTestImage = useCallback(
    async (src: string) => {
      const res = await fetch(src);
      const blob = await res.blob();
      const file = new File([blob], src.split("/").pop() || "test.jpg", {
        type: blob.type,
      });
      handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="border-2 border-dashed border-base-300 hover:border-base-content/30 rounded-lg p-8 text-center transition-colors">
        <p className="text-base-content/50 text-sm mb-3">
          Upload an image to estimate depth &amp; segmentation
        </p>
        <input
          type="file"
          accept="image/*"
          className="file-input file-input-sm file-input-bordered rounded-full"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      <div>
        <p className="text-xs text-base-content/40 uppercase tracking-widest mb-2">
          Test images
        </p>
        <div className="flex gap-2">
          {TEST_IMAGES.map((img) => (
            <button
              key={img.name}
              className="rounded-lg overflow-hidden border border-base-300 hover:border-base-content/40 transition-colors w-20 h-20 p-0 cursor-pointer"
              onClick={() => handleTestImage(img.src)}
              disabled={loading}
            >
              <img
                src={img.src}
                alt={img.name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-error text-sm">{error}</div>}

      {/* Row 1: Original */}
      {previewUrl && (
        <div>
          <p className="text-xs text-base-content/40 uppercase tracking-widest mb-2">
            Original
          </p>
          <img
            src={previewUrl}
            alt="Original"
            className="w-full rounded-lg border border-base-300"
          />
        </div>
      )}

      {/* Row 2: Depth + Segmentation side by side */}
      {previewUrl && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-base-content/40 uppercase tracking-widest mb-2">
              Depth Map
            </p>
            {depthLoading ? (
              <div className="flex items-center justify-center aspect-video rounded-lg border border-base-300 bg-base-200/30">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>
            ) : depthUrl ? (
              <img
                src={depthUrl}
                alt="Depth map"
                className="w-full rounded-lg border border-base-300"
              />
            ) : (
              <div className="flex items-center justify-center aspect-video rounded-lg border border-base-300 bg-base-200/30 text-base-content/30 text-sm">
                No depth data
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-base-content/40 uppercase tracking-widest mb-2">
              Segmentation
            </p>
            {segLoading ? (
              <div className="flex items-center justify-center aspect-video rounded-lg border border-base-300 bg-base-200/30">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>
            ) : segments && previewUrl ? (
              <SegmentationMap originalUrl={previewUrl} segments={segments} />
            ) : (
              <div className="flex items-center justify-center aspect-video rounded-lg border border-base-300 bg-base-200/30 text-base-content/30 text-sm">
                No segmentation data
              </div>
            )}
          </div>
        </div>
      )}

      {/* Row 3: Particle parallax */}
      {depthUrl && previewUrl && (
        <DotParallaxViewer originalUrl={previewUrl} depthUrl={depthUrl} segments={segments ?? undefined} />
      )}
    </div>
  );
}
