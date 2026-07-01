"use client";

import { useEffect, useRef } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <div
      ref={scrollRef}
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
        <ul className="flex flex-col gap-2">
          {lines.map((line, index) => (
            <li
              key={`${index}-${line.offsetMs}-${line.message.slice(0, 32)}`}
              className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 items-start"
            >
              <span className="text-xs font-mono tabular-nums text-ink-faint text-right pt-px">
                {formatOffsetMs(line.offsetMs)}
              </span>
              <pre className="m-0 text-xs font-mono text-ink-muted leading-relaxed whitespace-pre-wrap break-all">
                {line.message}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
