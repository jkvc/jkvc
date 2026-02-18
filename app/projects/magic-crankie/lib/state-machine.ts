export interface CrankieState {
  id: string;
  color: string;
}

export interface CrankieTransition {
  from: string;
  to: string;
  key: string;
}

export const STATES: CrankieState[] = [
  { id: "A", color: "#E87461" },
  { id: "B", color: "#5B8CDB" },
  { id: "C", color: "#4ECDC4" },
  { id: "D", color: "#9B72CF" },
];

export const STATE_MAP = new Map(STATES.map((s) => [s.id, s]));

export const STATE_WIDTH = 768;
export const STATE_HEIGHT = 768;
export const TRANSITION_WIDTH = 384;
export const VIEWPORT_WIDTH = 480;

export function getStateColor(stateId: string): string {
  return STATE_MAP.get(stateId)?.color ?? "#888";
}

export function getTransitionBackground(from: string, to: string): string {
  const fromColor = getStateColor(from);
  const toColor = getStateColor(to);
  return `linear-gradient(to right, ${fromColor}, ${toColor})`;
}

export function getNextCycleState(currentId: string): string {
  const idx = STATES.findIndex((s) => s.id === currentId);
  return STATES[(idx + 1) % STATES.length].id;
}

export type SegmentType = "state" | "transition";

export interface Segment {
  id: number;
  type: SegmentType;
  width: number;
  stateId?: string;
  from?: string;
  to?: string;
  label: string;
  background: string;
}

let segmentCounter = 0;

export function createStateSegment(stateId: string): Segment {
  const color = getStateColor(stateId);
  return {
    id: segmentCounter++,
    type: "state",
    width: STATE_WIDTH,
    stateId,
    label: stateId,
    background: color,
  };
}

export function createTransitionSegment(from: string, to: string): Segment {
  return {
    id: segmentCounter++,
    type: "transition",
    width: TRANSITION_WIDTH,
    from,
    to,
    label: `${from}→${to}`,
    background: getTransitionBackground(from, to),
  };
}
