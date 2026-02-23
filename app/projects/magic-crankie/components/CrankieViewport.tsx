"use client";

import { type Segment, STATE_HEIGHT, VIEWPORT_WIDTH } from "../lib/state-machine";

const SCALE = VIEWPORT_WIDTH / STATE_HEIGHT;

interface CrankieViewportProps {
  segments: Segment[];
  scrollOffset: number;
  showDebug: boolean;
}

export default function CrankieViewport({
  segments,
  scrollOffset,
  showDebug,
}: CrankieViewportProps) {
  const positioned = segments.reduce<
    Array<Segment & { displayLeft: number; displayWidth: number }>
  >((acc, seg) => {
    const previous = acc[acc.length - 1];
    const displayLeft = previous
      ? previous.displayLeft + previous.displayWidth
      : 0;
    const displayWidth = seg.width * SCALE;
    acc.push({ ...seg, displayLeft, displayWidth });
    return acc;
  }, []);

  return (
    <div
      className="relative mx-auto overflow-hidden rounded-2xl"
      style={{
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_WIDTH,
        boxShadow:
          "inset 12px 0 20px -10px rgba(0,0,0,0.4), inset -12px 0 20px -10px rgba(0,0,0,0.4)",
      }}
    >
      <div
        className="absolute top-0 h-full"
        style={{
          transform: `translateX(${-scrollOffset * SCALE}px)`,
          willChange: "transform",
        }}
      >
        {positioned.map((seg) => (
          <div
            key={seg.id}
            className="absolute top-0"
            style={{
              left: seg.displayLeft,
              width: seg.displayWidth,
              height: VIEWPORT_WIDTH,
              background: seg.background,
              boxSizing: "border-box",
              border: showDebug ? "1px solid rgba(255,255,255,0.7)" : "none",
            }}
          >
            {showDebug && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-mono whitespace-nowrap select-none">
                {seg.label}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
