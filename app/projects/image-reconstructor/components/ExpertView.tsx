"use client";

import { useRef } from "react";
import type { ProcessingState, GalleryItem } from "../lib/types";
import StepTimeline from "./StepTimeline";
import PlaybackPlayer from "./PlaybackPlayer";
import SaveToGallery from "./SaveToGallery";

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

      {/* Gallery examples */}
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
                    src={item.thumbnailUrl}
                    alt="Example"
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

      {/* Upload prompt if no image yet */}
      {!state.originalImageUrl && (
        <div
          className="border border-dashed border-[#DDD] hover:border-gold/40 rounded-2xl p-10 text-center transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f && f.type.startsWith("image/")) onFile(f);
          }}
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
          <div className="text-2xl text-gold/30 mb-3">
            <i className="fa-solid fa-wand-magic-sparkles" />
          </div>
          <p className="text-[13px] text-[#AAA]">
            Drop an image or click to upload
          </p>
        </div>
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

      {/* Row 2: Sketch + Segmentation side by side */}
      {state.originalImageUrl && (
        <div className="grid grid-cols-2 gap-4">
          {/* Sketch */}
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

          {/* Segmentation overlay */}
          <div>
            <p className="text-[10px] text-[#BBB] uppercase tracking-widest mb-2">
              Segmentation
              {state.segments
                ? ` (${state.segments.length})`
                : ""}
            </p>
            {state.segOverlayUrl ? (
              <img
                src={state.segOverlayUrl}
                alt="Segmentation overlay"
                className="w-full rounded-lg border border-[#E8E8E8] aspect-square object-cover"
              />
            ) : (
              <div className="w-full rounded-lg border border-dashed border-[#DDD] aspect-square flex items-center justify-center">
                {state.segStatus === "running" ||
                state.sketchStatus === "running" ||
                state.compositingStatus === "running" ? (
                  <i className="fa-solid fa-spinner fa-spin text-gold text-[16px]" />
                ) : (
                  <span className="text-[#CCC] text-[12px]">Waiting</span>
                )}
              </div>
            )}
          </div>
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
