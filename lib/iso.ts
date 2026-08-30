/**
 * ISOMETRIC MATH
 * --------------
 * The room lives on a diamond grid. Grid coordinates (gx, gy) are in tiles;
 * screen coordinates are in "world pixels" (before the global world scale).
 *
 *   gx grows toward the lower-right edge of the diamond,
 *   gy grows toward the lower-left edge.
 *
 * One tile is TILE_W × TILE_H world px (classic 2:1 iso).
 */

export const TILE_W = 48;
export const TILE_H = 24;

/** Grid → world-pixel position of a tile's top (north) corner. */
export function toScreen(gx: number, gy: number): { x: number; y: number } {
  return {
    x: ((gx - gy) * TILE_W) / 2,
    y: ((gx + gy) * TILE_H) / 2,
  };
}

/** Depth used for z-sorting: things lower on screen draw in front. */
export function isoDepth(gx: number, gy: number): number {
  return gx + gy;
}

/**
 * Screen-relative input mapping: pressing "up" should move the avatar toward
 * the top of the screen, which on the iso grid is (-1, -1), etc. Vectors are
 * normalized by the caller.
 */
export const SCREEN_DIRS = {
  up: { gx: -1, gy: -1 },
  down: { gx: 1, gy: 1 },
  left: { gx: -1, gy: 1 },
  right: { gx: 1, gy: -1 },
} as const;

export type Facing = "front" | "back" | "left" | "right";

/** Pick a sprite facing from a movement vector (screen-space intuition). */
export function facingFromVector(dx: number, dy: number): Facing {
  // Convert grid delta to screen delta and pick the dominant axis.
  const sx = dx - dy;
  const sy = dx + dy;
  if (Math.abs(sx) > Math.abs(sy)) return sx > 0 ? "right" : "left";
  return sy > 0 ? "front" : "back";
}
