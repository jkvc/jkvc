"use client";

import { useMemo, useRef } from "react";
import type {
  GalleryItem,
  ProcessingState,
  Tunables,
} from "../lib/types";
import PhotoCanvas from "./PhotoCanvas";
import SaveToGallery from "./SaveToGallery";
import IconCircleButton from "@/app/components/ui/IconCircleButton";
import ExampleGalleryStrip from "@/app/components/ui/ExampleGalleryStrip";
import StatusPillRow, {
  type StatusPillStep,
} from "@/app/components/ui/StatusPillRow";
import Pill from "@/app/components/editorial/Pill";
import StampShell from "@/app/components/ui/StampShell";

interface Props {
  state: ProcessingState;
  tunables: Tunables;
  onFile: (file: File) => void;
  onReset: () => void;
  onSwitchToDebug: () => void;
  galleryItems: GalleryItem[];
  onSelectGalleryItem: (item: GalleryItem) => void;
  onDeleteGalleryItem: (id: string) => void;
  onGallerySaved: () => void;
}

export default function PresentationView({
  state,
  tunables,
  onFile,
  onReset,
  onSwitchToDebug,
  galleryItems,
  onSelectGalleryItem,
  onDeleteGalleryItem,
  onGallerySaved,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const captionStatuses = Object.values(state.captions);
  const total = captionStatuses.length;
  const completed = captionStatuses.filter((c) => c.status === "complete")
    .length;
  const errored = captionStatuses.filter((c) => c.status === "error").length;
  const captionAggregate: StatusPillStep["status"] =
    total === 0
      ? "idle"
      : completed === total
        ? "complete"
        : completed + errored === total && errored > 0
          ? "error"
          : "running";

  const statusSteps = useMemo<StatusPillStep[]>(
    () => [
      {
        id: "theme",
        icon: "fa-palette",
        status: state.themeStatus,
        title: "Theme",
      },
      {
        id: "captions",
        icon: "fa-comment-dots",
        status: captionAggregate,
        title:
          total > 0
            ? `Captions (${completed}/${total})`
            : "Captions",
      },
    ],
    [state.themeStatus, captionAggregate, completed, total]
  );

  const isProcessing =
    state.themeStatus === "running" || captionAggregate === "running";
  const isComplete =
    state.themeStatus === "complete" && captionAggregate === "complete";

  // ---- Empty state: upload prompt ----
  if (!state.originalImageUrl) {
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
              imageUrl: item.thumbnailUrl,
              alt: "Example",
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

  // ---- With image: canvas + status + tools ----
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end gap-2">
        <IconCircleButton
          onClick={onSwitchToDebug}
          icon="fa-flask"
          title="Debug mode"
        />
        <span className="text-[#DDD] text-xs select-none">&middot;</span>
        <IconCircleButton onClick={onReset} icon="fa-rotate" title="New image" />
      </div>

      <PhotoCanvas
        imageUrl={state.originalImageUrl}
        boxes={state.boxes}
        captions={state.captions}
        tunables={{ ...tunables, showBoxes: false, showAnchors: false }}
      />

      {(isProcessing || (!isComplete && !state.error)) && (
        <StatusPillRow steps={statusSteps} />
      )}

      {state.error && (
        <p className="text-red-500 text-xs">{state.error}</p>
      )}

      {isComplete && (
        <SaveToGallery
          state={state}
          tunables={tunables}
          onSaved={onGallerySaved}
        />
      )}
    </div>
  );
}
