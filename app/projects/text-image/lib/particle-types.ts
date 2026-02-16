/**
 * Type definitions and configuration constants for the particle visualization.
 */

// ---------------------------------------------------------------------------
// Core data types
// ---------------------------------------------------------------------------

export interface Particle {
  x: number;
  y: number;
  depth: number;
  r: number;
  g: number;
  b: number;
  char: string;
  charZh: string;
  charIcon: string;
  label?: string;
  rotation: number;
}

export interface LabelMap {
  map: Uint16Array;
  labels: string[];
}

// ---------------------------------------------------------------------------
// Shape configuration
// ---------------------------------------------------------------------------

export type Shape =
  | "circle"
  | "x"
  | "rounded-square"
  | "hexagon"
  | "uppercase"
  | "mono-uppercase"
  | "lowercase"
  | "label"
  | "label-zh"
  | "label-icon";

export interface ShapeConfig {
  id: Shape;
  label: string;
  title: string;
  fontClass?: string;
  needsSegments?: boolean;
  /** Whether this shape renders text (needs textAlign/textBaseline setup) */
  isText: boolean;
  /** Whether this shape uses segmentation label data */
  isLabelBased: boolean;
  /** Which Particle field to read for the display character */
  charKey: "char" | "charZh" | "charIcon";
  /** Whether hover expands to full word (only "label" does this) */
  expandsOnHover: boolean;
}

export const SHAPES: ShapeConfig[] = [
  { id: "circle", label: "●", title: "Circle", isText: false, isLabelBased: false, charKey: "char", expandsOnHover: false },
  { id: "x", label: "✕", title: "X", isText: false, isLabelBased: false, charKey: "char", expandsOnHover: false },
  { id: "rounded-square", label: "□", title: "Rounded square", isText: false, isLabelBased: false, charKey: "char", expandsOnHover: false },
  { id: "hexagon", label: "◇", title: "Hexagon", isText: false, isLabelBased: false, charKey: "char", expandsOnHover: false },
  { id: "uppercase", label: "A", title: "Random uppercase (sans-serif)", fontClass: "font-sans font-bold", isText: true, isLabelBased: false, charKey: "char", expandsOnHover: false },
  { id: "mono-uppercase", label: "M", title: "Random uppercase (monospace)", fontClass: "font-mono font-bold", isText: true, isLabelBased: false, charKey: "char", expandsOnHover: false },
  { id: "lowercase", label: "a", title: "Random lowercase (serif)", fontClass: "font-serif font-bold italic", isText: true, isLabelBased: false, charKey: "char", expandsOnHover: false },
  { id: "label", label: "Seg", title: "Segmentation label (sans-serif)", fontClass: "font-sans font-bold", needsSegments: true, isText: true, isLabelBased: true, charKey: "char", expandsOnHover: true },
  { id: "label-zh", label: "文", title: "Segmentation label (Traditional Chinese)", needsSegments: true, isText: true, isLabelBased: true, charKey: "charZh", expandsOnHover: false },
  { id: "label-icon", label: "Ico", title: "Segmentation label (icons)", fontClass: "font-sans font-bold", needsSegments: true, isText: true, isLabelBased: true, charKey: "charIcon", expandsOnHover: false },
];

/** Look up a ShapeConfig by its id. */
export function getShapeConfig(id: Shape): ShapeConfig {
  return SHAPES.find((s) => s.id === id)!;
}

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------

export type Background = "black" | "white";

export const BACKGROUNDS: { id: Background; label: string }[] = [
  { id: "black", label: "Black" },
  { id: "white", label: "White" },
];

// ---------------------------------------------------------------------------
// Sampling
// ---------------------------------------------------------------------------

export type Sampling = "grid" | "depth-weighted";

export const SAMPLINGS: { id: Sampling; label: string }[] = [
  { id: "grid", label: "Grid" },
  { id: "depth-weighted", label: "Depth-weighted" },
];
