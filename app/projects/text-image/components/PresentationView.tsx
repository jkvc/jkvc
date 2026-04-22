"use client";

import { useRef, useState } from "react";
import type { InferenceState } from "../TextImageClient";
import type { GalleryItem } from "../lib/types";
import { PRESETS, type Preset } from "../lib/presets";
import ParticleCanvas from "./ParticleCanvas";
import SaveToGallery from "./SaveToGallery";
import type { ParticleConfig } from "../lib/particle-config";
import ExampleGalleryStrip from "@/app/components/ui/ExampleGalleryStrip";
import StatusPillRow from "@/app/components/ui/StatusPillRow";
import IconCircleButton from "@/app/components/ui/IconCircleButton";
import Pill from "@/app/components/editorial/Pill";

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

  // -------------------------------------------------------------------------
  // Empty state — pill upload button with examples below
  // -------------------------------------------------------------------------

  if (!previewUrl) {
    return (
      <div className="flex flex-col items-center gap-8">
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

        <Pill
          onClick={() => fileInputRef.current?.click()}
          icon="fa-arrow-up-from-bracket"
        >
          Upload image
        </Pill>

        <ExampleGalleryStrip
          items={galleryItems.map((item) => ({
            id: item.id,
            imageUrl: item.originalUrl,
            alt: "Saved",
          }))}
          onSelect={(id) => {
            const item = galleryItems.find((g) => g.id === id);
            if (item) onSelectGalleryItem(item);
          }}
          onDelete={onDeleteGalleryItem}
          title="Or choose from an example"
          center
          thumbnailSize="md"
          className="items-center w-full"
        />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Loading state — keep the dashed box with pills inside
  // -------------------------------------------------------------------------

  if (!ready) {
    return (
      <div className="border border-dashed border-[#DDD] rounded-2xl p-10 text-center">
        <StatusPillRow
          steps={[
            {
              id: "depth",
              icon: "fa-mountain-sun",
              status: inference.depthLoading ? "running" : "complete",
              title: "Depth",
            },
            {
              id: "segment",
              icon: "fa-puzzle-piece",
              status: inference.segLoading ? "running" : "complete",
              title: "Segmentation",
            },
          ]}
        />
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
          <IconCircleButton
            onClick={onSwitchToExpert}
            icon="fa-flask"
            title="Expert mode"
          />
          <span className="text-[#DDD] text-xs select-none">&middot;</span>
          <IconCircleButton
            onClick={onReset}
            icon="fa-rotate"
            title="New image"
          />
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
