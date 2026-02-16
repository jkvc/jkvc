"use client";

import { useCallback, useEffect, useState } from "react";
import type { GalleryItem } from "../lib/types";
import GalleryCard from "./GalleryCard";

interface Props {
  onViewItem: (item: GalleryItem) => void;
}

export default function Gallery({ onViewItem }: Props) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/text-image/gallery");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch {
      // gallery fetch error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = useCallback(
    async (id: string) => {
      await fetch(`/api/text-image/gallery/${id}`, { method: "DELETE" });
      fetchItems();
    },
    [fetchItems]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner text-base-content/30" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-base-content/40 py-12">
        No saved images yet. Create one and hit Save!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map((item) => (
        <GalleryCard
          key={item.id}
          item={item}
          onDelete={handleDelete}
          onView={onViewItem}
        />
      ))}
    </div>
  );
}
