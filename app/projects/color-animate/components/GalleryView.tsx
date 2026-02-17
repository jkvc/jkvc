"use client";

import { useState, useEffect } from "react";
import { ColorAnimateSession } from "../lib/types";
import Image from "next/image";

interface GalleryViewProps {
  onSessionSelect: (session: ColorAnimateSession) => void;
  onClose: () => void;
}

export default function GalleryView({ onSessionSelect, onClose }: GalleryViewProps) {
  const [sessions, setSessions] = useState<ColorAnimateSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/color-animate/gallery");
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this session?")) return;

    try {
      await fetch(`/api/color-animate/gallery/${id}`, {
        method: "DELETE",
      });
      setSessions(sessions.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <i className="fa-solid fa-circle-notch fa-spin text-gold text-2xl" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <i className="fa-solid fa-folder-open text-4xl text-text-faint" />
        <p className="text-[13px] text-text-muted">No saved sessions yet</p>
        <button
          onClick={onClose}
          className="rounded-full px-5 py-2 border border-border text-[13px] text-text-muted hover:border-gold/50 hover:text-gold transition-all"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] uppercase tracking-widest text-text-faint">
          Saved Sessions
        </h3>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-full border border-border text-text-muted hover:border-gold/50 hover:text-gold transition-all"
        >
          <i className="fa-solid fa-xmark text-[13px]" />
        </button>
      </div>

      {/* Sessions grid */}
      <div className="grid grid-cols-2 gap-3">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSessionSelect(session)}
            className="group relative rounded-2xl border border-border hover:border-gold/50 overflow-hidden transition-all text-left"
          >
            {/* Thumbnail */}
            <div className="relative w-full aspect-video bg-surface">
              <Image
                src={session.steps[0]?.imageUrl || session.originalImageUrl}
                alt="Session thumbnail"
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                unoptimized
              />
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-[11px] text-text-muted">
                {session.steps.length} steps
              </p>
              <p className="text-[10px] text-text-faint mt-0.5">
                {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => handleDelete(session.id, e)}
              className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full bg-surface/90 border border-border text-text-muted hover:border-red-500 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
            >
              <i className="fa-solid fa-trash text-[10px]" />
            </button>
          </button>
        ))}
      </div>
    </div>
  );
}
