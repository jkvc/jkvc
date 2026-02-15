"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { TextImageData } from "./lib/types";
import { processImage } from "./lib/process-image";
import ImageUploader from "./components/ImageUploader";
import ProcessingOverlay from "./components/ProcessingOverlay";
import ParallaxCanvas, {
  type ParallaxCanvasHandle,
} from "./components/ParallaxCanvas";
import Gallery from "./components/Gallery";
import DebugDepth from "./components/DebugDepth";

const isDev = process.env.NODE_ENV === "development";

type Phase = "idle" | "processing" | "viewing" | "gallery" | "debug";

const TAB_PHASES = new Set<Phase>(["gallery", "debug"]);

function getInitialPhase(tab: string | null): Phase {
  if (tab && TAB_PHASES.has(tab as Phase)) return tab as Phase;
  return "idle";
}

export default function TextImageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(() =>
    getInitialPhase(searchParams.get("tab"))
  );
  const [textImageData, setTextImageData] = useState<TextImageData | null>(
    null
  );
  const [processingStep, setProcessingStep] = useState("");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<ParallaxCanvasHandle>(null);

  const switchPhase = useCallback(
    (p: Phase) => {
      setPhase(p);
      const url = TAB_PHASES.has(p)
        ? `?tab=${p}`
        : window.location.pathname;
      router.replace(url, { scroll: false });
    },
    [router]
  );

  const handleUpload = useCallback(async (file: File) => {
    setOriginalFile(file);
    setPhase("processing");
    try {
      const data = await processImage(file, setProcessingStep);
      setTextImageData(data);
      setPhase("viewing");
    } catch {
      setPhase("idle");
    }
  }, []);

  const handleReset = useCallback(() => {
    setTextImageData(null);
    setOriginalFile(null);
    setPhase("idle");
  }, []);

  const handleSave = useCallback(async () => {
    if (!canvasRef.current || !originalFile || !textImageData) return;
    setSaving(true);
    try {
      const snapshotBlob = await canvasRef.current.getSnapshot();
      if (!snapshotBlob) return;

      const formData = new FormData();
      formData.append("snapshot", snapshotBlob, "text-image.png");
      formData.append("original", originalFile);
      formData.append("width", String(textImageData.width));
      formData.append("height", String(textImageData.height));
      formData.append(
        "labels",
        JSON.stringify([
          ...new Set(textImageData.regions.map((r) => r.label)),
        ])
      );
      await fetch("/api/text-image/gallery", {
        method: "POST",
        body: formData,
      });
    } finally {
      setSaving(false);
    }
  }, [originalFile, textImageData]);

  return (
    <div>
      <div className="flex gap-1.5 mb-8">
        <button
          className={`btn btn-sm rounded-full ${phase !== "gallery" && phase !== "debug" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => switchPhase(textImageData ? "viewing" : "idle")}
        >
          Canvas
        </button>
        <button
          className={`btn btn-sm rounded-full ${phase === "gallery" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => switchPhase("gallery")}
        >
          Gallery
        </button>
        {isDev && (
          <button
            className={`btn btn-sm rounded-full ${phase === "debug" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => switchPhase("debug")}
          >
            Debug
          </button>
        )}
      </div>

      {phase === "idle" && <ImageUploader onUpload={handleUpload} />}

      {phase === "processing" && <ProcessingOverlay step={processingStep} />}

      {phase === "viewing" && textImageData && (
        <div className="flex flex-col gap-4">
          <ParallaxCanvas ref={canvasRef} data={textImageData} />
          <div className="flex gap-2">
            <button className="btn btn-sm btn-outline rounded-full" onClick={handleReset}>
              New Image
            </button>
            <button
              className="btn btn-sm btn-primary rounded-full"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Save to Gallery"
              )}
            </button>
          </div>
        </div>
      )}

      {phase === "gallery" && <Gallery />}

      {phase === "debug" && isDev && <DebugDepth />}
    </div>
  );
}
