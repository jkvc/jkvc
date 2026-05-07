"use client";

import type { Tunables } from "../lib/types";
import { DEFAULT_TUNABLES } from "../lib/defaults";
import { THEME_SYSTEM, COMMENT_SYSTEM } from "../lib/prompts";

interface Props {
  tunables: Tunables;
  setTunables: (t: Tunables | ((prev: Tunables) => Tunables)) => void;
  /** Re-sample boxes only (no LLM). Captions are cleared. */
  onResample: () => void;
  /** Re-fire theme + all per-box calls. */
  onRegenerate: () => void;
}

const SECTION_HEADER =
  "text-[10px] uppercase tracking-widest text-[#888] mb-2";
const FIELD_LABEL = "text-[11px] text-[#666] flex items-center justify-between";
const NUM_VALUE = "text-[10px] font-mono text-[#888]";

function NumberSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  format?: (n: number) => string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={FIELD_LABEL}>
        <span>{label}</span>
        <span className={NUM_VALUE}>
          {format ? format(value) : value.toString()}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-gold"
      />
    </label>
  );
}

export default function DebugPanel({
  tunables,
  setTunables,
  onResample,
  onRegenerate,
}: Props) {
  const set = <K extends keyof Tunables>(key: K, value: Tunables[K]) =>
    setTunables((p) => ({ ...p, [key]: value }));

  return (
    <div className="flex flex-col gap-6 p-4 border border-[#E8E8E8] rounded-lg bg-[#FAFAFA]">
      {/* Sampling */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className={SECTION_HEADER}>Sampling</p>
          <button
            onClick={onResample}
            className="text-[10px] uppercase tracking-widest text-[#666] hover:text-ink border border-[#DDD] hover:border-ink rounded-full px-3 py-1 transition-colors"
          >
            Re-sample
          </button>
        </div>
        <NumberSlider
          label="num boxes"
          value={tunables.numBoxes}
          min={1}
          max={10}
          step={1}
          onChange={(n) => set("numBoxes", Math.round(n))}
        />
        <NumberSlider
          label="min box (frac)"
          value={tunables.minBoxFrac}
          min={0.05}
          max={0.25}
          step={0.01}
          onChange={(n) => set("minBoxFrac", n)}
          format={(n) => n.toFixed(2)}
        />
        <NumberSlider
          label="max box (frac)"
          value={tunables.maxBoxFrac}
          min={0.1}
          max={0.4}
          step={0.01}
          onChange={(n) => set("maxBoxFrac", n)}
          format={(n) => n.toFixed(2)}
        />
        <NumberSlider
          label="separation iters"
          value={tunables.separationIters}
          min={0}
          max={50}
          step={1}
          onChange={(n) => set("separationIters", Math.round(n))}
        />
      </div>

      {/* LLM */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className={SECTION_HEADER}>LLM</p>
          <button
            onClick={onRegenerate}
            className="text-[10px] uppercase tracking-widest text-[#666] hover:text-ink border border-[#DDD] hover:border-ink rounded-full px-3 py-1 transition-colors"
          >
            Regenerate
          </button>
        </div>
        <NumberSlider
          label="max lines"
          value={tunables.maxLines}
          min={1}
          max={3}
          step={1}
          onChange={(n) => set("maxLines", Math.round(n))}
        />
        <NumberSlider
          label="max words / line"
          value={tunables.maxWordsPerLine}
          min={1}
          max={12}
          step={1}
          onChange={(n) => set("maxWordsPerLine", Math.round(n))}
        />

        <div className="flex flex-col gap-1">
          <span className={FIELD_LABEL}>
            <span>theme system prompt</span>
            <button
              className="text-[10px] uppercase tracking-widest text-[#888] hover:text-ink"
              onClick={() => set("themeSystemPrompt", THEME_SYSTEM)}
            >
              Reset
            </button>
          </span>
          <textarea
            value={tunables.themeSystemPrompt}
            onChange={(e) => set("themeSystemPrompt", e.target.value)}
            rows={6}
            className="w-full text-[11px] font-mono p-2 border border-[#DDD] rounded-md bg-white resize-y leading-relaxed"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className={FIELD_LABEL}>
            <span>comment system prompt</span>
            <button
              className="text-[10px] uppercase tracking-widest text-[#888] hover:text-ink"
              onClick={() => set("commentSystemPrompt", COMMENT_SYSTEM)}
            >
              Reset
            </button>
          </span>
          <textarea
            value={tunables.commentSystemPrompt}
            onChange={(e) => set("commentSystemPrompt", e.target.value)}
            rows={10}
            className="w-full text-[11px] font-mono p-2 border border-[#DDD] rounded-md bg-white resize-y leading-relaxed"
          />
          <p className="text-[10px] text-[#999] leading-snug">
            Placeholders:{" "}
            <code className="font-mono">{`{{theme}}`}</code>{" "}
            <code className="font-mono">{`{{maxLines}}`}</code>{" "}
            <code className="font-mono">{`{{maxWords}}`}</code>
          </p>
        </div>
      </div>

      {/* Render */}
      <div className="flex flex-col gap-3">
        <p className={SECTION_HEADER}>Render</p>
        <NumberSlider
          label="font size"
          value={tunables.fontPx}
          min={10}
          max={36}
          step={1}
          onChange={(n) => set("fontPx", Math.round(n))}
          format={(n) => `${n}px`}
        />
        <NumberSlider
          label="anchor offset x"
          value={tunables.textAnchorOffsetX}
          min={-0.5}
          max={0.5}
          step={0.01}
          onChange={(n) => set("textAnchorOffsetX", n)}
          format={(n) => n.toFixed(2)}
        />
        <NumberSlider
          label="anchor offset y"
          value={tunables.textAnchorOffsetY}
          min={-0.5}
          max={0.5}
          step={0.01}
          onChange={(n) => set("textAnchorOffsetY", n)}
          format={(n) => n.toFixed(2)}
        />
        <NumberSlider
          label="text box width (frac of image)"
          value={tunables.textBoxWidthFrac}
          min={0.1}
          max={1.0}
          step={0.01}
          onChange={(n) => set("textBoxWidthFrac", n)}
          format={(n) => n.toFixed(2)}
        />

        <label className="flex items-center justify-between text-[11px] text-[#666]">
          <span>text align</span>
          <select
            value={tunables.textAlign}
            onChange={(e) =>
              set("textAlign", e.target.value as Tunables["textAlign"])
            }
            className="text-[11px] border border-[#DDD] rounded-md px-2 py-1 bg-white"
          >
            <option value="left">left</option>
            <option value="center">center</option>
            <option value="right">right</option>
          </select>
        </label>

        <label className="flex items-center justify-between text-[11px] text-[#666]">
          <span>show boxes</span>
          <input
            type="checkbox"
            checked={tunables.showBoxes}
            onChange={(e) => set("showBoxes", e.target.checked)}
            className="accent-gold"
          />
        </label>
        <label className="flex items-center justify-between text-[11px] text-[#666]">
          <span>show anchors</span>
          <input
            type="checkbox"
            checked={tunables.showAnchors}
            onChange={(e) => set("showAnchors", e.target.checked)}
            className="accent-gold"
          />
        </label>

        <label className="flex items-center justify-between text-[11px] text-[#666]">
          <span>text color</span>
          <select
            value={tunables.textColor}
            onChange={(e) =>
              set("textColor", e.target.value as Tunables["textColor"])
            }
            className="text-[11px] border border-[#DDD] rounded-md px-2 py-1 bg-white"
          >
            <option value="auto">auto</option>
            <option value="white">white</option>
            <option value="black">black</option>
          </select>
        </label>
      </div>

      <button
        className="text-[10px] uppercase tracking-widest text-[#888] hover:text-ink self-start"
        onClick={() => setTunables(DEFAULT_TUNABLES)}
      >
        Reset all to defaults
      </button>
    </div>
  );
}
