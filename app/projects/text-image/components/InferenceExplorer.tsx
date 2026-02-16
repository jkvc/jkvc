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
        <ParticleCanvas
          originalUrl={previewUrl}
          depthUrl={depthUrl}
          segments={segments ?? undefined}
          canvasRefOut={canvasRef}
          onConfigChange={setCurrentConfig}
          initialConfig={viewingItem?.mode === "expert" ? viewingItem.config : undefined}
        />
      )}

      {/* Save to Gallery */}
      {depthUrl && previewUrl && segments && !depthLoading && !segLoading && (
        <SaveToGallery
          canvasRef={canvasRef}
          originalUrl={previewUrl}
          depthUrl={depthUrl}
          segments={segments}
          mode="expert"
          presetId={null}
          config={currentConfig}
        />
      )}
    </div>
  );
}
