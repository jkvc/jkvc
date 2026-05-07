"use client";

import { useRef, useState } from "react";
import type {
  GalleryItem,
  ProcessingState,
  Tunables,
} from "../lib/types";
import PhotoCanvas from "./PhotoCanvas";
import DebugPanel from "./DebugPanel";
import SaveToGallery from "./SaveToGallery";
import IconCircleButton from "@/app/components/ui/IconCircleButton";
import ExampleGalleryStrip from "@/app/components/ui/ExampleGalleryStrip";
import Pill from "@/app/components/editorial/Pill";

interface Props {
  state: ProcessingState;
  tunables: Tunables;
  setTunables: (t: Tunables | ((prev: Tunables) => Tunables)) => void;
  onFile: (file: File) => void;
  onReset: () => void;
  onResample: () => void;
  onRegenerate: () => void;
  onRerunBox: (id: string) => void;
  onSwitchToPresentation: () => void;
  galleryItems: GalleryItem[];
  onSelectGalleryItem: (item: GalleryItem) => void;
  onDeleteGalleryItem: (id: string) => void;
  onGallerySaved: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  idle: "text-[#BBB]",
  running: "text-gold",
  complete: "text-[#666]",
  error: "text-red-500",
};

const STATUS_ICON: Record<string, string> = {
  idle: "fa-circle-dashed",
  running: "fa-spinner fa-spin",
  complete: "fa-check",
  error: "fa-exclamation",
};

export default function DebugView({
  state,
  tunables,
  setTunables,
  onFile,
  onReset,
  onResample,
  onRegenerate,
  onRerunBox,
  onSwitchToPresentation,
  galleryItems,
  onSelectGalleryItem,
  onDeleteGalleryItem,
  onGallerySaved,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [highlight, setHighlight] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <IconCircleButton
          onClick={onSwitchToPresentation}
          icon="fa-arrow-left"
          title="Back to Presentation"
        />
        <IconCircleButton onClick={onReset} icon="fa-rotate" title="New image" />
      </div>

      {/* Gallery strip */}
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

      {state.originalImageUrl && (
        <>
          {/* Full-width canvas on top — same prominence as presentation. */}
          <PhotoCanvas
            imageUrl={state.originalImageUrl}
            boxes={state.boxes}
            captions={state.captions}
            tunables={tunables}
            highlightBoxId={highlight}
          />

          {state.error && (
            <p className="text-red-500 text-[12px]">{state.error}</p>
          )}

          {/* Two-col controls below: theme + inspector + save (left), tunables (right). */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4 min-w-0">
              <div>
                <p className="text-[10px] text-[#BBB] uppercase tracking-widest mb-2">
                  Theme
                </p>
                <p className="text-[11px] text-text-muted font-mono px-3 py-2 bg-[#F5F5F3] rounded-lg leading-relaxed">
                  {state.themeStatus === "running"
                    ? "…"
                    : state.theme || "(none yet)"}
                </p>
              </div>

              <p className="text-[10px] text-[#BBB] uppercase tracking-widest">
                Inspector
              </p>
              <div className="flex flex-col divide-y divide-[#EEE] border border-[#EEE] rounded-md overflow-hidden">
                {state.boxes.length === 0 && (
                  <p className="text-[11px] text-[#999] p-3">No boxes yet.</p>
                )}
                {state.boxes.map((b, i) => {
                  const c = state.captions[b.id];
                  const status = c?.status ?? "idle";
                  const isHover = highlight === b.id;
                  return (
                    <div
                      key={b.id}
                      onMouseEnter={() => setHighlight(b.id)}
                      onMouseLeave={() => setHighlight(null)}
                      className={`flex items-start gap-3 p-2 text-[11px] cursor-default ${
                        isHover ? "bg-[#F8F4E8]" : "bg-white"
                      }`}
                    >
                      <span className="font-mono text-[10px] text-[#999] w-6 shrink-0 text-right">
                        {i.toString().padStart(2, "0")}
                      </span>
                      <span className={`${STATUS_COLOR[status]} w-4 shrink-0`}>
                        <i
                          className={`fa-solid ${STATUS_ICON[status]} text-[10px]`}
                        />
                      </span>
                      <div className="flex-1 min-w-0">
                        {c && c.lines.length > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            {c.lines.map((line, li) => (
                              <span
                                key={li}
                                className="text-ink text-[12px] leading-snug"
                              >
                                {line}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#BBB]">—</span>
                        )}
                      </div>
                      <button
                        onClick={() => onRerunBox(b.id)}
                        className="text-[10px] uppercase tracking-widest text-[#888] hover:text-ink border border-transparent hover:border-[#DDD] rounded-full px-2 py-0.5 transition-colors shrink-0"
                        title="Re-run all captions (single-shot batch)"
                      >
                        <i className="fa-solid fa-rotate text-[10px]" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <SaveToGallery
                state={state}
                tunables={tunables}
                onSaved={onGallerySaved}
              />
            </div>

            <div className="min-w-0">
              <DebugPanel
                tunables={tunables}
                setTunables={setTunables}
                onResample={onResample}
                onRegenerate={onRegenerate}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
