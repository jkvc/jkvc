"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import {
  BowlScene,
  BallData,
  createBowlScene,
  addBall,
  selectBall,
  removeBall,
  destroyScene,
  isBallOutOfBowl,
} from "../lib/physics";

interface Props {
  images: { id: string; url: string }[];
  onRemove: (id: string) => void;
}

// Pre-load an image and return it
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function BowlCanvas({ images, onRemove }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<BowlScene | null>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setCanvasSize({ w: width, h: Math.min(width * 0.85, 420) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Initialize scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.w === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.w * dpr;
    canvas.height = canvasSize.h * dpr;
    canvas.style.width = `${canvasSize.w}px`;
    canvas.style.height = `${canvasSize.h}px`;

    const scene = createBowlScene(canvas, canvasSize.w, canvasSize.h);
    sceneRef.current = scene;

    return () => {
      destroyScene(scene);
      sceneRef.current = null;
    };
  }, [canvasSize]);

  // Sync balls with images prop
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const currentIds = new Set(scene.balls.map((b) => b.id));
    const targetIds = new Set(images.map((i) => i.id));

    // Remove balls no longer in images
    for (const ball of [...scene.balls]) {
      if (!targetIds.has(ball.id)) {
        removeBall(scene, ball.id);
      }
    }

    // Add new balls
    for (const img of images) {
      if (!currentIds.has(img.id)) {
        addBall(scene, img.url, img.id);
        // Pre-load image
        if (!imageCache.current.has(img.id)) {
          loadImage(img.url).then((el) => imageCache.current.set(img.id, el));
        }
      }
    }
  }, [images]);

  // Click to select
  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    if (!canvas || !scene) return;

    let isDrag = false;
    let startPos = { x: 0, y: 0 };

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touch = "touches" in e ? e.changedTouches[0] : e;
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      startPos = getPos(e);
      isDrag = false;
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      const pos = getPos(e);
      if (Math.abs(pos.x - startPos.x) > 5 || Math.abs(pos.y - startPos.y) > 5) {
        isDrag = true;
      }
    };

    const onUp = (e: MouseEvent | TouchEvent) => {
      if (isDrag) return; // was a drag, not a click
      const pos = getPos(e);

      // Find clicked ball
      let clickedBall: BallData | null = null;
      for (const ball of scene.balls) {
        const bp = ball.body.position;
        const dx = pos.x - bp.x;
        const dy = pos.y - bp.y;
        if (dx * dx + dy * dy < ball.radius * ball.radius) {
          clickedBall = ball;
        }
      }

      selectBall(scene, clickedBall?.id ?? null);
    };

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: true });
    canvas.addEventListener("touchmove", onMove, { passive: true });
    canvas.addEventListener("touchend", onUp);

    return () => {
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("touchstart", onDown);
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("touchend", onUp);
    };
  }, [canvasSize]);

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    if (!canvas || !scene) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

    // Draw bowl
    drawBowl(ctx, scene);

    // Check for balls out of bowl and remove
    for (const ball of [...scene.balls]) {
      if (isBallOutOfBowl(scene, ball)) {
        removeBall(scene, ball.id);
        onRemove(ball.id);
      }
    }

    // Draw balls
    for (const ball of scene.balls) {
      drawGlassBall(ctx, ball, imageCache.current.get(ball.id) ?? null);
    }

    // Draw "drop zone" hint if dragging near edges
    rafRef.current = requestAnimationFrame(render);
  }, [canvasSize, onRemove]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  return (
    <div ref={containerRef} className="w-full">
      {canvasSize.w > 0 && (
        <canvas
          ref={canvasRef}
          className="w-full rounded-2xl border border-border"
          style={{ touchAction: "none" }}
        />
      )}
    </div>
  );
}

function drawBowl(ctx: CanvasRenderingContext2D, scene: BowlScene) {
  const cx = scene.canvasWidth / 2;
  const cy = scene.bowlY;
  const halfW = scene.bowlWidth / 2;
  const depth = scene.bowlHeight;

  ctx.save();
  ctx.beginPath();

  // Draw U-shape — must match the bezier used in physics.ts
  ctx.moveTo(cx - halfW, cy);
  ctx.bezierCurveTo(
    cx - halfW, cy + depth * 1.8,
    cx + halfW, cy + depth * 1.8,
    cx + halfW, cy
  );

  ctx.strokeStyle = "#D0CCC4";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Subtle inner shadow
  ctx.strokeStyle = "rgba(0,0,0,0.04)";
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.restore();
}

function drawGlassBall(
  ctx: CanvasRenderingContext2D,
  ball: BallData,
  img: HTMLImageElement | null
) {
  const { x, y } = ball.body.position;
  const r = ball.radius;
  const angle = ball.body.angle;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Clip to circle
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Draw image or placeholder
  if (img) {
    // Cover-fit the image into the circle
    const aspect = img.width / img.height;
    let drawW: number, drawH: number;
    if (aspect > 1) {
      drawH = r * 2;
      drawW = drawH * aspect;
    } else {
      drawW = r * 2;
      drawH = drawW / aspect;
    }
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  } else {
    ctx.fillStyle = "#E0DDD5";
    ctx.fillRect(-r, -r, r * 2, r * 2);
  }

  // Glass ball shading: dark edges, bright highlight
  // Outer shadow ring
  const edgeGrad = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r);
  edgeGrad.addColorStop(0, "rgba(0,0,0,0)");
  edgeGrad.addColorStop(0.7, "rgba(0,0,0,0.05)");
  edgeGrad.addColorStop(1, "rgba(0,0,0,0.3)");
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(-r, -r, r * 2, r * 2);

  // Top-left highlight
  const hlGrad = ctx.createRadialGradient(
    -r * 0.3, -r * 0.3, 0,
    -r * 0.3, -r * 0.3, r * 0.6
  );
  hlGrad.addColorStop(0, "rgba(255,255,255,0.7)");
  hlGrad.addColorStop(0.5, "rgba(255,255,255,0.15)");
  hlGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hlGrad;
  ctx.fillRect(-r, -r, r * 2, r * 2);

  // Small specular dot
  ctx.beginPath();
  ctx.arc(-r * 0.25, -r * 0.25, r * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fill();

  ctx.restore();

  // Selected ring
  if (ball.selected) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r + 3, 0, Math.PI * 2);
    ctx.strokeStyle = "#8A8578";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}
