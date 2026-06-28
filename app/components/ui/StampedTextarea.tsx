"use client";

import { twMerge } from "tailwind-merge";

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const INPUT_BASE =
  "border-2 border-rule bg-surface text-xs font-mono p-2 w-full leading-relaxed";

export default function StampedTextarea({
  value,
  onChange,
  label,
  rows = 3,
  placeholder,
  disabled = false,
  className,
}: Props) {
  return (
    <label className={twMerge("flex flex-col gap-1", className)}>
      {label ? (
        <span className="text-xs text-ink-muted">{label}</span>
      ) : null}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={twMerge(INPUT_BASE, "resize-y disabled:opacity-50")}
      />
    </label>
  );
}
