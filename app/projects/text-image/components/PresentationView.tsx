"use client";

import { useCallback, useRef, useState } from "react";
import type { InferenceState } from "../TextImageClient";
import type { GalleryItem } from "../lib/types";
import { PRESETS, type Preset } from "../lib/presets";
import ParticleCanvas from "./ParticleCanvas";
import SaveToGallery from "./SaveToGallery";
import type { ParticleConfig } from "./ParticleControls";

interface Props {
  inference: InferenceState;
  onFile: (file: File) => void;
  onReset: () => void;
  onSwitchToExpert: () => void;
  isLoading: boolean;
  viewingItem: GalleryItem | null;
  galleryItems: GalleryItem[];
  onSelectGalleryItem: (item: GalleryItem) => void;
  onDeleteGalleryItem: (id: string) => void;
}

export default function PresentationView({
  inference,
  onFile,
  onReset,
  onSwitchToExpert,
  isLoading,
  viewingItem,
  galleryItems,
  onSelectGalleryItem,
  onDeleteGalleryItem,
}: Props) {
  const { previewUrl, depthUrl, segments, error } = inference;

  const resolvedInitialPreset = viewingItem?.mode === "presentation" && viewingItem.presetId
    ? PRESETS.find((p) => p.id === viewingItem.presetId) ?? PRESETS[0]
    : PRESETS[0];

  const [activePreset, setActivePreset] = useState<Preset>(resolvedInitialPreset);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentConfig, setCurrentConfig] = useState<ParticleConfig | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ready = !!(depthUrl && segments && previewUrl && !isLoading);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f && f.type.startsWith("image/")) onFile(f);
    },
    [onFile]
  );

  // -------------------------------------------------------------------------
  // Empty state — upload prompt with examples inside
  // -------------------------------------------------------------------------

  if (!previewUrl) {
    return (
      <div
        className="border border-dashed border-[#DDD] hover:border-gold/40 rounded-2xl p-10 text-center transition-colors cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />

        <div className="text-2xl text-gold/30 mb-3">✦</div>
        <p className="text-[13px] text-[#AAA] mb-6">
          Drop an image or click to upload
        </p>

        {/* Examples: gallery items */}
        {galleryItems.length > 0 && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] text-[#CCC] uppercase tracking-widest">
              Examples
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {galleryItems.map((item) => (
                <div key={item.id} className="relative group">
                  <button
                    className="rounded-lg overflow-hidden border border-[#E8E8E8] hover:border-gold/40 transition-colors w-14 h-14 p-0 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectGalleryItem(item);
                    }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGalleryItem(item.id);
                      }}
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
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Loading state — keep the dashed box with pills inside
  // -------------------------------------------------------------------------

  if (!ready) {
    return (
      <div className="border border-dashed border-[#DDD] rounded-2xl p-10 text-center">
        <div className="flex justify-center gap-3">
          <span className={`flex items-center justify-center w-10 h-10 rounded-full border ${
            inference.depthLoading
              ? "border-gold/40 text-gold"
              : "border-[#D0D0D0] text-[#AAA]"
          }`}>
            {inference.depthLoading
              ? <i className="fa-solid fa-mountain-sun text-[13px] animate-spin" />
              : <i className="fa-solid fa-check text-[13px]" />}
          </span>
          <span className={`flex items-center justify-center w-10 h-10 rounded-full border ${
            inference.segLoading
              ? "border-gold/40 text-gold"
              : "border-[#D0D0D0] text-[#AAA]"
          }`}>
            {inference.segLoading
              ? <i className="fa-solid fa-puzzle-piece text-[13px] animate-spin" />
              : <i className="fa-solid fa-check text-[13px]" />}
          </span>
        </div>
        {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Ready — preset selector + particle canvas
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar: preset selector (left) + actions (right) */}
      <div className="flex items-center justify-between">
        {/* Preset circles — left aligned */}
        <div className="flex gap-2">
          {PRESETS.map((preset) => {
            const isActive = preset.id === activePreset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setActivePreset(preset)}
                className={`flex items-center justify-center w-9 h-9 rounded-full text-[12px] transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gold text-white shadow-sm"
                    : "bg-[#F0EDE8] text-[#AAA] hover:text-gold hover:bg-[#E8E4DD]"
                }`}
                title={`${preset.labelEn} / ${preset.labelZh}`}
              >
                <span className="font-bold" style={preset.glyphFont ? { fontFamily: preset.glyphFont, fontWeight: 900 } : undefined}>
                  {preset.glyph}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action buttons — right aligned: expert · reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToExpert}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-[#E0E0E0] text-[#AAA] hover:border-gold/50 hover:text-gold transition-all"
            title="Expert mode"
          >
            <i className="fa-solid fa-flask text-[13px]" />
          </button>
          <span className="text-[#DDD] text-xs select-none">&middot;</span>
          <button
            onClick={onReset}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-[#E0E0E0] text-[#AAA] hover:border-gold/50 hover:text-gold transition-all"
            title="New image"
          >
            <i className="fa-solid fa-rotate text-[13px]" />
          </button>
        </div>
      </div>

      {/* Particle canvas */}
      <ParticleCanvas
        originalUrl={previewUrl}
        depthUrl={depthUrl}
        segments={segments ?? undefined}
        fixedConfig={activePreset.config}
        canvasRefOut={canvasRef}
        onConfigChange={setCurrentConfig}
        initialConfig={viewingItem?.mode === "presentation" ? viewingItem.config : undefined}
      />

      {/* Save to Gallery — DevOnlyButton handles visibility internally */}
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
