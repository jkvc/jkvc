"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface ScrollingPanoProps {
  /**
   * Image source(s). If an array, one is chosen at random on the client after
   * mount (server render emits no image to avoid SSR/CSR mismatch — the empty
   * first frame is invisible behind the consumer's overlay).
   */
  src: string | readonly string[];
  /** Seconds per full loop at baseline. Default 60. */
  duration?: number;
  /** Scroll direction. `"rtl"` = image drifts left (default). */
  direction?: "rtl" | "ltr";
  /**
   * Labels pinned to image-x positions (∈ [0, 1]) that scroll with the track.
   */
  markers?: readonly PanoMarker[];
  /** Per-label opacity (0–1). Omitted labels default to 0. */
  markerOpacities?: Readonly<Record<string, number>>;
  /**
   * Pre-rendered image emitted on the server (and during the first client
   * paint). Use to avoid the brief empty frame when `src` is an array.
   */
  initialSrc?: string;
  /**
   * Max seek duration (a full-wraparound seek). Shorter forward-deltas scale
   * linearly so angular speed during seeks is roughly constant regardless of
   * distance. Default 2500ms.
   */
  maxSeekDurationMs?: number;
  className?: string;
}

export interface PanoMarker {
  /** Image-x position ∈ [0, 1]. */
  t: number;
  label: string;
}

/**
 * Imperative handle for programmatically driving the panorama position.
 */
export interface ScrollingPanoHandle {
  /**
   * Smoothly seek so that the image-x position `t` (∈ [0, 1]) sits at the
   * viewport center. Always seeks in the current scroll direction (forward
   * only — wraps around if needed). Easing is symmetric ease-in-out cubic
   * layered on top of baseline scroll, so velocity at both endpoints
   * matches baseline (no lurch).
   *
   * @returns `true` if the seek was accepted and started; `false` if it was
   * ignored (a seek is already in flight, the image hasn't laid out yet, or
   * the requested target is the current position). Callers can use this to
   * gate side-effects (e.g. show a toast) on actual movement.
   */
  seekToCenter(t: number): boolean;
}

/** Wrap any real number into [0, 1). */
function wrap01(x: number): number {
  return ((x % 1) + 1) % 1;
}

/** Symmetric ease-in-out cubic, equivalent to cubic-bezier(0.65, 0, 0.35, 1). */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function PanoMarkerPin({
  t,
  label,
  opacity,
}: PanoMarker & { opacity: number }) {
  return (
    <div
      className="absolute top-2 z-10 -translate-x-1/2 pointer-events-none transition-opacity duration-300 ease-out"
      style={{ left: `${t * 100}%`, opacity }}
      aria-hidden={opacity === 0}
    >
      <div className="inline-flex items-center gap-1 border-2 border-ink bg-surface px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-ink shadow-sm whitespace-nowrap">
        <i className="fa-solid fa-location-dot text-[8px] text-hot" aria-hidden="true" />
        {label}
      </div>
    </div>
  );
}

interface SeekState {
  tCenter: number;
  startPhase: number;
  startTime: number;
  durationMs: number;
}

/**
 * Reusable horizontally-looping panorama background. Renders two copies of the
 * source image side-by-side and translates the track via a JS `requestAnima-
 * tionFrame` loop, which lets us seek to a specific image-x position with a
 * smooth eased curve while still wrapping seamlessly.
 *
 * Positioning: fills its nearest positioned ancestor via `absolute inset-0`.
 * Wrap it in a `relative overflow-hidden` parent.
 *
 * Parents control seeks via the imperative handle (`forwardRef`). The handle
 * is intentionally minimal — `seekToCenter(t)` only — so future controls
 * (speed override, pause, etc.) can be added without breaking callers.
 */
