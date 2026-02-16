"use client";

import type { Shape, Background, Sampling } from "../lib/particle-types";
import { SHAPES, BACKGROUNDS, SAMPLINGS } from "../lib/particle-types";

export interface ParticleConfig {
  shape: Shape;
  background: Background;
  sampling: Sampling;
  dotsPerLongEdge: number;
  totalPoints: number;
  depthBias: number;
  depthMul: number;
  parallaxStrength: number;
  opacity: number;
}

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
        <p className="text-xs text-base-content/50 font-medium">Shape</p>
        <div className="flex flex-wrap gap-1.5">
          {SHAPES.map((s) => {
            const disabled = !!(s.needsSegments && !hasSegments);
            return (
              <button
                key={s.id}
                onClick={() => !disabled && onChange({ shape: s.id })}
                disabled={disabled}
                className={`h-8 min-w-8 px-2.5 rounded-md text-sm transition-all ${
                  disabled
                    ? "bg-base-200/30 text-base-content/20 cursor-not-allowed"
                    : shape === s.id
                      ? "bg-base-content text-base-100"
                      : "bg-base-200/60 text-base-content/40 hover:text-base-content/70 hover:bg-base-200"
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
        <p className="text-xs text-base-content/50 font-medium">Background</p>
        <div className="flex flex-wrap gap-1.5">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => onChange({ background: bg.id })}
              className={`h-8 px-3 rounded-md text-xs transition-all ${
                background === bg.id
                  ? "bg-base-content text-base-100"
                  : "bg-base-200/60 text-base-content/40 hover:text-base-content/70 hover:bg-base-200"
              }`}
            >
              {bg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sampling */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-base-content/50 font-medium">Sampling</p>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLINGS.map((s) => (
            <button
              key={s.id}
              onClick={() => onChange({ sampling: s.id })}
              className={`h-8 px-3 rounded-md text-xs transition-all ${
                sampling === s.id
                  ? "bg-base-content text-base-100"
                  : "bg-base-200/60 text-base-content/40 hover:text-base-content/70 hover:bg-base-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-base-content/60 mt-1">
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
                className="range range-xs range-primary"
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
                  className="range range-xs range-primary"
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
                  className="range range-xs range-primary"
                />
              </label>
            </>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-base-content/50 font-medium">Options</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-base-content/60">
          <label className="flex flex-col gap-1">
            <span>Depth mul: {depthMul.toFixed(1)}</span>
            <input
              type="range"
              min={0}
              max={16}
              step={0.1}
              value={depthMul}
              onChange={(e) => onChange({ depthMul: Number(e.target.value) })}
              className="range range-xs range-primary"
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
              className="range range-xs range-primary"
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
              className="range range-xs range-primary"
            />
          </label>
        </div>
      </div>
    </>
  );
}
