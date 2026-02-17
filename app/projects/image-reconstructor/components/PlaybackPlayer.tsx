"use client";

import { useRef, useState, useEffect, type CSSProperties } from "react";
import { PLAYBACK } from "../lib/playback-config";

type Phase =
  | "color-in"
  | "video"
  | "pause-forward"
  | "video-reverse"
  | "color-out"
  | "pause-reverse"
  | "idle";

const PHASE_INFO: Record<Phase, { icon: string; label: string } | null> = {
  "color-in": { icon: "fa-palette", label: "Reconstructing" },
  video: { icon: "fa-film", label: "Animation" },
  "pause-forward": { icon: "fa-pause", label: "Paused" },
  "video-reverse": { icon: "fa-backward", label: "Rewinding" },
  "color-out": { icon: "fa-palette", label: "Deconstructing" },
  "pause-reverse": { icon: "fa-pause", label: "Paused" },
  idle: null,
};

const PAUSE_MS = 3000;
const REVERSE_SPEED = 3;

interface Props {
  /** Frame URLs in order: sketch → gradually colored → full original. */
  stepImageUrls: string[];
  /** i2v video URL. Null = skip video phases. */
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  /** Run crossfade frame sequence on canvas. */
  function animateFrames(
    imgs: HTMLImageElement[],
    speed: number,
    reverse: boolean
  ): Promise<void> {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || imgs.length === 0) {
        resolve();
        return;
      }

      const ordered = reverse ? [...imgs].reverse() : imgs;
      const holdMs = PLAYBACK.holdMs / speed;
      const crossfadeMs = PLAYBACK.crossfadeMs / speed;
      const totalPerFrame = holdMs + crossfadeMs;
      const totalDuration =
        ordered.length * holdMs + (ordered.length - 1) * crossfadeMs;
      let start: number | null = null;

      const tick = (ts: number) => {
        if (cancelledRef.current) return;
        if (start === null) start = ts;
        const elapsed = ts - start;

        if (elapsed >= totalDuration) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(
            ordered[ordered.length - 1],
            0,
            0,
            canvas.width,
            canvas.height
          );
          resolve();
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (ordered.length === 1) {
          ctx.drawImage(ordered[0], 0, 0, canvas.width, canvas.height);
        } else {
          const frameIdx = Math.min(
            Math.floor(elapsed / totalPerFrame),
            ordered.length - 1
          );
          const frameElapsed = elapsed - frameIdx * totalPerFrame;

          ctx.drawImage(
            ordered[frameIdx],
            0,
            0,
            canvas.width,
            canvas.height
          );

          if (frameIdx < ordered.length - 1 && frameElapsed > holdMs) {
            const fadeProgress = Math.min(
              (frameElapsed - holdMs) / crossfadeMs,
              1
            );
            ctx.globalAlpha = fadeProgress;
            ctx.drawImage(
              ordered[frameIdx + 1],
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

  /** Reverse the video at 3x by seeking backward and drawing to canvas. */
  function playVideoReverse(): Promise<void> {
    return new Promise((resolve) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!video || !canvas || !ctx) {
        resolve();
        return;
      }

      video.pause();
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      let currentTime = video.duration;
      let lastTs: number | null = null;
      let resolved = false;

      const done = () => {
        if (resolved) return;
        resolved = true;
        resolve();
      };

      const tick = (ts: number) => {
        if (cancelledRef.current || resolved) return;
        if (lastTs === null) lastTs = ts;
        const dt = ts - lastTs;
        lastTs = ts;

        currentTime -= (REVERSE_SPEED * dt) / 1000;

        if (currentTime <= 0) {
          video.currentTime = 0;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          done();
          return;
        }

        video.currentTime = currentTime;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    });
  }

  /** Wait for a duration. */
  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      timerRef.current = setTimeout(resolve, ms);
    });
  }

  // ---- Main playback loop ----
  async function runLoop() {
    cancelledRef.current = false;
    const imgs = imagesRef.current;
    if (imgs.length === 0) return;

    const hasVideo = !!videoUrl && !!videoRef.current;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (cancelledRef.current) break;

      // Forward: sketch → color
      setPhase("color-in");
      await animateFrames(imgs, 1, false);
      if (cancelledRef.current) break;

      // Forward video
      if (hasVideo) {
        setPhase("video");
        await playVideoForward();
        if (cancelledRef.current) break;
      }

      // Pause 3s
      setPhase("pause-forward");
      await sleep(PAUSE_MS);
      if (cancelledRef.current) break;

      // Reverse video at 3x
      if (hasVideo) {
        setPhase("video-reverse");
        await playVideoReverse();
        if (cancelledRef.current) break;
      }

      // Reverse: color → sketch at 3x
      setPhase("color-out");
      await animateFrames(imgs, REVERSE_SPEED, true);
      if (cancelledRef.current) break;

      // Pause 3s
      setPhase("pause-reverse");
      await sleep(PAUSE_MS);
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
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesLoaded, autoPlay]);

  // ---- Layout ----
  const aspectStyle: CSSProperties =
    dimensions.w > 0
      ? { aspectRatio: `${dimensions.w} / ${dimensions.h}` }
      : { aspectRatio: "1 / 1" };

  const showCanvas = phase !== "video" && phase !== "pause-forward";
  const showVideo = phase === "video" || phase === "pause-forward";
  const phaseInfo = PHASE_INFO[phase];

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-black"
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
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 text-white text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full">
          <i className={`fa-solid ${phaseInfo.icon} text-[9px]`} />
          {phaseInfo.label}
        </div>
      )}
    </div>
  );
}
