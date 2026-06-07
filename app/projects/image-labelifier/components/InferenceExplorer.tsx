"use client";

import { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import type { InferenceState } from "../ImageLabelifierClient";
import type { GalleryItem } from "../lib/types";
import type { ParticleConfig } from "../lib/particle-config";
import ParticleCanvas from "./ParticleCanvas";
import SegmentationMap from "./SegmentationMap";
import SaveToGallery from "./SaveToGallery";
import ExampleGalleryStrip from "@/app/components/ui/ExampleGalleryStrip";
import StatusPillRow from "@/app/components/ui/StatusPillRow";
import IconCircleButton from "@/app/components/ui/IconCircleButton";
import StampShell from "@/app/components/ui/StampShell";
import { STAMP_CARD_SHADOW, STAMP_FACE } from "@/app/lib/stamp";

interface Props {
  inference: InferenceState;
  onReset: () => void;
  onSwitchToPresentation: () => void;
  viewingItem: GalleryItem | null;
  galleryItems: GalleryItem[];
  onSelectGalleryItem: (item: GalleryItem) => void;
  onDeleteGalleryItem: (id: string) => void;
}

export default function InferenceExplorer({
  inference,
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
        <IconCircleButton
          onClick={onSwitchToPresentation}
          icon="fa-arrow-left"
          title="Back to Presentation"
        />
        <IconCircleButton
          onClick={onReset}
          icon="fa-rotate"
          title="New image"
        />
      </div>

      {/* Examples */}
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
      />

      {error && <div className="text-hot text-xs">{error}</div>}

      {/* Loading state */}
      {previewUrl && !ready && (
        <StampShell variant="card" bleed={false} faceClassName="p-8 text-center">
          <StatusPillRow
            steps={[
              {
                id: "depth",
                icon: "fa-mountain-sun",
                status: depthLoading ? "running" : "complete",
                title: "Depth",
              },
              {
                id: "segment",
                icon: "fa-puzzle-piece",
                status: segLoading ? "running" : "complete",
                title: "Segmentation",
              },
            ]}
          />
        </StampShell>
      )}

      {/* Results */}
      {ready && (
        <>
          {/* Original */}
          <div>
            <p className="caption-mono text-ink-faint mb-2">Original</p>
            <div className={twMerge(STAMP_FACE, STAMP_CARD_SHADOW, "overflow-hidden")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Original"
                className="w-full h-auto block"
              />
            </div>
          </div>

          {/* Depth + Segmentation side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="caption-mono text-ink-faint mb-2">Depth Map</p>
              <div className={twMerge(STAMP_FACE, STAMP_CARD_SHADOW, "overflow-hidden")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={depthUrl}
                  alt="Depth map"
                  className="w-full h-auto block"
                />
              </div>
            </div>
            <div>
              <p className="caption-mono text-ink-faint mb-2">Segmentation</p>
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
