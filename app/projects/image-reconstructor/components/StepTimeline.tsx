"use client";

import type { ColorInFrame } from "../lib/types";
import StepCard from "./StepCard";

interface Props {
  frames: ColorInFrame[];
  isRunning: boolean;
  currentLabel: string | null;
}

export default function StepTimeline({
  frames,
  isRunning,
  currentLabel,
}: Props) {
  if (frames.length === 0 && !isRunning) return null;

  return (
    <div>
      <div className="mb-3">
        <p className="caption-mono text-ink-faint">Color-In Steps</p>
      </div>

      <div>
        {frames.map((frame, i) => (
          <StepCard key={i} index={i} compositeUrl={frame.compositeUrl} />
        ))}

        {isRunning && (
          <div className="flex gap-3 items-center">
            <div className="flex items-center justify-center w-7 h-7 rounded-full border border-gold/40 text-gold shrink-0">
              <i className="fa-solid fa-spinner fa-spin" />
            </div>
            <span className="text-xs text-ink-muted">
              {currentLabel || "Compositing..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
