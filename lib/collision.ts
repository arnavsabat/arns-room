/**
 * COLLISION — which tiles can the avatar stand on?
 * Built once per room from object footprints. The avatar checks a small
 * radius around its feet so it can't clip into furniture edges.
 */

import type { RoomDef } from "@/data/rooms";

export function buildBlocked(room: RoomDef): Set<string> {
  const blocked = new Set<string>();
  for (const obj of room.objects) {
    if (obj.wall) continue; // wall objects don't occupy floor
    if (obj.solid === false) continue;
    const w = obj.footprint?.w ?? 1;
    const h = obj.footprint?.h ?? 1;
    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        blocked.add(`${obj.gx + dx},${obj.gy + dy}`);
      }
    }
  }
  return blocked;
}

/** Can a point (fractional grid coords) be stood on? */
export function canStand(
  room: RoomDef,
  blocked: Set<string>,
  gx: number,
  gy: number,
  radius = 0.3,
): boolean {
  // Check the four corners of the avatar's footprint circle.
  for (const [ox, oy] of [
    [-radius, 0],
    [radius, 0],
    [0, -radius],
    [0, radius],
  ] as const) {
    const px = gx + ox;
    const py = gy + oy;
    if (px < 0.2 || py < 0.2 || px > room.cols - 0.2 || py > room.rows - 0.2)
      return false;
    if (blocked.has(`${Math.floor(px)},${Math.floor(py)}`)) return false;
  }
  return true;
}
