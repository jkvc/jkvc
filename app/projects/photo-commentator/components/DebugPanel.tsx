"use client";

import { twMerge } from "tailwind-merge";
import type { Tunables } from "../lib/types";
import { DEFAULT_TUNABLES } from "../lib/defaults";
import { THEME_SYSTEM, COMMENT_SYSTEM } from "../lib/prompts";
import { STAMP_FACE, STAMP_CARD_SHADOW } from "@/app/lib/stamp";
import Pill from "@/app/components/editorial/Pill";
import RangeField from "@/app/components/ui/RangeField";

interface Props {
  tunables: Tunables;
  setTunables: (t: Tunables | ((prev: Tunables) => Tunables)) => void;
  onResample: () => void;
  onRegenerate: () => void;
}

const SECTION_HEADER = "caption-mono text-ink-faint";
const FIELD_LABEL = "text-xs text-ink-muted flex items-center justify-between";
const INPUT_BASE =
  "border-2 border-rule bg-surface text-xs font-mono p-2 w-full leading-relaxed";

export default function DebugPanel({
  tunables,
  setTunables,
  onResample,
  onRegenerate,
}: Props) {
  const set = <K extends keyof Tunables>(key: K, value: Tunables[K]) =>
    setTunables((p) => ({ ...p, [key]: value }));

  return (
    <div
      className={twMerge(
        STAMP_FACE,
        STAMP_CARD_SHADOW,
        "flex flex-col gap-6 p-4 bg-surface-sunken"
      )}
    >
      {/* Sampling */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={SECTION_HEADER}>Sampling</span>
          <Pill size="xs" onClick={onResample}>Re-sample</Pill>
        </div>
        <RangeField
          label="num boxes"
          value={tunables.numBoxes}
          min={1}
          max={10}
          step={1}
          onChange={(n) => set("numBoxes", Math.round(n))}
        />
        <RangeField
          label="min box (frac)"
          value={tunables.minBoxFrac}
          min={0.05}
          max={0.25}
          step={0.01}
          onChange={(n) => set("minBoxFrac", n)}
          format={(n) => n.toFixed(2)}
        />
        <RangeField
          label="max box (frac)"
          value={tunables.maxBoxFrac}
          min={0.1}
          max={0.4}
          step={0.01}
          onChange={(n) => set("maxBoxFrac", n)}
          format={(n) => n.toFixed(2)}
        />
        <RangeField
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
          <span className={SECTION_HEADER}>LLM</span>
          <Pill size="xs" onClick={onRegenerate}>Regenerate</Pill>
        </div>
        <RangeField
          label="max lines"
          value={tunables.maxLines}
          min={1}
          max={3}
          step={1}
          onChange={(n) => set("maxLines", Math.round(n))}
        />
        <RangeField
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
            <Pill size="xs" onClick={() => set("themeSystemPrompt", THEME_SYSTEM)}>
              Reset
            </Pill>
          </span>
          <textarea
            value={tunables.themeSystemPrompt}
            onChange={(e) => set("themeSystemPrompt", e.target.value)}
            rows={6}
            className={twMerge(INPUT_BASE, "resize-y")}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className={FIELD_LABEL}>
            <span>comment system prompt</span>
            <Pill size="xs" onClick={() => set("commentSystemPrompt", COMMENT_SYSTEM)}>
              Reset
            </Pill>
          </span>
          <textarea
            value={tunables.commentSystemPrompt}
            onChange={(e) => set("commentSystemPrompt", e.target.value)}
            rows={10}
            className={twMerge(INPUT_BASE, "resize-y")}
          />
          <p className="caption-mono text-ink-faint leading-snug">
            Placeholders:{" "}
            <code className="font-mono">{`{{theme}}`}</code>{" "}
            <code className="font-mono">{`{{maxLines}}`}</code>{" "}
            <code className="font-mono">{`{{maxWords}}`}</code>
          </p>
        </div>
      </div>

      {/* Render */}
      <div className="flex flex-col gap-3">
        <span className={SECTION_HEADER}>Render</span>
        <RangeField
          label="font size"
          value={tunables.fontPx}
          min={10}
          max={36}
          step={1}
          onChange={(n) => set("fontPx", Math.round(n))}
          format={(n) => `${n}px`}
        />
        <RangeField
          label="anchor offset x"
          value={tunables.textAnchorOffsetX}
          min={-0.5}
          max={0.5}
          step={0.01}
          onChange={(n) => set("textAnchorOffsetX", n)}
          format={(n) => n.toFixed(2)}
        />
        <RangeField
          label="anchor offset y"
          value={tunables.textAnchorOffsetY}
          min={-0.5}
          max={0.5}
          step={0.01}
          onChange={(n) => set("textAnchorOffsetY", n)}
          format={(n) => n.toFixed(2)}
        />
        <RangeField
          label="text box width (frac of image)"
          value={tunables.textBoxWidthFrac}
          min={0.1}
          max={1.0}
          step={0.01}
          onChange={(n) => set("textBoxWidthFrac", n)}
          format={(n) => n.toFixed(2)}
        />

        <label className={FIELD_LABEL}>
          <span>text align</span>
          <select
            value={tunables.textAlign}
            onChange={(e) =>
              set("textAlign", e.target.value as Tunables["textAlign"])
            }
            className="border-2 border-rule bg-surface caption-mono text-ink-muted px-2 py-1"
          >
            <option value="left">left</option>
            <option value="center">center</option>
            <option value="right">right</option>
          </select>
        </label>

        <label className={FIELD_LABEL}>
          <span>show boxes</span>
          <input
            type="checkbox"
            checked={tunables.showBoxes}
            onChange={(e) => set("showBoxes", e.target.checked)}
            className="accent-ink"
          />
        </label>
        <label className={FIELD_LABEL}>
          <span>show anchors</span>
          <input
            type="checkbox"
            checked={tunables.showAnchors}
            onChange={(e) => set("showAnchors", e.target.checked)}
            className="accent-ink"
          />
        </label>

        <label className={FIELD_LABEL}>
          <span>text color</span>
          <select
            value={tunables.textColor}
            onChange={(e) =>
              set("textColor", e.target.value as Tunables["textColor"])
            }
            className="border-2 border-rule bg-surface caption-mono text-ink-muted px-2 py-1"
          >
            <option value="auto">auto</option>
            <option value="white">white</option>
            <option value="black">black</option>
          </select>
        </label>
      </div>

      <Pill size="xs" onClick={() => setTunables(DEFAULT_TUNABLES)}>
        Reset all to defaults
      </Pill>
    </div>
  );
}
