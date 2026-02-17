/**
 * Playback timing constants.
 *
 * Intentionally separated from data structures so the playback experience
 * can be tuned without touching types or stored data.
 */
export const PLAYBACK = {
  /** How long each frame is held at full opacity (ms). */
  holdMs: 0,
  /** Duration of the crossfade transition between consecutive frames (ms). */
  crossfadeMs: 500,
  /** Automatically start the i2v video after the color-in sequence finishes. */
  autoPlayVideo: true,
  /** Loop the i2v video when it ends. */
  loopVideo: false,
} as const;