const ScrollingPano = forwardRef<ScrollingPanoHandle, ScrollingPanoProps>(
  function ScrollingPano(
    {
      src,
      duration = 60,
      direction = "rtl",
      initialSrc,
      markers,
      markerOpacities,
      maxSeekDurationMs = 2500,
      className = "",
    },
    ref,
  ) {
    const isArray = Array.isArray(src);
    const [picked, setPicked] = useState<string | undefined>(initialSrc);

    useEffect(() => {
      if (!isArray) return;
      const list = src as readonly string[];
      if (list.length === 0) return;
      // Random pick must happen on the client to avoid hydration mismatch —
      // the server can't agree on which random index it picked.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPicked(list[Math.floor(Math.random() * list.length)]);
    }, [src, isArray]);

    const resolved = isArray ? picked : (src as string);

    // Refs for the rAF loop. Phase ∈ [0, 1) is the fraction of one image
    // width that has scrolled past the viewport's left edge:
    //   translateX (px) = -phase * imageWidth
    // None of these participate in React render, so we use refs not state.
    const containerRef = useRef<HTMLDivElement | null>(null);
    const trackRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const phaseRef = useRef(0);
    const seekRef = useRef<SeekState | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        seekToCenter(t: number): boolean {
          // Per resolved design: ignore retargeting while a seek is in flight.
          if (seekRef.current) return false;
          const imgW = imgRef.current?.getBoundingClientRect().width ?? 0;
          const viewportW =
            containerRef.current?.getBoundingClientRect().width ?? 0;
          if (imgW <= 0) return false;

          const startPhase = phaseRef.current;
          const targetPhase = wrap01(t - viewportW / (2 * imgW));
          // Forward delta: distance traveled in the current scroll direction.
          // RTL = phase increases; LTR = phase decreases.
          const delta =
            direction === "rtl"
              ? wrap01(targetPhase - startPhase)
              : wrap01(startPhase - targetPhase);
          if (delta === 0) return false;

          seekRef.current = {
            tCenter: t,
            startPhase,
            startTime: performance.now(),
            // Linear distance scaling: a full wraparound takes
            // maxSeekDurationMs; smaller deltas take proportionally less.
            durationMs: maxSeekDurationMs * delta,
          };
          return true;
        },
      }),
      [direction, maxSeekDurationMs],
    );

    useEffect(() => {
      let rafId = 0;
      let last = performance.now();
      const baselineRate = 1 / duration; // phase per second
      const sign = direction === "rtl" ? 1 : -1;

      const tick = (now: number) => {
        const dt = (now - last) / 1000;
        last = now;

        const seek = seekRef.current;
        const imgW = imgRef.current?.getBoundingClientRect().width ?? 0;
        const viewportW =
          containerRef.current?.getBoundingClientRect().width ?? 0;

        if (seek && imgW > 0) {
          // Recompute target each frame so resizes adapt smoothly. Total
          // seek duration is fixed at click time; the trajectory shape
          // adjusts if the viewport changes mid-flight.
          //
          // Velocity continuity: a naive `phase = start + delta * eased(u)`
          // produces a 0-velocity at both endpoints, which clashes with the
          // baseline scroll (non-zero velocity) on either side and reads as
          // a "stop, accelerate, decelerate, stop, lurch" sequence. Instead
          // we layer the seek ON TOP of baseline:
          //
          //     phase = start + baseline·t  +  extra·ease(u)
          //     extra = forwardDelta - baselineSpan_during_seek
          //
          // At u=0 and u=1 ease'(u) = 0, so the seek contributes zero extra
          // velocity at the boundaries — total velocity equals baseline,
          // continuous in both directions. In the middle, ease'(u) peaks
          // and the seek adds its punch on top of baseline.
          const targetPhase = wrap01(seek.tCenter - viewportW / (2 * imgW));
          const liveDelta =
            direction === "rtl"
              ? wrap01(targetPhase - seek.startPhase)
              : wrap01(seek.startPhase - targetPhase);
          const elapsedSec = (now - seek.startTime) / 1000;
          const u = Math.min(1, (now - seek.startTime) / seek.durationMs);
          const eased = easeInOutCubic(u);
          const baselineSpan = baselineRate * (seek.durationMs / 1000);
          const extraDelta = liveDelta - baselineSpan;
          const baselineProgress = baselineRate * elapsedSec;
          phaseRef.current = wrap01(
            seek.startPhase + sign * (baselineProgress + extraDelta * eased),
          );
          if (u >= 1) seekRef.current = null;
        } else {
          phaseRef.current = wrap01(
            phaseRef.current + sign * baselineRate * dt,
          );
        }

        if (trackRef.current && imgW > 0) {
          trackRef.current.style.transform = `translate3d(${-phaseRef.current * imgW}px, 0, 0)`;
        }
        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId);
    }, [duration, direction]);

    return (
      <div
        ref={containerRef}
        className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
        aria-hidden="true"
      >
        {resolved ? (
          <div
            ref={trackRef}
            className="flex h-full will-change-transform"
            style={{ width: "max-content" }}
          >
            {/* Two copies of the same image; translating by one image width
                lands the second copy exactly where the first started, hiding
                the seam. */}
            <div className="relative h-full shrink-0">
              <img
                ref={imgRef}
                src={resolved}
                alt=""
                className="h-full w-auto block select-none"
                draggable={false}
              />
              {markers?.map((marker) => (
                <PanoMarkerPin
                  key={`a-${marker.label}`}
                  {...marker}
                  opacity={markerOpacities?.[marker.label] ?? 0}
                />
              ))}
            </div>
            <div className="relative h-full shrink-0">
              <img
                src={resolved}
                alt=""
                className="h-full w-auto block select-none"
                draggable={false}
              />
              {markers?.map((marker) => (
                <PanoMarkerPin
                  key={`b-${marker.label}`}
                  {...marker}
                  opacity={markerOpacities?.[marker.label] ?? 0}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);

export default ScrollingPano;
