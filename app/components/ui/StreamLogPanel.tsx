"use client";

import { twMerge } from "tailwind-merge";
import { STAMP_FACE, STAMP_CONTROL_SHADOW } from "@/app/lib/stamp";

export interface StreamLogEntry {
  offsetMs: number;
  message: string;
}

function formatOffsetMs(ms: number): string {
  return `+${(ms / 1000).toFixed(1)}s`;
}

interface Props {
  lines: StreamLogEntry[];
  emptyLabel?: string;
  className?: string;
}

export default function StreamLogPanel({
  lines,
  emptyLabel = "Status updates appear here while generating.",
  className,
}: Props) {
  return (
    <div
      className={twMerge(
        STAMP_FACE,
        STAMP_CONTROL_SHADOW,
        "bg-surface-2 p-3 min-h-[7rem] max-h-48 overflow-y-auto",
        className,
      )}
    >
      {lines.length === 0 ? (
        <p className="text-xs font-mono text-ink-faint">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {lines.map((line, index) => (
            <li
              key={`${index}-${line.offsetMs}-${line.message}`}
              className="text-xs font-mono text-ink-muted leading-relaxed"
            >
              <span className="text-ink-faint mr-2 tabular-nums">
                {formatOffsetMs(line.offsetMs)}
              </span>
              {line.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
