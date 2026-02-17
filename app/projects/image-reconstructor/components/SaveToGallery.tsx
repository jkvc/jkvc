"use client";

import { useCallback, useState } from "react";
import type { ProcessingState } from "../lib/types";
import DevOnlyButton from "@/app/components/DevOnlyButton";

interface Props {
  state: ProcessingState;
  onSaved?: () => void;
}

export default function SaveToGallery({ state, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave =
    state.compositingStatus === "complete" &&
    state.originalImageUrl &&
    state.frames.length > 0;

  const handleSave = useCallback(async () => {
    if (!canSave) return;

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();

      // Original image
      const origRes = await fetch(state.originalImageUrl!);
      const origBlob = await origRes.blob();
      formData.append(
        "original",
        new File([origBlob], "original.jpg", { type: "image/jpeg" })
      );

      // Sketch image
      if (state.sketchUrl) {
        const sketchRes = await fetch(state.sketchUrl);
        const sketchBlob = await sketchRes.blob();
        formData.append(
          "sketch",
          new File([sketchBlob], "sketch.jpg", { type: "image/jpeg" })
        );
      }

      // Video
      if (state.videoUrl) {
        const videoRes = await fetch(state.videoUrl);
        const videoBlob = await videoRes.blob();
        formData.append(
          "video",
          new File([videoBlob], "video.mp4", { type: "video/mp4" })
        );
      }

      // Frames
      for (let i = 0; i < state.frames.length; i++) {
        const frameRes = await fetch(state.frames[i].compositeUrl);
        const frameBlob = await frameRes.blob();
        formData.append(
          `frame_${i}`,
          new File([frameBlob], `frame_${i}.jpg`, { type: "image/jpeg" })
        );
      }

      // Segment labels
      const labels = state.frames.map((f) => f.label);
      formData.append("segmentLabels", JSON.stringify(labels));

      // Animation prompt
      formData.append("animationPrompt", state.animationPrompt || "");

      const res = await fetch("/api/image-reconstructor/gallery", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
      }

      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }, [canSave, state, onSaved]);

  return (
    <div className="flex items-center justify-center gap-3">
      <DevOnlyButton
        text="Save to Gallery"
        onClick={handleSave}
        loading={saving}
        loadingText="Saving…"
        disabled={!canSave}
      />
      {error && <span className="text-error text-xs">{error}</span>}
    </div>
  );
}
