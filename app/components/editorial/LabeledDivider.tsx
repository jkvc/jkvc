/**
 * LabeledDivider — handbook-style section divider.
 *
 * Two modes:
 *   - `stub` (default): short 32px 2px lines flanking a monospaced label.
 *   - `full`: flex-expanding lines on both sides.
 *
 * Uses the 2px `hairline` utility and `caption-mono` label.
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
