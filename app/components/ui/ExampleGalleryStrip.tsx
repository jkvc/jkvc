"use client";

import { useState } from "react";
import LabeledDivider from "@/app/components/editorial/LabeledDivider";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import StampShell from "@/app/components/ui/StampShell";

export interface ExampleGalleryItem {
  id: string;
  imageUrl: string;
  alt?: string;
}

type ThumbnailSize = "sm" | "md";

interface Props {
  items: ExampleGalleryItem[];
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  title?: string;
  thumbnailSize?: ThumbnailSize;
  center?: boolean;
  className?: string;
  showTitle?: boolean;
  deleteInDevOnly?: boolean;
}

const SIZE_MAP: Record<ThumbnailSize, string> = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
};

export default function ExampleGalleryStrip({
  items,
  onSelect,
  onDelete,
  title = "Examples",
  thumbnailSize = "sm",
  center = false,
  className = "",
  showTitle = true,
  deleteInDevOnly = true,
}: Props) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const showDelete = !!onDelete && (!deleteInDevOnly || process.env.NODE_ENV === "development");

  if (items.length === 0 && pendingDeleteId === null) return null;

  return (
    <div className={`flex flex-col gap-2 ${center ? "items-center" : ""} ${className}`}>
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete example?"
        message="This removes the saved sample from the gallery."
        confirmLabel="Delete"
        onConfirm={() => {
          const id = pendingDeleteId;
          setPendingDeleteId(null);
          if (id && onDelete) onDelete(id);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
      {showTitle && <LabeledDivider>{title}</LabeledDivider>}
      <div className={`flex flex-wrap gap-2 ${center ? "justify-center" : ""}`}>
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item.id);
              }}
              className="group cursor-pointer p-0"
            >
              <StampShell
                variant="control"
                interactive
                inline
                bleed={false}
                faceClassName={`overflow-hidden p-0 hover:border-hot ${SIZE_MAP[thumbnailSize]}`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.alt ?? "Example"}
                  className="h-full w-full object-cover"
                />
              </StampShell>
            </button>
            {showDelete && (
              <button
                type="button"
                aria-label="Delete example"
                className="absolute -top-1.5 -right-1.5 z-10 w-4 h-4 bg-hot text-white hover:bg-ink text-[9px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity border border-ink"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPendingDeleteId(item.id);
                }}
              >
                <i className="fa-solid fa-xmark" aria-hidden />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
