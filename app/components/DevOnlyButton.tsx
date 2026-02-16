"use client";

/**
 * DevOnlyButton — a shared pill-shaped button that only renders in development.
 *
 * Use this for any action that should be available during local development
 * but hidden in production (e.g. saving to gallery, debug tools, etc.).
 *
 * The show/hide logic lives INSIDE this component — callers don't need to
 * wrap it in a `process.env.NODE_ENV` check. Just render <DevOnlyButton />
 * unconditionally and it will self-hide in production.
 *
 * Features:
 * - Pill shape with a construction (fa-screwdriver-wrench) icon prefix
 * - Customizable label text
 * - Supports disabled, loading, and success states
 * - Accepts an optional className for layout overrides
 */

interface DevOnlyButtonProps {
  /** The label shown on the button. */
  text: string;
  /** Called when the button is clicked. */
  onClick: () => void;
  /** If true, shows a spinner and disables the button. */
  loading?: boolean;
  /** Text to show while loading (defaults to "Working…"). */
  loadingText?: string;
  /** If true, the button is disabled. */
  disabled?: boolean;
  /** Optional extra className for positioning / layout. */
  className?: string;
}

export default function DevOnlyButton({
  text,
  onClick,
  loading = false,
  loadingText = "Working\u2026",
  disabled = false,
  className = "",
}: DevOnlyButtonProps) {
  // Render nothing in production — this is the single gate for all dev-only buttons.
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] tracking-wide border border-[#E0E0E0] text-[#AAA] hover:border-gold/50 hover:text-gold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {loading ? (
        <>
          <span className="loading loading-spinner loading-xs" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          <i className="fa-solid fa-radiation text-[10px]" />
          <span>{text}</span>
          <i className="fa-solid fa-radiation text-[10px]" />
        </>
      )}
    </button>
  );
}
