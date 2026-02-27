"use client";

import { useEffect, useRef } from "react";

const CELL_SIZE = 10;
const LINE_COLOR = "rgba(186, 146, 68, 0.20)";
const STRAIGHT_BIAS = 0.72; // probability of continuing in the same direction
const BG = "#FAFAF8";

// Directions: 0=N, 1=E, 2=S, 3=W
const DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]] as const;
const OPPOSITE = [2, 3, 0, 1] as const;

function generateMaze(cols: number, rows: number): boolean[][][] {
  const walls = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => [true, true, true, true])
  );
  const visited = Array.from({ length: rows }, () =>
    new Array(cols).fill(false) as boolean[]
  );

  // Stack entries: [r, c, lastDir] — lastDir=-1 for start
  const stack: [number, number, number][] = [[0, 0, -1]];
  visited[0][0] = true;

  while (stack.length > 0) {
    const [r, c, lastDir] = stack[stack.length - 1];

    // Try to continue straight first (biased)
    if (lastDir !== -1 && Math.random() < STRAIGHT_BIAS) {
      const nr = r + DIRS[lastDir][0];
      const nc = c + DIRS[lastDir][1];
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        walls[r][c][lastDir] = false;
        walls[nr][nc][OPPOSITE[lastDir]] = false;
        visited[nr][nc] = true;
        stack.push([nr, nc, lastDir]);
        continue;
      }
    }

    // Fall back to random unvisited neighbor
    const neighbors: [number, number, number][] = [];
    for (let d = 0; d < 4; d++) {
      const nr = r + DIRS[d][0];
      const nc = c + DIRS[d][1];
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        neighbors.push([nr, nc, d]);
      }
    }
    if (neighbors.length === 0) {
      stack.pop();
    } else {
      const [nr, nc, d] = neighbors[Math.floor(Math.random() * neighbors.length)];
      walls[r][c][d] = false;
      walls[nr][nc][OPPOSITE[d]] = false;
      visited[nr][nc] = true;
      stack.push([nr, nc, d]);
    }
  }
  return walls;
}

function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cols = Math.ceil(w / CELL_SIZE) + 2;
  const rows = Math.ceil(h / CELL_SIZE) + 2;
  const walls = generateMaze(cols, rows);

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 0.5;
  ctx.lineCap = "square";

  // Draw S and E walls only — covers every interior wall exactly once, no outer border
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * CELL_SIZE;
      const y = r * CELL_SIZE;
      if (r < rows - 1 && walls[r][c][2]) {
        ctx.beginPath();
        ctx.moveTo(x, y + CELL_SIZE);
        ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
        ctx.stroke();
      }
      if (c < cols - 1 && walls[r][c][1]) {
        ctx.beginPath();
        ctx.moveTo(x + CELL_SIZE, y);
        ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
        ctx.stroke();
      }
    }
  }
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    draw(canvas, ctx);

    const onResize = () => draw(canvas, ctx);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
