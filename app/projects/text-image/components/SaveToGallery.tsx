"use client";

import { useCallback } from "react";
import type { SegmentResult } from "../lib/types";
import type { ParticleConfig } from "../lib/particle-config";
import SaveActionPanel from "@/app/components/gallery/SaveActionPanel";
import { appendJsonFile, fetchAsFile } from "@/app/lib/client/blob-files";

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  originalUrl: string;
  depthUrl: string;
  segments: SegmentResult[];
  mode: "presentation" | "expert";
  presetId: string | null;
  config: ParticleConfig | null;
}

export default function SaveToGallery({
  canvasRef,
  originalUrl,
  depthUrl,
  segments,
  mode,
  presetId,
  config,
}: Props) {
  const handleSave = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !config) {
      throw new Error("Canvas is not ready yet");
    }

    // Capture canvas snapshot as WebP blob (server stores all assets as WebP)
    const snapshotBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to capture canvas"));
      }, "image/webp", 0.92);
    });

    // Pass original + depth through unmodified; the server converts both to WebP
    // before storing (sharp). Filenames here are advisory only.
    const originalFile = await fetchAsFile(originalUrl, "original");
    const depthFile = await fetchAsFile(depthUrl, "depth");

    const labels = segments.map((s) => s.label);

    const formData = new FormData();
    formData.append("snapshot", new File([snapshotBlob], "snapshot.webp", { type: "image/webp" }));
    formData.append("original", originalFile);
    formData.append("width", String(canvas.width));
    formData.append("height", String(canvas.height));
    formData.append("labels", JSON.stringify(labels));
    formData.append("mode", mode);
    formData.append("presetId", presetId ?? "");
    formData.append("config", JSON.stringify(config));
    appendJsonFile(formData, "segments", "segments.json", segments);
    formData.append("depth", depthFile);

    const res = await fetch("/api/text-image/gallery", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Save failed");
    }
  }, [canvasRef, originalUrl, depthUrl, segments, mode, presetId, config]);

  return (
    <SaveActionPanel
      canSave={!!config}
      onSave={handleSave}
    />
  );
}
