"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";

interface WordmarkProps {
  className?: string;
  tabbable?: boolean;
  href?: string;
  // Render the expanded full name on first paint and contract to compact on
  // hover/focus. Used on the About page where the canonical hero is the
  // full identity. Default false (show compact, expand on hover).
  defaultExpanded?: boolean;
  // Toggle state on hover/focus. When false, the wordmark is pinned to
  // whichever state `defaultExpanded` selects. Default true.
  interactive?: boolean;
}

interface SegmentProps {
  compact: string;
  full: string;
  accent?: boolean;
  expanded: boolean;
}

// Padding on all four sides of each segment that extends the `overflow: hidden`
// clip box so italic Fraunces glyphs with long ascenders/descenders aren't
// truncated. Negated via matching negative margin so in-flow layout is intact.
const CLIP_OVERHANG = "0.25em";

/**
 * Segment renders two versions of a letter-group (compact upright Fraunces,
 * full italic Fraunces) stacked at the same origin. The outer box transitions
 * between the two widths while the children cross-fade.
 */
function Segment({ compact, full, accent, expanded }: SegmentProps) {
  const compactRef = useRef<HTMLSpanElement>(null);
  const fullRef = useRef<HTMLSpanElement>(null);
  const [widths, setWidths] = useState<{ compact: number; full: number }>({
    compact: 0,
    full: 0,
  });

  useLayoutEffect(() => {
    const measure = () => {
      if (!compactRef.current || !fullRef.current) return;
      setWidths({
        compact: compactRef.current.getBoundingClientRect().width,
        full: fullRef.current.getBoundingClientRect().width,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return () => window.removeEventListener("resize", measure);
  }, [compact, full]);

  const hasMeasured = widths.compact > 0 && widths.full > 0;
  const targetWidth = expanded ? widths.full : widths.compact;
  const color = accent ? "text-hot" : "text-ink";

  return (
    <span
      className={`relative inline-block align-baseline ${color}`}
      style={{
        boxSizing: "content-box",
        width: hasMeasured ? `${targetWidth}px` : "auto",
        transition: "width 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        overflow: "hidden",
        padding: CLIP_OVERHANG,
        margin: `calc(-1 * ${CLIP_OVERHANG})`,
      }}
    >
      <span className="invisible whitespace-nowrap" aria-hidden="true">
        {compact}
      </span>
      <span
        ref={compactRef}
        aria-hidden="true"
        className="absolute whitespace-nowrap"
        style={{
          top: CLIP_OVERHANG,
          left: CLIP_OVERHANG,
          opacity: expanded ? 0 : 1,
          transition: "opacity 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {compact}
      </span>
      <span
        ref={fullRef}
        aria-hidden="true"
        className="absolute whitespace-nowrap italic"
        style={{
          top: CLIP_OVERHANG,
          left: CLIP_OVERHANG,
          opacity: expanded ? 1 : 0,
          transition: "opacity 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {full}
      </span>
    </span>
  );
}

// `kv` is the accent pair (the hot-colored letters). `j` and `c` stay ink.
export default function Wordmark({
  className = "",
  tabbable = true,
  href,
  defaultExpanded = false,
  interactive = true,
}: WordmarkProps) {
  const [hovered, setHovered] = useState(false);
  const expanded = interactive
    ? defaultExpanded
      ? !hovered
      : hovered
    : defaultExpanded;
  const cls = `wordmark font-serif leading-none tracking-[-0.03em] inline-flex items-baseline outline-none ${className}`;
  const handlers = interactive
    ? {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
        onFocus: () => setHovered(true),
        onBlur: () => setHovered(false),
      }
    : {};
  const segments = (
    <>
      <Segment compact="j" full={"Junshen\u00A0"} expanded={expanded} />
      <Segment compact="kv" full={"Kevin\u00A0"} accent expanded={expanded} />
      <Segment compact="c" full="Chen" expanded={expanded} />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls} aria-label="jkvc — Junshen Kevin Chen" {...handlers}>
        {segments}
      </Link>
    );
  }

  return (
    <span
      className={cls}
      tabIndex={tabbable ? 0 : -1}
      role="img"
      aria-label="jkvc — Junshen Kevin Chen"
      {...handlers}
    >
      {segments}
    </span>
  );
}
