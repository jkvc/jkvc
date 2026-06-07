"use client";

import { useRef } from "react";
import { twMerge } from "tailwind-merge";
import type { ProcessingState, GalleryItem } from "../lib/types";
import StepTimeline from "./StepTimeline";
import PlaybackPlayer from "./PlaybackPlayer";
import SaveToGallery from "./SaveToGallery";
import IconCircleButton from "@/app/components/ui/IconCircleButton";
import ExampleGalleryStrip from "@/app/components/ui/ExampleGalleryStrip";
import Pill from "@/app/components/editorial/Pill";
import { STAMP_CARD_SHADOW, STAMP_FACE } from "@/app/lib/stamp";

interface Props {
  state: ProcessingState;
  onFile: (file: File) => void;
  onReset: () => void;
  onSwitchToPresentation: () => void;
  galleryItems: GalleryItem[];
  onSelectGalleryItem: (item: GalleryItem) => void;
  onDeleteGalleryItem: (id: string) => void;
  onGallerySaved: () => void;
}

export default function ExpertView({
  state,
  onFile,
  onReset,
  onSwitchToPresentation,
  galleryItems,
  onSelectGalleryItem,
  onDeleteGalleryItem,
  onGallerySaved,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isComplete =
    state.compositingStatus === "complete" &&
    (state.animationStatus === "complete" || state.animationStatus === "idle");

  const frameUrls = state.frames.map((f) => f.compositeUrl);

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

      {/* Gallery examples */}
      <ExampleGalleryStrip
        items={galleryItems.map((item) => ({
          id: item.id,
          imageUrl: item.thumbnailUrl,
          alt: "Example",
        }))}
        onSelect={(id) => {
          const item = galleryItems.find((g) => g.id === id);
          if (item) onSelectGalleryItem(item);
        }}
        onDelete={onDeleteGalleryItem}
      />

      {/* Upload prompt if no image yet */}
      {!state.originalImageUrl && (
        <div className="flex justify-center">
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
        </div>
      )}

      {/* Row 1: Original */}
      {state.originalImageUrl && (
        <div>
          <p className="caption-mono text-ink-faint mb-2">Original</p>
          <div className={twMerge(STAMP_FACE, STAMP_CARD_SHADOW, "overflow-hidden")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.originalImageUrl}
              alt="Original"
              className="w-full h-auto block aspect-square object-cover"
            />
          </div>
        </div>
      )}

      {/* Row 2: Sketch */}
      {state.originalImageUrl && (
        <div>
          <p className="caption-mono text-ink-faint mb-2">Sketch</p>
          {state.sketchUrl ? (
            <div className={twMerge(STAMP_FACE, STAMP_CARD_SHADOW, "overflow-hidden")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.sketchUrl}
                alt="Sketch"
                className="w-full h-auto block aspect-square object-cover"
              />
            </div>
          ) : (
            <div className="w-full border border-dashed border-rule aspect-square flex items-center justify-center">
              {state.sketchStatus === "running" ? (
                <i className="fa-solid fa-spinner fa-spin text-gold text-base" />
              ) : (
                <span className="text-ink-faint text-xs">Waiting</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {state.error && (
        <div className="text-hot text-xs">{state.error}</div>
      )}

      {/* Color-in steps timeline */}
      {(state.frames.length > 0 || state.compositingStatus === "running") && (
        <StepTimeline
          frames={state.frames}
          isRunning={state.compositingStatus === "running"}
          currentLabel={state.currentStepLabel}
        />
      )}

      {/* Animation prompt + status */}
      {state.promptStatus !== "idle" && (
        <div>
          <p className="caption-mono text-ink-faint mb-2">Animation</p>
          {state.animationPrompt && (
            <p className={twMerge(STAMP_FACE, "text-xs text-ink-muted font-mono px-3 py-2 bg-surface-sunken mb-2 leading-relaxed")}>
              {state.animationPrompt}
            </p>
          )}
          <div className={twMerge(STAMP_FACE, "flex items-center gap-2 px-3 py-2 bg-surface-sunken")}>
            <span
              className={`flex items-center justify-center w-7 h-7 border ${
                state.animationStatus === "running" || state.promptStatus === "running"
                  ? "border-gold/40 text-gold"
                  : "border-rule text-ink-faint"
              }`}
            >
              {state.animationStatus === "running" || state.promptStatus === "running" ? (
                <i className="fa-solid fa-film text-xs animate-spin" />
              ) : (
                <i className="fa-solid fa-check text-xs" />
              )}
            </span>
            <span className="text-xs text-ink-muted">
              {state.promptStatus === "running"
                ? "Generating prompt..."
                : state.animationStatus === "running"
                ? "Generating video..."
                : state.animationStatus === "complete"
                ? "Video ready"
                : "Waiting"}
            </span>
          </div>
        </div>
      )}

      {/* Playback */}
      {isComplete && frameUrls.length > 0 && (
        <div>
          <p className="caption-mono text-ink-faint mb-2">Playback</p>
          <PlaybackPlayer
            stepImageUrls={frameUrls}
            videoUrl={state.videoUrl}
            showPhasePill
          />
        </div>
      )}

      {/* Save to gallery (dev only) */}
      {isComplete && frameUrls.length > 0 && (
        <SaveToGallery state={state} onSaved={onGallerySaved} />
      )}
    </div>
  );
}
