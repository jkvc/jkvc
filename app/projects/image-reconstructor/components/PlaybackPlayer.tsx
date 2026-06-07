"use client";

import { useRef, useState, useEffect, type CSSProperties } from "react";
import { twMerge } from "tailwind-merge";
import { STAMP_CARD_SHADOW, STAMP_FACE } from "@/app/lib/stamp";
import { PLAYBACK } from "../lib/playback-config";

type Phase = "intro" | "color-in" | "video" | "reset" | "idle";

const PHASE_INFO: Record<Phase, { icon: string; label: string } | null> = {
  intro: { icon: "fa-image", label: "Original" },
  "color-in": { icon: "fa-palette", label: "Reconstructing" },
  video: { icon: "fa-film", label: "Animation" },
  reset: null,
  idle: null,
};

const RESET_FADE_MS = 200;

interface Props {
  /** Frame URLs in order: sketch -> gradually colored -> full original. */
  stepImageUrls: string[];
  /** i2v video URL. Null = skip video phase. */
  videoUrl: string | null;
  /** Auto-start playback loop on mount. */
  autoPlay?: boolean;
  /** Show the phase indicator pill (expert mode only). */
  showPhasePill?: boolean;
}

export default function PlaybackPlayer({
  stepImageUrls,
  videoUrl,
  autoPlay = true,
  showPhasePill = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const cancelledRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  // ---- Preload images ----
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    if (stepImageUrls.length === 0) return;
    let cancelled = false;

    Promise.all(
      stepImageUrls.map(
        (url) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
          })
      )
    ).then((loaded) => {
      if (cancelled) return;
      imagesRef.current = loaded;
      if (loaded[0]) {
        setDimensions({ w: loaded[0].naturalWidth, h: loaded[0].naturalHeight });
      }
      setImagesLoaded(true);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepImageUrls.join(",")]);

  // ---- Animation helpers ----

  /** Run crossfade frame sequence on canvas (forward only). */
  function animateFrames(imgs: HTMLImageElement[]): Promise<void> {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || imgs.length === 0) {
        resolve();
        return;
      }

      const holdMs = PLAYBACK.holdMs;
      const crossfadeMs = PLAYBACK.crossfadeMs;
      const totalPerFrame = holdMs + crossfadeMs;
      const totalDuration =
        imgs.length * holdMs + (imgs.length - 1) * crossfadeMs;
      let start: number | null = null;

      const tick = (ts: number) => {
        if (cancelledRef.current) return;
        if (start === null) start = ts;
        const elapsed = ts - start;

        if (elapsed >= totalDuration) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(
            imgs[imgs.length - 1],
            0,
            0,
            canvas.width,
            canvas.height
          );
          resolve();
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (imgs.length === 1) {
          ctx.drawImage(imgs[0], 0, 0, canvas.width, canvas.height);
        } else {
          const frameIdx = Math.min(
            Math.floor(elapsed / totalPerFrame),
            imgs.length - 1
          );
          const frameElapsed = elapsed - frameIdx * totalPerFrame;

          ctx.drawImage(imgs[frameIdx], 0, 0, canvas.width, canvas.height);

          if (frameIdx < imgs.length - 1 && frameElapsed > holdMs) {
            const fadeProgress = Math.min(
              (frameElapsed - holdMs) / crossfadeMs,
              1
            );
            ctx.globalAlpha = fadeProgress;
            ctx.drawImage(
              imgs[frameIdx + 1],
              0,
              0,
              canvas.width,
              canvas.height
            );
            ctx.globalAlpha = 1;
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    });
  }

  /** Play the video element forward at 1x. */
  function playVideoForward(): Promise<void> {
    return new Promise((resolve) => {
      const video = videoRef.current;
      if (!video) {
        resolve();
        return;
      }

      video.playbackRate = 1;
      video.currentTime = 0;

      const onEnded = () => {
        video.removeEventListener("ended", onEnded);
        resolve();
      };
      video.addEventListener("ended", onEnded);
      video.play().catch(() => {
        video.removeEventListener("ended", onEnded);
        resolve();
      });
    });
  }

  /**
   * Fade current canvas -> white -> targetImg over RESET_FADE_MS total.
   */
  function fadeViaWhite(targetImg: HTMLImageElement): Promise<void> {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        resolve();
        return;
      }

      const currentSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const snapCanvas = document.createElement("canvas");
      snapCanvas.width = canvas.width;
      snapCanvas.height = canvas.height;
      snapCanvas.getContext("2d")!.putImageData(currentSnapshot, 0, 0);

      const halfMs = RESET_FADE_MS / 2;
      let start: number | null = null;

      const tick = (ts: number) => {
        if (cancelledRef.current) return;
        if (start === null) start = ts;
        const elapsed = ts - start;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (elapsed < halfMs) {
          const t = elapsed / halfMs;
          ctx.drawImage(snapCanvas, 0, 0, canvas.width, canvas.height);
          ctx.fillStyle = `rgba(255,255,255,${t})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (elapsed < RESET_FADE_MS) {
          const t = (elapsed - halfMs) / halfMs;
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = t;
          ctx.drawImage(targetImg, 0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1;
        } else {
          ctx.drawImage(targetImg, 0, 0, canvas.width, canvas.height);
          resolve();
          return;
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    });
  }

  /** Crossfade from current canvas content to targetImg over durationMs. */
  function crossfadeTo(
    targetImg: HTMLImageElement,
    durationMs: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        resolve();
        return;
      }

      const currentSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const snapCanvas = document.createElement("canvas");
      snapCanvas.width = canvas.width;
      snapCanvas.height = canvas.height;
      snapCanvas.getContext("2d")!.putImageData(currentSnapshot, 0, 0);

      let start: number | null = null;

      const tick = (ts: number) => {
        if (cancelledRef.current) return;
        if (start === null) start = ts;
        const t = Math.min((ts - start) / durationMs, 1);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(snapCanvas, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = t;
        ctx.drawImage(targetImg, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;

        if (t >= 1) {
          resolve();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    });
  }

  /** Wait for a duration. */
  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      // Store so cleanup can clear it
      const prev = cancelledRef.current;
      const check = setInterval(() => {
        if (cancelledRef.current && !prev) {
          clearTimeout(id);
          clearInterval(check);
        }
      }, 50);
      setTimeout(() => clearInterval(check), ms + 100);
    });
  }

  // ---- Main playback loop ----
  async function runLoop() {
    cancelledRef.current = false;
    const imgs = imagesRef.current;
    if (imgs.length === 0) return;

    const hasVideo = !!videoUrl && !!videoRef.current;
    const sketchImg = imgs[0];
    const originalImg = imgs[imgs.length - 1];
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    while (true) {
      if (cancelledRef.current) break;

      // 1. Show original image, pause 1s
      setPhase("intro");
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
      }
      await sleep(1000);
      if (cancelledRef.current) break;

      // 2. Crossfade original -> sketch over 500ms, pause 1s
      await crossfadeTo(sketchImg, 500);
      if (cancelledRef.current) break;
      setPhase("color-in");
      await sleep(1000);
      if (cancelledRef.current) break;

      // 3. Color-in: sketch -> full color
      await animateFrames(imgs);
      if (cancelledRef.current) break;

      // 4. Video
      if (hasVideo) {
        setPhase("video");
        await playVideoForward();
        if (cancelledRef.current) break;
      }

      // 5. Flash to white then fade to original image
      setPhase("reset");
      await fadeViaWhite(originalImg);
      if (cancelledRef.current) break;
    }
  }

  // ---- Auto-start ----
  useEffect(() => {
    if (autoPlay && imagesLoaded && stepImageUrls.length > 0) {
      runLoop();
    }

    return () => {
      cancelledRef.current = true;
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesLoaded, autoPlay]);

  // ---- Layout ----
  const aspectStyle: CSSProperties =
    dimensions.w > 0
      ? { aspectRatio: `${dimensions.w} / ${dimensions.h}` }
      : { aspectRatio: "1 / 1" };

  const showCanvas = phase !== "video";
  const showVideo = phase === "video";
  const phaseInfo = PHASE_INFO[phase];

  return (
    <div className={twMerge(STAMP_FACE, STAMP_CARD_SHADOW, "overflow-hidden")}>
      <div
        className="relative w-full bg-black"
        style={aspectStyle}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.w || 768}
          height={dimensions.h || 768}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ display: showCanvas ? "block" : "none" }}
        />
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-contain"
            style={{ display: showVideo ? "block" : "none" }}
            playsInline
            muted
          />
        )}

        {showPhasePill && phaseInfo && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 text-white caption-mono px-2.5 py-1 rounded-full">
            <i className={`fa-solid ${phaseInfo.icon}`} />
            {phaseInfo.label}
          </div>
        )}
      </div>
    </div>
  );
}
