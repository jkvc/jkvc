"use client";

import { twMerge } from "tailwind-merge";

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  className?: string;
}

export default function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  className,
}: Props) {
  return (
    <label className={twMerge("flex flex-col gap-1.5", className)}>
      <span className="flex items-center justify-between gap-3">
        <span className="caption-mono text-ink-faint">{label}</span>
        <span className="caption-mono text-ink-muted tabular-nums">
          {format ? format(value) : value}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="stamp-range w-full"
      />
    </label>
  );
}
