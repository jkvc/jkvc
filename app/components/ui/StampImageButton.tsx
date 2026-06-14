"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import StampShell from "@/app/components/ui/StampShell";

interface StampImageButtonProps {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  "aria-label": string;
  className?: string;
  style?: CSSProperties;
  faceClassName?: string;
  inline?: boolean;
  children: ReactNode;
}

/** Clickable stamped image — control lift on hover (shared by post lightbox triggers and gallery thumbs). */
export default function StampImageButton({
  onClick,
  "aria-label": ariaLabel,
  className,
  style,
  faceClassName,
  inline = false,
  children,
}: StampImageButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={style}
      className={twMerge(
        "group cursor-pointer border-0 bg-transparent p-0",
        className,
      )}
    >
      <StampShell
        variant="control"
        interactive
        inline={inline}
        bleed={false}
        className={inline ? undefined : "block w-full max-w-full"}
        faceClassName={twMerge("overflow-hidden bg-surface p-0", faceClassName)}
      >
        {children}
      </StampShell>
    </button>
  );
}
