"use client";

import { useLayoutEffect, useRef, useState } from "react";

interface WordmarkProps {
  className?: string;
  tabbable?: boolean;
}

interface SegmentProps {
  compact: string;
  full: string;
  red?: boolean;
  hovered: boolean;
}

/**
 * Padding on top/bottom of each segment that extends the `overflow: hidden`
 * clip box so italic Fraunces glyphs with extra ascender/descender (J, Junshen,
 * Chen) aren't vertically truncated. Negated via matching negative margin so
 * layout metrics are unchanged.
 */
const CLIP_OVERHANG = "0.25em";

/**
 * Segment renders two versions of a letter-group (compact upright, full italic)
 * stacked at the same origin. The outer box has a measured pixel width that
 * transitions between the two states while the children cross-fade.
 * Baseline is established by an invisible upright copy of the compact text.
 */
function Segment({ compact, full, red, hovered }: SegmentProps) {
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
  const targetWidth = hovered ? widths.full : widths.compact;
  const color = red ? "text-hot" : "text-ink";

  return (
    <span
      className={`relative inline-block align-baseline ${color}`}
      style={{
        width: hasMeasured ? `${targetWidth}px` : "auto",
        transition: "width 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        overflow: "hidden",
        paddingTop: CLIP_OVERHANG,
        paddingBottom: CLIP_OVERHANG,
        marginTop: `calc(-1 * ${CLIP_OVERHANG})`,
        marginBottom: `calc(-1 * ${CLIP_OVERHANG})`,
      }}
    >
      {/* Baseline holder — inline, visually invisible, sets the line-box. */}
      <span className="invisible whitespace-nowrap" aria-hidden="true">
        {compact}
      </span>

      {/* Compact state — upright, fades out on hover. */}
      <span
        ref={compactRef}
        aria-hidden="true"
        className="absolute left-0 whitespace-nowrap"
        style={{
          top: CLIP_OVERHANG,
          opacity: hovered ? 0 : 1,
          transition: "opacity 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {compact}
      </span>

      {/* Full state — italic, fades in on hover. */}
      <span
        ref={fullRef}
        aria-hidden="true"
        className="absolute left-0 whitespace-nowrap italic"
        style={{
          top: CLIP_OVERHANG,
          opacity: hovered ? 1 : 0,
          transition: "opacity 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {full}
      </span>
    </span>
  );
}

export default function Wordmark({ className = "", tabbable = true }: WordmarkProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      className={`wordmark font-serif leading-none tracking-[-0.03em] inline-flex items-baseline outline-none ${className}`}
      tabIndex={tabbable ? 0 : -1}
      role="img"
      aria-label="jkvc — Junshen Kevin Chen"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <Segment compact="j" full={"Junshen\u00A0"} hovered={hovered} />
      <Segment compact="kv" full={"Kevin\u00A0"} red hovered={hovered} />
      <Segment compact="c" full="Chen" hovered={hovered} />
    </span>
  );
}
