"use client";

import { useCallback, useRef, useState } from "react";
import type { InferenceState } from "../TextImageClient";
import type { GalleryItem } from "../lib/types";
import { PRESETS, type Preset } from "../lib/presets";
import { TEST_IMAGES } from "../lib/test-images";
import ParticleCanvas from "./ParticleCanvas";
import SaveToGallery from "./SaveToGallery";
import type { ParticleConfig } from "./ParticleControls";

interface Props {
  inference: InferenceState;
  onFile: (file: File) => void;
  isLoading: boolean;
  viewingItem: GalleryItem | null;
}

export default function PresentationView({ inference, onFile, isLoading, viewingItem }: Props) {
  const { previewUrl, depthUrl, segments, error } = inference;

  const resolvedInitialPreset = viewingItem?.mode === "presentation" && viewingItem.presetId
    ? PRESETS.find((p) => p.id === viewingItem.presetId) ?? PRESETS[0]
    : PRESETS[0];

  const [activePreset, setActivePreset] = useState<Preset>(resolvedInitialPreset);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentConfig, setCurrentConfig] = useState<ParticleConfig | null>(null);

  const ready = !!(depthUrl && segments && previewUrl && !isLoading);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f && f.type.startsWith("image/")) onFile(f);
    },
    [onFile]
  );

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

  // -------------------------------------------------------------------------
  // Empty state — upload prompt + test images
  // -------------------------------------------------------------------------

  if (!previewUrl) {
    return (
      <div className="flex flex-col gap-6">
        <div
          className="border-2 border-dashed border-base-300 hover:border-base-content/30 rounded-2xl p-16 text-center transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="text-4xl text-base-content/20">✦</div>
            <p className="text-base-content/50 text-sm">
              Drop an image to get started
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
        </div>

        {/* Test images */}
        <div>
          <p className="text-xs text-base-content/40 uppercase tracking-widest mb-2">
            Examples
          </p>
          <div className="flex gap-2">
            {TEST_IMAGES.map((img) => (
              <button
                key={img.name}
                className="rounded-lg overflow-hidden border border-base-300 hover:border-base-content/40 transition-colors w-20 h-20 p-0 cursor-pointer"
                onClick={() => handleTestImage(img.src)}
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
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Loading state — full-screen overlay until both depth + seg are ready
  // -------------------------------------------------------------------------

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <span className="loading loading-spinner loading-lg text-primary" />
        <div className="text-center">
          <p className="text-sm text-base-content/60">
            Processing image&hellip;
          </p>
          <p className="text-xs text-base-content/30 mt-1">
            {inference.depthLoading && inference.segLoading
              ? "Running depth estimation & segmentation"
              : inference.depthLoading
                ? "Running depth estimation&hellip;"
                : inference.segLoading
                  ? "Running segmentation&hellip;"
                  : "Preparing visualization"}
          </p>
        </div>
        {error && <p className="text-error text-xs">{error}</p>}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Ready — preset selector + particle canvas
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6">
      {/* Preset selector — circular dots */}
      <div className="flex items-center justify-center gap-3">
        {PRESETS.map((preset) => {
          const isActive = preset.id === activePreset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setActivePreset(preset)}
              className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                isActive
                  ? "bg-base-content text-base-100 scale-110 shadow-lg"
                  : "bg-base-200/60 text-base-content/50 hover:bg-base-200 hover:text-base-content/80 hover:scale-105"
              }`}
              title={`${preset.labelEn} / ${preset.labelZh}`}
            >
              <span className="text-sm leading-none">{preset.emoji}</span>
            </button>
          );
        })}
      </div>

      {/* Active preset label */}
      <p className="text-center text-xs text-base-content/40">
        {activePreset.labelEn} &middot; {activePreset.labelZh}
      </p>

      {/* Particle canvas (no controls, fixed config from preset) */}
      <ParticleCanvas
        originalUrl={previewUrl}
        depthUrl={depthUrl}
        segments={segments ?? undefined}
        fixedConfig={activePreset.config}
        canvasRefOut={canvasRef}
        onConfigChange={setCurrentConfig}
        initialConfig={viewingItem?.mode === "presentation" ? viewingItem.config : undefined}
      />

      {/* Change image: file picker + test thumbnails */}
      <div className="flex flex-col items-center gap-3">
        <label className="btn btn-ghost btn-sm rounded-full text-base-content/40 hover:text-base-content/60">
          <span>Change image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
        </label>
        <div className="flex gap-1.5">
          {TEST_IMAGES.map((img) => (
            <button
              key={img.name}
              className="rounded-md overflow-hidden border border-base-300 hover:border-base-content/40 transition-colors w-10 h-10 p-0 cursor-pointer"
              onClick={() => handleTestImage(img.src)}
              title={img.name}
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

      {/* Save to Gallery */}
      <SaveToGallery
        canvasRef={canvasRef}
        originalUrl={previewUrl}
        depthUrl={depthUrl}
        segments={segments}
        mode="presentation"
        presetId={activePreset.id}
        config={currentConfig}
      />
    </div>
  );
}
