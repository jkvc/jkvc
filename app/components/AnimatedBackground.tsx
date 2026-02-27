"use client";

import { useEffect, useRef } from "react";

const GRID_SIZE = 24;
const REPEL_RADIUS = 350;
const REPEL_STRENGTH = 60;
const LERP_FACTOR = 0.12;

const BG = "#FAFAF8";
const LINE_R = 0;
const LINE_G = 0;
const LINE_B = 0;
const BASE_ALPHA = 0.06;
const MAX_ALPHA = 0.38;

function renderRepel(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  mx: number,
  my: number
) {
  const baseColor = `rgba(${LINE_R}, ${LINE_G}, ${LINE_B}, ${BASE_ALPHA})`;
  const cols = Math.ceil(w / GRID_SIZE) + 1;
  const rows = Math.ceil(h / GRID_SIZE) + 1;

  const pts: { x: number; y: number }[][] = [];
  for (let row = 0; row < rows; row++) {
    pts[row] = [];
    for (let col = 0; col < cols; col++) {
      const gx = col * GRID_SIZE;
      const gy = row * GRID_SIZE;
      const dx = gx - mx;
      const dy = gy - my;
      const dist = Math.hypot(dx, dy);
      if (dist < REPEL_RADIUS && dist > 0.1) {
        const t = 1 - dist / REPEL_RADIUS;
        const push = REPEL_STRENGTH * t * t;
        pts[row][col] = {
          x: gx + (dx / dist) * push,
          y: gy + (dy / dist) * push,
        };
      } else {
        pts[row][col] = { x: gx, y: gy };
      }
    }
  }

  ctx.strokeStyle = baseColor;
  ctx.lineWidth = 1;

  for (let col = 0; col < cols; col++) {
    ctx.beginPath();
    ctx.moveTo(pts[0][col].x + 0.5, pts[0][col].y);
    for (let row = 1; row < rows; row++) {
      ctx.lineTo(pts[row][col].x + 0.5, pts[row][col].y);
    }
    ctx.stroke();
  }

  for (let row = 0; row < rows; row++) {
    ctx.beginPath();
    ctx.moveTo(pts[row][0].x, pts[row][0].y + 0.5);
    for (let col = 1; col < cols; col++) {
      ctx.lineTo(pts[row][col].x, pts[row][col].y + 0.5);
    }
    ctx.stroke();
  }

  const startCol = Math.max(0, Math.floor((mx - REPEL_RADIUS) / GRID_SIZE));
  const endCol = Math.min(cols - 1, Math.ceil((mx + REPEL_RADIUS) / GRID_SIZE));
  const startRow = Math.max(0, Math.floor((my - REPEL_RADIUS) / GRID_SIZE));
  const endRow = Math.min(rows - 1, Math.ceil((my + REPEL_RADIUS) / GRID_SIZE));

  for (let col = startCol; col <= endCol; col++) {
    for (let row = startRow; row < endRow; row++) {
      const p1 = pts[row][col];
      const p2 = pts[row + 1][col];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const dist = Math.hypot(midX - mx, midY - my);
      if (dist < REPEL_RADIUS) {
        const t = 1 - dist / REPEL_RADIUS;
        const alpha = (MAX_ALPHA - BASE_ALPHA) * t * t;
        ctx.strokeStyle = `rgba(${LINE_R}, ${LINE_G}, ${LINE_B}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(p1.x + 0.5, p1.y);
        ctx.lineTo(p2.x + 0.5, p2.y);
        ctx.stroke();
      }
    }
  }

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
      const p1 = pts[row][col];
      const p2 = pts[row][col + 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const dist = Math.hypot(midX - mx, midY - my);
      if (dist < REPEL_RADIUS) {
        const t = 1 - dist / REPEL_RADIUS;
        const alpha = (MAX_ALPHA - BASE_ALPHA) * t * t;
        ctx.strokeStyle = `rgba(${LINE_R}, ${LINE_G}, ${LINE_B}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y + 0.5);
        ctx.lineTo(p2.x, p2.y + 0.5);
        ctx.stroke();
      }
    }
  }
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseTarget = useRef({ x: -1000, y: -1000 });
  const mouseSmooth = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseTarget.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => {
      mouseTarget.current = { x: -1000, y: -1000 };
    };
    window.addEventListener("mousemove", onMouseMove);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    const render = () => {
      mouseSmooth.current.x +=
        (mouseTarget.current.x - mouseSmooth.current.x) * LERP_FACTOR;
      mouseSmooth.current.y +=
        (mouseTarget.current.y - mouseSmooth.current.y) * LERP_FACTOR;

      const mx = mouseSmooth.current.x;
      const my = mouseSmooth.current.y;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      renderRepel(ctx, w, h, mx, my);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
