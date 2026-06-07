"use client";

import { useRef, useState } from "react";
import type { InferenceState } from "../ImageLabelifierClient";
import type { GalleryItem } from "../lib/types";
import { PRESETS, type Preset } from "../lib/presets";
import ParticleCanvas from "./ParticleCanvas";
import SaveToGallery from "./SaveToGallery";
import type { ParticleConfig } from "../lib/particle-config";
import ExampleGalleryStrip from "@/app/components/ui/ExampleGalleryStrip";
import StatusPillRow from "@/app/components/ui/StatusPillRow";
import IconCircleButton from "@/app/components/ui/IconCircleButton";
import Pill from "@/app/components/editorial/Pill";
import StampShell from "@/app/components/ui/StampShell";

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

  // ---- Empty state ----
  if (!previewUrl) {
    return (
      <StampShell variant="card" bleed={false} className="w-full" faceClassName="w-full">
        <div className="flex w-full flex-col items-center gap-8 p-8 sm:p-12">
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
      </StampShell>
    );
  }

  // ---- Loading state ----
  if (!ready) {
    return (
      <StampShell variant="card" bleed={false} faceClassName="p-8 text-center">
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
        {error && <p className="text-hot text-xs mt-4">{error}</p>}
      </StampShell>
    );
  }

  // ---- Ready ----
  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar: preset selector (left) + actions (right) */}
      <div className="flex items-center justify-between">
        {/* Preset pills — left aligned */}
        <div className="flex gap-1.5">
          {PRESETS.map((preset) => (
            <IconCircleButton
              key={preset.id}
              onClick={() => setActivePreset(preset)}
              active={preset.id === activePreset.id}
              title={`${preset.labelEn} / ${preset.labelZh}`}
              label={preset.glyph}
              labelFont={preset.glyphFont}
            />
          ))}
        </div>

        {/* Action buttons — right aligned: expert · reset */}
        <div className="flex items-center gap-2">
          <IconCircleButton
            onClick={onSwitchToExpert}
            icon="fa-flask"
            title="Expert mode"
          />
          <span className="text-rule text-xs select-none">&middot;</span>
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
