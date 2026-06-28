"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import Pill from "@/app/components/editorial/Pill";
import StampShell from "@/app/components/ui/StampShell";
import StampedTextarea from "@/app/components/ui/StampedTextarea";
import StreamLogPanel, { type StreamLogEntry } from "@/app/components/ui/StreamLogPanel";
import { consumeSseJson } from "@/app/lib/client/sse";
import { base64ToDataUrl, filesToBase64 } from "@/app/lib/client/image-base64";
import { resizeFilesToLongestEdge } from "@/app/lib/client/image-resize";
import { KLEIN_DEMO_RESOLUTION, KLEIN_DEMO_SIZE } from "@/app/lib/klein-demo";
import { STAMP_CONTROL_SHADOW, STAMP_FACE } from "@/app/lib/stamp";

type KleinStreamEvent =
  | { kind: "progress"; message: string }
  | { kind: "result"; result: { image: string }; metadata?: Record<string, unknown> }
  | { kind: "error"; message?: string };

interface Props {
  demoName: string;
  mode: "t2i" | "i2i";
  title: string;
  description: string;
  icon: string;
}

export default function KleinDemoCard({
  demoName,
  mode,
  title,
  description,
  icon,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState("");
  const [condFiles, setCondFiles] = useState<File[]>([]);
  const [condPreviews, setCondPreviews] = useState<string[]>([]);
  const condPreviewsRef = useRef<string[]>([]);
  condPreviewsRef.current = condPreviews;
  const [statusLines, setStatusLines] = useState<StreamLogEntry[]>([]);
  const genStartRef = useRef<number>(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appendLog = useCallback((message: string) => {
    const offsetMs = performance.now() - genStartRef.current;
    setStatusLines((prev) => [...prev, { offsetMs, message }]);
  }, []);

  const resetRun = useCallback(() => {
    setStatusLines([]);
    setOutputUrl(null);
    setError(null);
  }, []);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setCondFiles((prev) => [...prev, ...imageFiles]);
    setCondPreviews((prev) => [
      ...prev,
      ...imageFiles.map((file) => URL.createObjectURL(file)),
    ]);
  }, []);

  const clearImages = useCallback(() => {
    setCondPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setCondFiles([]);
  }, []);

  useEffect(() => {
    return () => {
      condPreviewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleGenerate = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Enter a prompt first.");
      return;
    }
    if (mode === "i2i" && condFiles.length === 0) {
      setError("Add at least one conditioning image.");
      return;
    }

    resetRun();
    setRunning(true);
    genStartRef.current = performance.now();

    try {
      const condImages =
        mode === "i2i"
          ? await filesToBase64(
              await resizeFilesToLongestEdge(condFiles, KLEIN_DEMO_SIZE),
            )
          : undefined;

      const response = await fetch("/api/admin/demos/klein/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          resolution: KLEIN_DEMO_RESOLUTION,
          condImages,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string" ? data.error : `Request failed (${response.status})`,
        );
      }

      let gotResult = false;
      await consumeSseJson<KleinStreamEvent>(response, (event) => {
        if (event.kind === "progress") {
          appendLog(event.message);
          return;
        }
        if (event.kind === "result") {
          gotResult = true;
          setOutputUrl(base64ToDataUrl(event.result.image));
          appendLog("Done.");
          return;
        }
        if (event.kind === "error") {
          throw new Error(event.message ?? "Generation failed");
        }
      });

      if (!gotResult) {
        throw new Error("Stream ended without a result");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setRunning(false);
    }
  }, [appendLog, condFiles, mode, prompt, resetRun]);

  return (
    <StampShell variant="card" bleed={false} faceClassName="p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span
          className={twMerge(
            STAMP_FACE,
            STAMP_CONTROL_SHADOW,
            "inline-flex h-9 w-9 shrink-0 items-center justify-center bg-surface text-ink",
          )}
          aria-hidden="true"
        >
          <i className={`fa-solid ${icon} text-[13px]`} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="caption-mono text-ink-faint">{demoName}</div>
          <div className="mt-0.5 font-bold uppercase tracking-wide text-ink">{title}</div>
          <p className="mt-1 text-[13px] leading-snug text-ink-faint">{description}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <StampedTextarea
          label="Prompt"
          value={prompt}
          onChange={setPrompt}
          rows={3}
          placeholder={
            mode === "t2i"
              ? "Describe the image to generate…"
              : "Describe how to transform the input image(s)…"
          }
          disabled={running}
        />

        {mode === "i2i" ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-ink-muted">Conditioning images</span>
              {condFiles.length > 0 ? (
                <Pill size="xs" onClick={clearImages} disabled={running}>
                  clear
                </Pill>
              ) : null}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={running}
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
                e.target.value = "";
              }}
            />

            <div
              className={twMerge(
                STAMP_FACE,
                STAMP_CONTROL_SHADOW,
                "cursor-pointer bg-surface p-6 text-center transition-colors hover:border-hot",
                running && "pointer-events-none opacity-50",
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="fa-solid fa-arrow-up-from-bracket mb-2 text-gold/40" />
              <p className="text-[13px] text-ink-faint">
                Drop images here or click to upload (one or more)
              </p>
            </div>

            {condPreviews.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {condPreviews.map((url, index) => (
                  <img
                    key={url}
                    src={url}
                    alt={`Conditioning ${index + 1}`}
                    className={twMerge(
                      STAMP_FACE,
                      STAMP_CONTROL_SHADOW,
                      "h-20 w-20 object-cover bg-surface",
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Pill
            onClick={handleGenerate}
            icon={running ? "fa-spinner animate-spin" : "fa-wand-magic-sparkles"}
            size="xs"
            active
            disabled={running}
          >
            {running ? "generating…" : "generate"}
          </Pill>
          {(statusLines.length > 0 || outputUrl || error) && !running ? (
            <Pill onClick={resetRun} icon="fa-rotate" size="xs">
              clear log
            </Pill>
          ) : null}
        </div>

        {error ? <p className="text-xs text-hot">{error}</p> : null}

        <div>
          <span className="mb-2 block text-xs text-ink-muted">Stream log</span>
          <StreamLogPanel lines={statusLines} />
        </div>

        {outputUrl ? (
          <div>
            <span className="mb-2 block text-xs text-ink-muted">Output</span>
            <img
              src={outputUrl}
              alt="Generated output"
              className={twMerge(
                STAMP_FACE,
                STAMP_CONTROL_SHADOW,
                "w-full bg-surface object-contain",
              )}
            />
          </div>
        ) : null}
      </div>
    </StampShell>
  );
}
