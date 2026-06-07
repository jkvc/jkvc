"use client";

import { SHAPES, BACKGROUNDS, SAMPLINGS } from "../lib/particle-types";
import type { ParticleConfig } from "../lib/particle-config";
import Pill from "@/app/components/editorial/Pill";
import RangeField from "@/app/components/ui/RangeField";
export type { ParticleConfig } from "../lib/particle-config";

interface Props {
  config: ParticleConfig;
  onChange: (patch: Partial<ParticleConfig>) => void;
  hasSegments: boolean;
}

export default function ParticleControls({ config, onChange, hasSegments }: Props) {
  const { shape, background, sampling, dotsPerLongEdge, totalPoints, depthBias, depthMul, parallaxStrength, opacity } = config;

  return (
    <>
      {/* Shape */}
      <div className="flex flex-col gap-2">
        <p className="caption-mono text-ink-faint">Shape</p>
        <div className="flex flex-wrap gap-1.5">
          {SHAPES.map((s) => {
            const disabled = !!(s.needsSegments && !hasSegments);
            return (
              <Pill
                key={s.id}
                onClick={() => !disabled && onChange({ shape: s.id })}
                disabled={disabled}
                active={shape === s.id}
                size="xs"
                title={disabled ? `${s.title} (needs segmentation data)` : s.title}
                className={s.fontClass ?? ""}
              >
                {s.label}
              </Pill>
            );
          })}
        </div>
      </div>

      {/* Background */}
      <div className="flex flex-col gap-2">
        <p className="caption-mono text-ink-faint">Background</p>
        <div className="flex flex-wrap gap-1.5">
          {BACKGROUNDS.map((bg) => (
            <Pill
              key={bg.id}
              onClick={() => onChange({ background: bg.id })}
              active={background === bg.id}
              size="xs"
            >
              {bg.label}
            </Pill>
          ))}
        </div>
      </div>

      {/* Sampling */}
      <div className="flex flex-col gap-2">
        <p className="caption-mono text-ink-faint">Sampling</p>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLINGS.map((s) => (
            <Pill
              key={s.id}
              onClick={() => onChange({ sampling: s.id })}
              active={sampling === s.id}
              size="xs"
            >
              {s.label}
            </Pill>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-1">
          {sampling === "grid" ? (
            <RangeField
              label="dots/edge"
              value={dotsPerLongEdge}
              min={10}
              max={100}
              step={1}
              onChange={(n) => onChange({ dotsPerLongEdge: Math.round(n) })}
            />
          ) : (
            <>
              <RangeField
                label="points"
                value={totalPoints}
                min={200}
                max={3000}
                step={100}
                onChange={(n) => onChange({ totalPoints: Math.round(n) })}
              />
              <RangeField
                label="depth bias"
                value={depthBias}
                min={0}
                max={5}
                step={0.1}
                format={(n) => n.toFixed(1)}
                onChange={(n) => onChange({ depthBias: n })}
              />
            </>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        <p className="caption-mono text-ink-faint">Options</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <RangeField
            label="depth mul"
            value={depthMul}
            min={0}
            max={16}
            step={0.1}
            format={(n) => n.toFixed(1)}
            onChange={(n) => onChange({ depthMul: n })}
          />
          <RangeField
            label="parallax"
            value={parallaxStrength}
            min={0}
            max={150}
            step={1}
            onChange={(n) => onChange({ parallaxStrength: Math.round(n) })}
          />
          <RangeField
            label="opacity"
            value={opacity}
            min={0.1}
            max={1}
            step={0.1}
            format={(n) => n.toFixed(1)}
            onChange={(n) => onChange({ opacity: n })}
          />
        </div>
      </div>
    </>
  );
}
