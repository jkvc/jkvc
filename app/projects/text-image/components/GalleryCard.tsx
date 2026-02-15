"use client";

import type { GalleryItem } from "../lib/types";

interface Props {
  item: GalleryItem;
  onDelete: (id: string) => void;
}

export default function GalleryCard({ item, onDelete }: Props) {
  return (
    <div className="relative group overflow-hidden rounded-lg aspect-square">
      <img
        src={item.imageUrl}
        alt={item.labels.join(", ")}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />
      <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex justify-end">
          <button
            className="btn btn-xs btn-circle btn-ghost text-white hover:bg-white/20"
            onClick={() => onDelete(item.id)}
          >
            &times;
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {item.labels.slice(0, 4).map((label) => (
            <span
              key={label}
              className="text-[10px] text-white/70 border border-white/30 rounded-full px-2 py-0.5"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
