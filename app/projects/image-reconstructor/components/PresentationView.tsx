"use client";

import { useMemo } from "react";
import type { ProcessingState, GalleryItem } from "../lib/types";
import PlaybackPlayer from "./PlaybackPlayer";
import SaveToGallery from "./SaveToGallery";
import IconCircleButton from "@/app/components/ui/IconCircleButton";
import ExampleGalleryStrip from "@/app/components/ui/ExampleGalleryStrip";
import UploadDropZone from "@/app/components/ui/UploadDropZone";
import StatusPillRow from "@/app/components/ui/StatusPillRow";

interface Props {
  state: ProcessingState;
  onFile: (file: File) => void;
  onSwitchToExpert: () => void;
  galleryItems: GalleryItem[];
  onSelectGalleryItem: (item: GalleryItem) => void;
  onDeleteGalleryItem: (id: string) => void;
  onGallerySaved: () => void;
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
  onSwitchToExpert,
  galleryItems,
  onSelectGalleryItem,
  onDeleteGalleryItem,
  onGallerySaved,
}: Props) {
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
  const statusSteps = useMemo(
    () =>
      STATUS_PILLS.map(({ key, icon, label }) => ({
        id: key,
        icon,
        status: state[key],
        title: label,
      })),
    [state]
  );

  // ---- Empty state: upload prompt ----
  if (!state.originalImageUrl) {
    return (
      <UploadDropZone
        onFile={onFile}
        prompt="Drop an image or click to upload"
      >
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
          center
          thumbnailSize="md"
          className="items-center"
        />
      </UploadDropZone>
    );
  }

  // ---- Processing state ----
  if (isProcessing && !isComplete) {
    return (
      <div className="flex flex-col gap-6">
        {/* Toolbar */}
        <div className="flex items-center justify-end gap-2">
          <IconCircleButton
            onClick={onSwitchToExpert}
            icon="fa-flask"
            title="Expert mode"
          />
        </div>

        <div className="border border-dashed border-[#DDD] rounded-2xl p-10 text-center">
          <StatusPillRow steps={statusSteps} className="mb-4" />

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
        <IconCircleButton
          onClick={onSwitchToExpert}
          icon="fa-flask"
          title="Expert mode"
        />
      </div>

      {frameUrls.length > 0 && (
        <PlaybackPlayer stepImageUrls={frameUrls} videoUrl={state.videoUrl} />
      )}

      {/* Save to gallery (dev only) */}
      {frameUrls.length > 0 && (
        <SaveToGallery state={state} onSaved={onGallerySaved} />
      )}

      {state.error && <p className="text-red-500 text-xs">{state.error}</p>}
    </div>
  );
}
