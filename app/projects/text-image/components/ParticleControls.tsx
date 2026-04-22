"use client";

import { SHAPES, BACKGROUNDS, SAMPLINGS } from "../lib/particle-types";
import type { ParticleConfig } from "../lib/particle-config";
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
              <button
                key={s.id}
                onClick={() => !disabled && onChange({ shape: s.id })}
                disabled={disabled}
                className={`h-9 min-w-9 px-3 rounded-full text-[13px] transition-all ${
                  disabled
                    ? "border border-[#EBEBEB] text-[#DDD] cursor-not-allowed"
                    : shape === s.id
                      ? "border border-gold bg-gold text-white shadow-sm"
                      : "border border-[#E0E0E0] text-[#AAA] hover:border-gold/50 hover:text-gold"
                } ${s.fontClass ?? ""}`}
                title={disabled ? `${s.title} (needs segmentation data)` : s.title}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Background */}
      <div className="flex flex-col gap-2">
        <p className="caption-mono text-ink-faint">Background</p>
        <div className="flex flex-wrap gap-1.5">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => onChange({ background: bg.id })}
              className={`h-9 px-3.5 rounded-full text-[12px] transition-all ${
                background === bg.id
                  ? "border border-gold bg-gold text-white shadow-sm"
                  : "border border-[#E0E0E0] text-[#AAA] hover:border-gold/50 hover:text-gold"
              }`}
            >
              {bg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sampling */}
      <div className="flex flex-col gap-2">
        <p className="caption-mono text-ink-faint">Sampling</p>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLINGS.map((s) => (
            <button
              key={s.id}
              onClick={() => onChange({ sampling: s.id })}
              className={`h-9 px-3.5 rounded-full text-[12px] transition-all ${
                sampling === s.id
                  ? "border border-gold bg-gold text-white shadow-sm"
                  : "border border-[#E0E0E0] text-[#AAA] hover:border-gold/50 hover:text-gold"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] text-[#999] mt-1">
          {sampling === "grid" ? (
            <label className="flex flex-col gap-1">
              <span>Dots/edge: {dotsPerLongEdge}</span>
              <input
                type="range"
                min={10}
                max={100}
                step={1}
                value={dotsPerLongEdge}
                onChange={(e) => onChange({ dotsPerLongEdge: Number(e.target.value) })}
                className="range range-xs"
                style={{ accentColor: "#8A8578" }}
              />
            </label>
          ) : (
            <>
              <label className="flex flex-col gap-1">
                <span>Points: {totalPoints}</span>
                <input
                  type="range"
                  min={200}
                  max={3000}
                  step={100}
                  value={totalPoints}
                  onChange={(e) => onChange({ totalPoints: Number(e.target.value) })}
                  className="range range-xs"
                  style={{ accentColor: "#8A8578" }}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span>Depth bias: {depthBias.toFixed(1)}</span>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.1}
                  value={depthBias}
                  onChange={(e) => onChange({ depthBias: Number(e.target.value) })}
                  className="range range-xs"
                  style={{ accentColor: "#8A8578" }}
                />
              </label>
            </>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        <p className="caption-mono text-ink-faint">Options</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] text-[#999]">
          <label className="flex flex-col gap-1">
            <span>Depth mul: {depthMul.toFixed(1)}</span>
            <input
              type="range"
              min={0}
              max={16}
              step={0.1}
              value={depthMul}
              onChange={(e) => onChange({ depthMul: Number(e.target.value) })}
              className="range range-xs"
              style={{ accentColor: "#8A8578" }}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Parallax: {parallaxStrength}</span>
            <input
              type="range"
              min={0}
              max={150}
              step={1}
              value={parallaxStrength}
              onChange={(e) => onChange({ parallaxStrength: Number(e.target.value) })}
              className="range range-xs"
              style={{ accentColor: "#8A8578" }}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Opacity: {opacity.toFixed(1)}</span>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.1}
              value={opacity}
              onChange={(e) => onChange({ opacity: Number(e.target.value) })}
              className="range range-xs"
              style={{ accentColor: "#8A8578" }}
            />
          </label>
        </div>
      </div>
    </>
  );
}
