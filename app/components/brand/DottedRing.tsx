interface DottedRingProps {
  size?: number;
  dots?: number;
  dotRadius?: number;
  className?: string;
  color?: string;
  centerDot?: boolean;
}

/**
 * Evenly-spaced dots arranged on a circle. The jkvc signature mark.
 * Default color is the spot red (`--color-hot`); override via the `color` prop
 * (e.g. for inverted contexts).
 */
export default function DottedRing({
  size = 40,
  dots = 24,
  dotRadius = 1.1,
  className = "",
  color = "var(--color-hot)",
  centerDot = true,
}: DottedRingProps) {
  const cx = size / 2;
  const cy = size / 2;
  const ringRadius = size / 2 - dotRadius - 1;

  const points = Array.from({ length: dots }, (_, i) => {
    const angle = (i / dots) * Math.PI * 2 - Math.PI / 2;
    return {
      x: cx + ringRadius * Math.cos(angle),
      y: cy + ringRadius * Math.sin(angle),
    };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={dotRadius} fill={color} />
      ))}
      {centerDot && <circle cx={cx} cy={cy} r={dotRadius * 1.4} fill={color} />}
    </svg>
  );
}
