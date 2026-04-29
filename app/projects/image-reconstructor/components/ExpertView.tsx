"use client";

import type { ProcessingState, GalleryItem } from "../lib/types";
import StepTimeline from "./StepTimeline";
import PlaybackPlayer from "./PlaybackPlayer";
import SaveToGallery from "./SaveToGallery";
import IconCircleButton from "@/app/components/ui/IconCircleButton";
import ExampleGalleryStrip from "@/app/components/ui/ExampleGalleryStrip";
import UploadDropZone from "@/app/components/ui/UploadDropZone";

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
        <UploadDropZone
          onFile={onFile}
          prompt="Drop an image or click to upload"
          className="mb-0"
        />
      )}

      {/* Row 1: Original (full width) */}
      {state.originalImageUrl && (
        <div>
          <p className="text-[10px] text-[#BBB] uppercase tracking-widest mb-2">
            Original
          </p>
          <img
            src={state.originalImageUrl}
            alt="Original"
            className="w-full rounded-lg border border-[#E8E8E8] aspect-square object-cover"
          />
        </div>
      )}

      {/* Row 2: Sketch */}
      {state.originalImageUrl && (
        <div>
          <p className="text-[10px] text-[#BBB] uppercase tracking-widest mb-2">
            Sketch
          </p>
          {state.sketchUrl ? (
            <img
              src={state.sketchUrl}
              alt="Sketch"
              className="w-full rounded-lg border border-[#E8E8E8] aspect-square object-cover"
            />
          ) : (
            <div className="w-full rounded-lg border border-dashed border-[#DDD] aspect-square flex items-center justify-center">
              {state.sketchStatus === "running" ? (
                <i className="fa-solid fa-spinner fa-spin text-gold text-[16px]" />
              ) : (
                <span className="text-[#CCC] text-[12px]">Waiting</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {state.error && (
        <div className="text-red-500 text-[13px]">{state.error}</div>
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
          <p className="text-[10px] text-[#BBB] uppercase tracking-widest mb-2">
            Animation
          </p>
          {state.animationPrompt && (
            <p className="text-[11px] text-text-muted font-mono px-3 py-2 bg-[#F5F5F3] rounded-lg mb-2 leading-relaxed">
              {state.animationPrompt}
            </p>
          )}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F5F3] rounded-xl">
            <span
              className={`flex items-center justify-center w-7 h-7 rounded-full border ${
                state.animationStatus === "running" ||
                state.promptStatus === "running"
                  ? "border-gold/40 text-gold"
                  : "border-[#D0D0D0] text-[#AAA]"
              }`}
            >
              {state.animationStatus === "running" ||
              state.promptStatus === "running" ? (
                <i className="fa-solid fa-film text-[11px] animate-spin" />
              ) : (
                <i className="fa-solid fa-check text-[11px]" />
              )}
            </span>
            <span className="text-[12px] text-text-muted">
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
          <p className="text-[10px] text-[#BBB] uppercase tracking-widest mb-2">
            Playback
          </p>
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
