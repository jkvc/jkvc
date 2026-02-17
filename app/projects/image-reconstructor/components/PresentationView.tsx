"use client";

import { useCallback, useRef } from "react";
import type { ProcessingState, GalleryItem } from "../lib/types";
import PlaybackPlayer from "./PlaybackPlayer";

interface Props {
  state: ProcessingState;
  onFile: (file: File) => void;
  onReset: () => void;
  onSwitchToExpert: () => void;
  galleryItems: GalleryItem[];
  onSelectGalleryItem: (item: GalleryItem) => void;
  onDeleteGalleryItem: (id: string) => void;
}

type StatusKey = "sketchStatus" | "segStatus" | "promptStatus" | "animationStatus";

const STATUS_PILLS: { key: StatusKey; icon: string; label: string }[] = [
  { key: "sketchStatus", icon: "fa-pencil", label: "Sketch" },
  { key: "segStatus", icon: "fa-puzzle-piece", label: "Segment" },
  { key: "promptStatus", icon: "fa-brain", label: "Prompt" },
  { key: "animationStatus", icon: "fa-film", label: "Animate" },
];

export default function PresentationView({
  state,
  onFile,
  onReset,
  onSwitchToExpert,
  galleryItems,
  onSelectGalleryItem,
  onDeleteGalleryItem,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f && f.type.startsWith("image/")) onFile(f);
    },
    [onFile]
  );

  const isProcessing =
    state.sketchStatus === "running" ||
    state.segStatus === "running" ||
    state.promptStatus === "running" ||
    state.animationStatus === "running" ||
    state.compositingStatus === "running";

  const isComplete =
    state.compositingStatus === "complete" &&
    (state.animationStatus === "complete" || state.animationStatus === "idle");

  const frameUrls = state.frames.map((f) => f.compositeUrl);

  // ---- Empty state: upload prompt ----
  if (!state.originalImageUrl) {
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

        <div className="text-2xl text-gold/30 mb-3">
          <i className="fa-solid fa-wand-magic-sparkles" />
        </div>
        <p className="text-[13px] text-[#AAA] mb-6">
          Drop an image or click to upload
        </p>

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
                      src={item.thumbnailUrl}
                      alt="Example"
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

  // ---- Processing state ----
  if (isProcessing && !isComplete) {
    return (
      <div className="flex flex-col gap-6">
        {/* Toolbar */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onSwitchToExpert}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-[#E0E0E0] text-[#AAA] hover:border-gold/50 hover:text-gold transition-all cursor-pointer"
            title="Expert mode"
          >
            <i className="fa-solid fa-flask text-[13px]" />
          </button>
        </div>

        <div className="border border-dashed border-[#DDD] rounded-2xl p-10 text-center">
          <div className="flex justify-center gap-3 mb-4">
            {STATUS_PILLS.map(({ key, icon }) => {
              const status = state[key];
              return (
                <span
                  key={key}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border ${
                    status === "running"
                      ? "border-gold/40 text-gold"
                      : status === "complete"
                      ? "border-[#D0D0D0] text-[#AAA]"
                      : "border-[#E8E8E8] text-[#CCC]"
                  }`}
                >
                  {status === "running" ? (
                    <i
                      className={`fa-solid ${icon} text-[13px] animate-spin`}
                    />
                  ) : status === "complete" ? (
                    <i className="fa-solid fa-check text-[13px]" />
                  ) : (
                    <i className={`fa-solid ${icon} text-[13px]`} />
                  )}
                </span>
              );
            })}
          </div>

          {state.currentStepLabel && (
            <p className="text-[12px] text-text-muted">
              {state.currentStepLabel}
            </p>
          )}

          {state.error && (
            <p className="text-red-500 text-xs mt-3">{state.error}</p>
          )}
        </div>
      </div>
    );
  }

  // ---- Complete: playback ----
  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onSwitchToExpert}
          className="flex items-center justify-center w-9 h-9 rounded-full border border-[#E0E0E0] text-[#AAA] hover:border-gold/50 hover:text-gold transition-all cursor-pointer"
          title="Expert mode"
        >
          <i className="fa-solid fa-flask text-[13px]" />
        </button>
      </div>

      {frameUrls.length > 0 && (
        <PlaybackPlayer stepImageUrls={frameUrls} videoUrl={state.videoUrl} />
      )}

      {state.error && <p className="text-red-500 text-xs">{state.error}</p>}
    </div>
  );
}
