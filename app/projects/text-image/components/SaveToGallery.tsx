"use client";

import { useCallback, useState } from "react";
import type { SegmentResult } from "../lib/types";
import type { ParticleConfig } from "./ParticleControls";

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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !config) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      // Capture canvas snapshot as PNG blob
      const snapshotBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to capture canvas"));
        }, "image/png");
      });

      // Fetch original image as blob
      const origRes = await fetch(originalUrl);
      const origBlob = await origRes.blob();

      // Build labels list from segments
      const labels = segments.map((s) => s.label);

      const formData = new FormData();
      formData.append("snapshot", new File([snapshotBlob], "snapshot.png", { type: "image/png" }));
      formData.append("original", new File([origBlob], "original.png", { type: origBlob.type }));
      formData.append("width", String(canvas.width));
      formData.append("height", String(canvas.height));
      formData.append("labels", JSON.stringify(labels));
      formData.append("mode", mode);
      formData.append("presetId", presetId ?? "");
      formData.append("config", JSON.stringify(config));

      // Segments JSON (for restoring without re-inference)
      formData.append(
        "segments",
        new File(
          [JSON.stringify(segments)],
          "segments.json",
          { type: "application/json" }
        )
      );

      // Depth map image as blob
      const depthRes = await fetch(depthUrl);
      const depthBlob = await depthRes.blob();
      formData.append("depth", new File([depthBlob], "depth.png", { type: depthBlob.type }));

      const res = await fetch("/api/text-image/gallery", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }, [canvasRef, originalUrl, depthUrl, segments, mode, presetId, config]);

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={handleSave}
        disabled={saving || !config}
        className={`btn btn-sm rounded-full transition-all ${
          saved
            ? "btn-success text-success-content"
            : "btn-ghost text-base-content/50 hover:text-base-content/80"
        }`}
      >
        {saving ? (
          <>
            <span className="loading loading-spinner loading-xs" />
            Saving&hellip;
          </>
        ) : saved ? (
          "Saved!"
        ) : (
          "Save to Gallery"
        )}
      </button>
      {error && <span className="text-error text-xs">{error}</span>}
    </div>
  );
}
