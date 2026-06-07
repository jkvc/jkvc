"use client";

/**
 * DevOnlyButton — stamp-consistent dev-only action button.
 *
 * Renders nothing in production. In development, renders as an active (inverted)
 * Pill with flanking radiation icons to signal its "danger / dev-only" status.
 */

import Pill from "@/app/components/editorial/Pill";

interface DevOnlyButtonProps {
  text: string;
  onClick: () => void;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
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
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <span className={className}>
      <Pill
        onClick={onClick}
        active
        disabled={disabled || loading}
        icon="fa-radiation"
        size="xs"
      >
        {loading ? (
          <>
            <i className="fa-solid fa-spinner animate-spin text-[9px]" />
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            <span>{text}</span>
            <i className="fa-solid fa-radiation text-[9px]" />
          </>
        )}
      </Pill>
    </span>
  );
}
