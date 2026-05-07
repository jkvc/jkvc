"use client";

import { useCallback } from "react";
import type { ProcessingState, Tunables } from "../lib/types";
import SaveActionPanel from "@/app/components/gallery/SaveActionPanel";
import { fetchAsFile } from "@/app/lib/client/blob-files";

interface Props {
  state: ProcessingState;
  tunables: Tunables;
  onSaved?: () => void;
}

export default function SaveToGallery({ state, tunables, onSaved }: Props) {
  const completedCaptionCount = Object.values(state.captions).filter(
    (c) => c.status === "complete"
  ).length;

  const canSave = Boolean(
    state.originalImageUrl &&
    state.themeStatus === "complete" &&
    completedCaptionCount > 0
  );

  const handleSave = useCallback(async () => {
    if (!canSave || !state.originalImageUrl) {
      throw new Error("Cannot save yet");
    }

    const formData = new FormData();
    formData.append(
      "original",
      await fetchAsFile(state.originalImageUrl, "original.jpg", "image/jpeg")
    );

    formData.append("theme", state.theme ?? "");
    formData.append("boxes", JSON.stringify(state.boxes));
    formData.append(
      "captions",
      JSON.stringify(
        Object.entries(state.captions)
          .filter(([, c]) => c.status === "complete")
          .map(([boxId, c]) => ({ boxId, lines: c.lines }))
      )
    );
    formData.append("tunables", JSON.stringify(tunables));

    const res = await fetch("/api/photo-commentator/gallery", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Save failed");
    }
  }, [canSave, state, tunables]);

  return (
    <SaveActionPanel canSave={canSave} onSave={handleSave} onSaved={onSaved} />
  );
}
