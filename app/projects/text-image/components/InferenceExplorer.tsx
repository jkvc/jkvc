"use client";

import { useRef, useState } from "react";
import type { InferenceState } from "../TextImageClient";
import type { GalleryItem } from "../lib/types";
import type { ParticleConfig } from "./ParticleControls";
import ParticleCanvas from "./ParticleCanvas";
import SegmentationMap from "./SegmentationMap";
import SaveToGallery from "./SaveToGallery";

interface Props {
  inference: InferenceState;
  onFile: (file: File) => void;
  onReset: () => void;
  onSwitchToPresentation: () => void;
  viewingItem: GalleryItem | null;
  galleryItems: GalleryItem[];
  onSelectGalleryItem: (item: GalleryItem) => void;
  onDeleteGalleryItem: (id: string) => void;
}

export default function InferenceExplorer({
  inference,
  onFile,
  onReset,
  onSwitchToPresentation,
  viewingItem,
  galleryItems,
  onSelectGalleryItem,
  onDeleteGalleryItem,
}: Props) {
  const { previewUrl, depthUrl, segments, depthLoading, segLoading, error } = inference;
  const loading = depthLoading || segLoading;
  const ready = !!(previewUrl && depthUrl && segments && !loading);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentConfig, setCurrentConfig] = useState<ParticleConfig | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Top row: back (left) + reset (right) */}
      <div className="flex items-center justify-between">
        <button
          onClick={onSwitchToPresentation}
          className="flex items-center justify-center w-9 h-9 rounded-full border border-[#E0E0E0] text-[#AAA] hover:border-gold/50 hover:text-gold transition-all cursor-pointer"
          title="Back to Presentation"
        >
          <i className="fa-solid fa-arrow-left text-[13px]" />
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center w-9 h-9 rounded-full border border-[#E0E0E0] text-[#AAA] hover:border-gold/50 hover:text-gold transition-all cursor-pointer"
          title="New image"
        >
          <i className="fa-solid fa-rotate text-[13px]" />
        </button>
      </div>

      {/* Examples */}
      {galleryItems.length > 0 && (
        <div>
          <p className="text-[10px] text-[#BBB] uppercase tracking-widest mb-2">
            Examples
          </p>
          <div className="flex flex-wrap gap-2">
            {galleryItems.map((item) => (
              <div key={item.id} className="relative group">
                <button
                  className="rounded-lg overflow-hidden border border-[#E8E8E8] hover:border-gold/40 transition-colors w-10 h-10 p-0 cursor-pointer"
                  onClick={() => onSelectGalleryItem(item)}
                >
                  <img
                    src={item.originalUrl}
                    alt="Saved"
                    className="w-full h-full object-cover"
                  />
                </button>
                {process.env.NODE_ENV === "development" && (
                  <button
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#E0E0E0] text-[#999] hover:bg-red-400 hover:text-white text-[9px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onDeleteGalleryItem(item.id)}
                    title="Delete"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="text-red-500 text-[13px]">{error}</div>}

      {/* Loading state — keep the dashed box with pills inside */}
      {previewUrl && !ready && (
        <div className="border border-dashed border-[#DDD] rounded-2xl p-10 text-center">
          <div className="flex justify-center gap-3">
            <span className={`flex items-center justify-center w-10 h-10 rounded-full border ${
              depthLoading
                ? "border-gold/40 text-gold"
                : "border-[#D0D0D0] text-[#AAA]"
            }`}>
              {depthLoading
                ? <i className="fa-solid fa-mountain-sun text-[13px] animate-spin" />
                : <i className="fa-solid fa-check text-[13px]" />}
            </span>
            <span className={`flex items-center justify-center w-10 h-10 rounded-full border ${
              segLoading
                ? "border-gold/40 text-gold"
                : "border-[#D0D0D0] text-[#AAA]"
            }`}>
              {segLoading
                ? <i className="fa-solid fa-puzzle-piece text-[13px] animate-spin" />
                : <i className="fa-solid fa-check text-[13px]" />}
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      {ready && (
        <>
          {/* Original */}
          <div>
            <p className="text-[10px] text-[#BBB] uppercase tracking-widest mb-2">
              Original
            </p>
            <img
              src={previewUrl}
              alt="Original"
              className="w-full rounded-lg border border-[#E8E8E8]"
            />
          </div>

          {/* Depth + Segmentation side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-[#BBB] uppercase tracking-widest mb-2">
                Depth Map
              </p>
              <img
                src={depthUrl}
                alt="Depth map"
                className="w-full rounded-lg border border-[#E8E8E8]"
              />
            </div>
            <div>
              <p className="text-[10px] text-[#BBB] uppercase tracking-widest mb-2">
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

          {/* Save to Gallery — DevOnlyButton handles visibility internally */}
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
