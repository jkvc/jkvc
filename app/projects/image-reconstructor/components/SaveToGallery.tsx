"use client";

import { useCallback } from "react";
import type { ProcessingState } from "../lib/types";
import SaveActionPanel from "@/app/components/gallery/SaveActionPanel";
import { fetchAsFile } from "@/app/lib/client/blob-files";

interface Props {
  state: ProcessingState;
  onSaved?: () => void;
}

export default function SaveToGallery({ state, onSaved }: Props) {
  const canSave = Boolean(
    state.compositingStatus === "complete" &&
    state.originalImageUrl &&
    state.frames.length > 0
  );

  const handleSave = useCallback(async () => {
    if (!canSave || !state.originalImageUrl) {
      throw new Error("Cannot save yet");
    }

    const formData = new FormData();

    // Original image
    formData.append(
      "original",
      await fetchAsFile(state.originalImageUrl, "original.jpg", "image/jpeg")
    );

    // Sketch image
    if (state.sketchUrl) {
      formData.append(
        "sketch",
        await fetchAsFile(state.sketchUrl, "sketch.jpg", "image/jpeg")
      );
    }

    // Video
    if (state.videoUrl) {
      formData.append(
        "video",
        await fetchAsFile(state.videoUrl, "video.mp4", "video/mp4")
      );
    }

    // Frames
    for (let i = 0; i < state.frames.length; i++) {
      formData.append(
        `frame_${i}`,
        await fetchAsFile(state.frames[i].compositeUrl, `frame_${i}.jpg`, "image/jpeg")
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
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Save failed");
    }
  }, [canSave, state]);

  return (
    <SaveActionPanel
      canSave={canSave}
      onSave={handleSave}
      onSaved={onSaved}
    />
  );
}
