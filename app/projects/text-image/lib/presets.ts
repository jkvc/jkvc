/**
 * Presentation mode presets.
 *
 * Each preset is a fixed ParticleConfig plus display metadata (English name,
 * Chinese name, and an emoji for the circular selector button).
 *
 * To add or reorder presets, edit the PRESETS array below.
 */

import type { ParticleConfig } from "../components/ParticleControls";

export interface Preset {
  id: string;
  labelEn: string;
  labelZh: string;
  emoji: string;
  config: ParticleConfig;
}

/**
 * The four presentation presets, in display order.
 *
 * Order: English labels → Chinese labels → Emoji icons → Circular dots
 */
export const PRESETS: Preset[] = [
  {
    id: "label-en",
    labelEn: "Labels",
    labelZh: "標籤",
    emoji: "🔤",
    config: {
      shape: "label",
      background: "black",
      sampling: "grid",
      dotsPerLongEdge: 45,
      totalPoints: 1800,
      depthBias: 0.7,
      depthMul: 7.0,
      parallaxStrength: 70,
      opacity: 1.0,
    },
  },
  {
    id: "label-zh",
    labelEn: "Chinese",
    labelZh: "漢字",
    emoji: "文",
    config: {
      shape: "label-zh",
      background: "black",
      sampling: "grid",
      dotsPerLongEdge: 45,
      totalPoints: 1800,
      depthBias: 0.7,
      depthMul: 7.0,
      parallaxStrength: 70,
      opacity: 1.0,
    },
  },
  {
    id: "label-icon",
    labelEn: "Icons",
    labelZh: "圖標",
    emoji: "✨",
    config: {
      shape: "label-icon",
      background: "black",
      sampling: "grid",
      dotsPerLongEdge: 45,
      totalPoints: 1800,
      depthBias: 0.7,
      depthMul: 7.0,
      parallaxStrength: 70,
      opacity: 1.0,
    },
  },
  {
    id: "dots",
    labelEn: "Dots",
    labelZh: "圓點",
    emoji: "●",
    config: {
      shape: "circle",
      background: "black",
      sampling: "grid",
      dotsPerLongEdge: 45,
      totalPoints: 1800,
      depthBias: 0.7,
      depthMul: 7.0,
      parallaxStrength: 70,
      opacity: 1.0,
    },
  },
];

/** Look up a preset by id. Falls back to the first preset. */
export function getPreset(id: string): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}
