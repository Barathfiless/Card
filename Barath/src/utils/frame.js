/** 120 Hz display baseline — animations stay consistent on high-refresh monitors */
export const FRAME_MS_120 = 1000 / 120;

/** Upper bound so tab backgrounding does not cause huge jumps */
export const MAX_FRAME_DELTA = 4;

/**
 * Frame delta normalized to a refresh-rate baseline (default 120 Hz).
 * At 120 Hz → ~1.0 per frame; at 60 Hz → ~2.0; at 200 Hz → ~0.6.
 */
export function getFrameDelta(now, lastTime, baselineMs = FRAME_MS_120) {
  return Math.min((now - lastTime) / baselineMs, MAX_FRAME_DELTA);
}

/** Framerate-independent exponential ease (0–1 lerp factor). */
export function expDecay(rate, delta) {
  return 1 - (1 - rate) ** delta;
}

/** Linear interpolation helper. */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}
