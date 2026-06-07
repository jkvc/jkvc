"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { STAMP_CARD_SHADOW, STAMP_FACE } from "@/app/lib/stamp";
import type { SegmentResult } from "../lib/types";
import type { Particle, LabelMap } from "../lib/particle-types";
import { getShapeConfig } from "../lib/particle-types";
import { loadImage, getImageData, createBlurredBackground } from "../lib/image-utils";
import {
  sampleParticlesGrid,
  sampleParticlesWeighted,
  decodeSegmentationMasks,
  defaultBaseSize,
  defaultDepthMul,
} from "../lib/sampling";
import { renderParticle, renderLabelParticle, createLabelRendererState } from "../lib/shape-renderer";
import type { ParticleConfig } from "../lib/particle-config";
import ParticleControls from "./ParticleControls";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  originalUrl: string;
  depthUrl: string;
  segments?: SegmentResult[];
  /** If provided, use this config and hide controls (presentation mode). */
  fixedConfig?: ParticleConfig;
  /** Expose the canvas element ref for snapshot capture. */
  canvasRefOut?: React.MutableRefObject<HTMLCanvasElement | null>;
  /** Report current config whenever it changes (for save-to-gallery). */
  onConfigChange?: (config: ParticleConfig) => void;
  /** Pre-populate config (e.g. when restoring from gallery). */
  initialConfig?: ParticleConfig;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ParticleCanvas({
  originalUrl,
  depthUrl,
  segments,
  fixedConfig,
  canvasRefOut,
  onConfigChange,
  initialConfig,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const imageSizeRef = useRef({ width: 0, height: 0 });

  const [config, setConfig] = useState<ParticleConfig>(
    initialConfig ?? fixedConfig ?? {
      shape: "circle",
      background: "white",
      sampling: "grid",
      dotsPerLongEdge: 45,
      totalPoints: 1800,
      depthBias: 0.7,
      depthMul: 7.0,
      parallaxStrength: 70,
      opacity: 1.0,
    }
  );
  const [baseSize, setBaseSize] = useState(4.0);
  const [loaded, setLoaded] = useState(false);

  const origDataRef = useRef<ImageData | null>(null);
  const depthDataRef = useRef<ImageData | null>(null);
  const blurredBgRef = useRef<HTMLCanvasElement | null>(null);
  const labelMapRef = useRef<LabelMap | null>(null);

  const hasSegments = !!(segments && segments.length > 0);

  // Apply fixedConfig whenever it changes (presentation mode preset switches)
  useEffect(() => {
    if (fixedConfig) {
      setConfig(fixedConfig);
    }
  }, [fixedConfig]);

  // Report config changes upstream
  useEffect(() => {
    onConfigChange?.(config);
  }, [config, onConfigChange]);

  // Expose canvas ref
  useEffect(() => {
    if (canvasRefOut) {
      canvasRefOut.current = canvasRef.current;
    }
  });

  const handleConfigChange = useCallback((patch: Partial<ParticleConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  // -------------------------------------------------------------------------
  // Load images + decode segmentation masks in one shot.
  // Canvas only renders once `loaded` is true, so we never show particles
  // with missing label data.
  // -------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);

    (async () => {
      try {
        const [origImg, depthImg] = await Promise.all([
          loadImage(originalUrl, "anonymous"),
          loadImage(depthUrl, "anonymous"),
        ]);

        if (cancelled) return;

        const w = origImg.naturalWidth;
        const h = origImg.naturalHeight;
        imageSizeRef.current = { width: w, height: h };

        origDataRef.current = getImageData(origImg, w, h);
        depthDataRef.current = getImageData(depthImg, w, h);
        blurredBgRef.current = createBlurredBackground(origImg, w, h);

        // Decode segmentation masks (if provided) before first particle sample
        if (segments && segments.length > 0) {
          labelMapRef.current = await decodeSegmentationMasks(segments, w, h);
        } else {
          labelMapRef.current = null;
        }

        if (cancelled) return;

        const spacing = Math.max(w, h) / config.dotsPerLongEdge;
        setBaseSize(defaultBaseSize(spacing));
        setConfig((prev) => ({ ...prev, depthMul: fixedConfig ? prev.depthMul : defaultDepthMul(spacing) }));

        // Initial particles are computed WITH the label map
        particlesRef.current = sampleParticlesGrid(
          origDataRef.current,
          depthDataRef.current,
          config.dotsPerLongEdge,
          labelMapRef.current
        );
        setLoaded(true);
      } catch {
        // CORS or load failure — silently skip
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalUrl, depthUrl, segments]);

  // -------------------------------------------------------------------------
  // Recompute particles when sampling params or label map change
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!origDataRef.current || !depthDataRef.current) return;
    if (config.sampling === "grid") {
      particlesRef.current = sampleParticlesGrid(
        origDataRef.current,
        depthDataRef.current,
        config.dotsPerLongEdge,
        labelMapRef.current
      );
      const spacing =
        Math.max(imageSizeRef.current.width, imageSizeRef.current.height) /
        config.dotsPerLongEdge;
      setBaseSize(defaultBaseSize(spacing));
      if (!fixedConfig) {
        setConfig((prev) => ({ ...prev, depthMul: defaultDepthMul(spacing) }));
      }
    } else {
      particlesRef.current = sampleParticlesWeighted(
        origDataRef.current,
        depthDataRef.current,
        config.totalPoints,
        config.depthBias,
        labelMapRef.current
      );
      if (!fixedConfig) {
        setConfig((prev) => ({ ...prev, depthMul: 0.0 }));
      }
    }
  }, [config.sampling, config.dotsPerLongEdge, config.totalPoints, config.depthBias, fixedConfig]);

  // -------------------------------------------------------------------------
  // Ensure webfonts are loaded before canvas renders text glyphs
  // -------------------------------------------------------------------------

  const [fontsReady, setFontsReady] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Preload both FA and Chinese fonts so canvas draws never show tofu squares
    const loads = [
      document.fonts.load('900 16px "Font Awesome 7 Free"'),
      document.fonts.load('900 16px "Noto Sans TC"'),
    ];
    Promise.all(loads).then(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  // -------------------------------------------------------------------------
  // Animation loop
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!loaded) return;
    if (!fontsReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = imageSizeRef.current;
    canvas.width = width;
    canvas.height = height;

    const shapeCfg = getShapeConfig(config.shape);
    const { isText, isLabelBased, charKey, expandsOnHover } = shapeCfg;
    const brightnessMul = config.background === "white" ? 0.8 : 1.2;
    const proximityThresholdSq = (Math.max(width, height) * 0.1) ** 2;
    const ctx = canvas.getContext("2d")!;

    const particles = particlesRef.current;
    const len = particles.length;
    const colorR = new Uint8Array(len);
    const colorG = new Uint8Array(len);
    const colorB = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      colorR[i] = Math.min(255, particles[i].r * brightnessMul) | 0;
      colorG[i] = Math.min(255, particles[i].g * brightnessMul) | 0;
      colorB[i] = Math.min(255, particles[i].b * brightnessMul) | 0;
    }

    const oxArr = new Float32Array(len);
    const oyArr = new Float32Array(len);
    const distSqArr = new Float32Array(len);

    const labelState = createLabelRendererState();

    function animate() {
      ctx.clearRect(0, 0, width, height);
      if (blurredBgRef.current) {
        ctx.drawImage(blurredBgRef.current, 0, 0);
      }
      ctx.fillStyle = config.background === "white" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, width, height);

      if (isText) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
      }

      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;

      const cursorActive = mx !== 0 || my !== 0;
      const cursorX = cursorActive ? (mx + 1) / 2 * width : 0;
      const cursorY = cursorActive ? (my + 1) / 2 * height : 0;

      let closestIdx = -1;
      let minDistSq = Infinity;

      for (let i = 0; i < len; i++) {
        const p = particles[i];
        const ox = mx * config.parallaxStrength * p.depth;
        const oy = my * config.parallaxStrength * p.depth;
        oxArr[i] = ox;
        oyArr[i] = oy;
        if (cursorActive) {
          const dx = cursorX - (p.x + ox);
          const dy = cursorY - (p.y + oy);
          const dSq = dx * dx + dy * dy;
          distSqArr[i] = dSq;
          if (dSq < minDistSq) {
            minDistSq = dSq;
            closestIdx = i;
          }
        }
      }

      labelState.lastFontSize = -1;
      for (let i = 0; i < len; i++) {
        if (i === closestIdx) continue;
        const p = particles[i];
        let radius = Math.max(0.5, baseSize + (p.depth - 0.5) * config.depthMul);

        if (cursorActive && distSqArr[i] < proximityThresholdSq) {
          radius *= 1 + (1 - distSqArr[i] / proximityThresholdSq);
        }

        const drawX = p.x + oxArr[i];
        const drawY = p.y + oyArr[i];
        ctx.fillStyle = `rgba(${colorR[i]},${colorG[i]},${colorB[i]},${config.opacity})`;
        ctx.strokeStyle = ctx.fillStyle;
        const ch = p[charKey];
        if (isLabelBased) {
          ctx.translate(drawX, drawY);
          ctx.rotate(p.rotation);
          renderLabelParticle(ctx, labelState, config.shape, radius, ch, p.label, false);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        } else {
          renderParticle(ctx, config.shape, drawX, drawY, radius, ch, p.label);
        }
      }

      if (closestIdx >= 0) {
        const p = particles[closestIdx];
        const drawX = p.x + oxArr[closestIdx];
        const drawY = p.y + oyArr[closestIdx];
        const radius = Math.max(0.5, baseSize + (p.depth - 0.5) * config.depthMul) * 3;
        if (isLabelBased) {
          ctx.shadowColor = config.background === "black" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)";
          ctx.shadowBlur = radius * 1.5;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
        ctx.fillStyle = `rgba(${colorR[closestIdx]},${colorG[closestIdx]},${colorB[closestIdx]},${config.opacity})`;
        ctx.strokeStyle = ctx.fillStyle;
        const ch = p[charKey];
        if (isLabelBased) {
          ctx.translate(drawX, drawY);
          ctx.rotate(p.rotation);
          renderLabelParticle(ctx, labelState, config.shape, radius, ch, p.label, expandsOnHover);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        } else {
          renderParticle(ctx, config.shape, drawX, drawY, radius, ch, p.label);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loaded, fontsReady, baseSize, config.depthMul, config.parallaxStrength, config.opacity, config.shape, config.background]);

  // -------------------------------------------------------------------------
  // Pointer handlers (mouse + touch)
  // -------------------------------------------------------------------------

  const updatePointerPos = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mousePosRef.current = {
      x: ((clientX - rect.left) / rect.width) * 2 - 1,
      y: ((clientY - rect.top) / rect.height) * 2 - 1,
    };
  }, []);

  const resetPointerPos = useCallback(() => {
    mousePosRef.current = { x: 0, y: 0 };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    updatePointerPos(e.clientX, e.clientY);
  }, [updatePointerPos]);

  const handleMouseDown = useCallback(() => {
    setShowOriginal(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setShowOriginal(false);
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (!loaded) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner text-gold" />
      </div>
    );
  }

  const showControls = !fixedConfig;

  return (
    <div className="flex flex-col gap-6">
      {showControls && (
        <>
          <p className="caption-mono text-ink-faint">
            Particle Parallax
          </p>
          <ParticleControls
            config={config}
            onChange={handleConfigChange}
            hasSegments={hasSegments}
          />
        </>
      )}

      <div
        className={twMerge(
          STAMP_FACE,
          STAMP_CARD_SHADOW,
          "relative w-full overflow-hidden"
        )}
        ref={containerRef}
      >
        <div
          className="relative w-full cursor-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={resetPointerPos}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-auto block"
          />
          <img
            src={originalUrl}
            alt="Original"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none"
            style={{ opacity: showOriginal ? 1 : 0 }}
          />
        </div>
      </div>
    </div>
  );
}
