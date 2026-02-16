"use client";

import { useCallback, useRef, useState } from "react";
import type { InferenceState } from "../TextImageClient";
import type { GalleryItem } from "../lib/types";
import type { ParticleConfig } from "./ParticleControls";
import { TEST_IMAGES } from "../lib/test-images";
import ParticleCanvas from "./ParticleCanvas";
import SegmentationMap from "./SegmentationMap";
import SaveToGallery from "./SaveToGallery";

interface Props {
  inference: InferenceState;
  onFile: (file: File) => void;
  viewingItem: GalleryItem | null;
}

export default function InferenceExplorer({ inference, onFile, viewingItem }: Props) {
  const { previewUrl, depthUrl, segments, depthLoading, segLoading, error } = inference;
  const loading = depthLoading || segLoading;
  const ready = !!(previewUrl && depthUrl && segments && !loading);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentConfig, setCurrentConfig] = useState<ParticleConfig | null>(null);

  const handleTestImage = useCallback(
    async (src: string) => {
      const res = await fetch(src);
      const blob = await res.blob();
      const file = new File([blob], src.split("/").pop() || "test.jpg", {
        type: blob.type,
      });
      onFile(file);
    },
    [onFile]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Upload */}
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
            if (f) onFile(f);
          }}
        />
      </div>

      {/* Test images */}
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

      {/* Loading state */}
      {previewUrl && !ready && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-xs text-base-content/30">
            {depthLoading && segLoading
              ? "Running depth estimation & segmentation"
              : depthLoading
                ? "Running depth estimation\u2026"
                : "Running segmentation\u2026"}
          </p>
        </div>
      )}

      {/* Results — only shown when both depth and segmentation are ready */}
      {ready && (
        <>
          {/* Original */}
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

          {/* Depth + Segmentation side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-base-content/40 uppercase tracking-widest mb-2">
                Depth Map
              </p>
              <img
                src={depthUrl}
                alt="Depth map"
                className="w-full rounded-lg border border-base-300"
              />
            </div>
            <div>
              <p className="text-xs text-base-content/40 uppercase tracking-widest mb-2">
                Segmentation
              </p>
              <SegmentationMap originalUrl={previewUrl} segments={segments} />
            </div>
          </div>

          {/* Particle parallax */}
          <ParticleCanvas
            originalUrl={previewUrl}
            depthUrl={depthUrl}
            segments={segments}
            canvasRefOut={canvasRef}
            onConfigChange={setCurrentConfig}
            initialConfig={viewingItem?.mode === "expert" ? viewingItem.config : undefined}
          />

          {/* Save to Gallery */}
          <SaveToGallery
            canvasRef={canvasRef}
            originalUrl={previewUrl}
            depthUrl={depthUrl}
            segments={segments}
            mode="expert"
            presetId={null}
            config={currentConfig}
          />
        </>
      )}
    </div>
  );
}
