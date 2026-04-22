/**
 * LabeledDivider — the `── LABEL ──` motif used throughout the editorial UI.
 *
 * Two modes:
 *   - `stub` (default): fixed short lines (32px) flanking a centered caption.
 *     Reads as a typographic flourish — use around small content like the
 *     examples strip or a between-sections interjection.
 *   - `full`: flex-expanding lines on both sides. Use when the label wants to
 *     separate two regions (e.g. settings groups).
 *
 * Caption uses the `caption-mono` utility and `text-ink-faint`. Hairlines use
 * the `hairline` utility.
 */
interface Props {
  children: React.ReactNode;
  variant?: "stub" | "full";
  className?: string;
}

export default function LabeledDivider({
  children,
  variant = "stub",
  className = "",
}: Props) {
  const lineCls = variant === "stub" ? "w-8 hairline" : "flex-1 hairline";

  return (
    <div className={`flex items-center gap-3 text-ink-faint ${className}`}>
      <span className={lineCls} />
      <span className="caption-mono whitespace-nowrap">{children}</span>
      <span className={lineCls} />
    </div>
  );
}
