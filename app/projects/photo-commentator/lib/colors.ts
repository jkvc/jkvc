/** Per-box stroke / index-label color rotation. Shared by the on-canvas
 *  debug overlay and the image sent to the LLM, so the user can correlate
 *  what they see with what the model sees. */
export const BOX_PALETTE = [
  "#FF4D5E", // red
  "#FFB23B", // orange
  "#FFE34A", // yellow
  "#2EDC5A", // green
  "#3DB7FF", // blue
  "#A57AFF", // purple
];

export function colorForBoxIndex(i: number): string {
  const len = BOX_PALETTE.length;
  return BOX_PALETTE[((i % len) + len) % len];
}
