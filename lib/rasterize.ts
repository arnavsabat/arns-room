/**
 * PIXEL RASTERIZER — turns iso geometry into genuine chunky pixel art.
 * ---------------------------------------------------------------------
 * Everything in the world (walls, floor, furniture, wall art) is described
 * as simple primitives (quads, embedded sprites, rings) in world pixels,
 * then rasterized onto a coarse pixel grid (PU world px per art pixel) and
 * emitted as merged SVG rects. Diagonals come out stair-stepped — the
 * "Minecraft" pixel look — and every object shares the same global pixel
 * grid, so the whole scene reads as one cohesive piece of pixel art.
 *
 * `PU` is the single knob for chunkiness: bigger = chunkier pixels.
 */

import type { PixelGrid } from "@/lib/pixel";

/** World px per art pixel. One tile (48×24) = 16×8 art pixels. */
export const PU = 3;

export type Prim =
  /** Convex quad (box faces, floor tiles, grout lines) in world px. */
  | { kind: "quad"; pts: Array<[number, number]>; fill: string }
  /** Flat pixel-grid sprite (plushies, the amphora, the ball). */
  | { kind: "sprite"; grid: PixelGrid; scale: number; x: number; y: number }
  /** Pixel grid sheared onto a wall plane (windows, doors, gallery).
   *  slope: +0.5 right wall, -0.5 left wall. (x0,y0) = top-left of column 0. */
  | { kind: "wallSprite"; grid: PixelGrid; pu: number; x0: number; y0: number; slope: number }
  /** Ring outline (the basketball hoop). */
  | { kind: "ring"; cx: number; cy: number; rx: number; ry: number; thickness: number; fill: string };

export type RasterRect = { x: number; y: number; w: number; fill: string };

export type Raster = {
  rects: RasterRect[]; // in world px, each PU tall
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

/* ------------------------------------------------------------- sampling */

function inQuad(pts: Array<[number, number]>, x: number, y: number): boolean {
  // Convex polygon test: point must be on the same side of every edge.
  let sign = 0;
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % pts.length];
    const cross = (bx - ax) * (y - ay) - (by - ay) * (x - ax);
    if (cross === 0) continue;
    const s = cross > 0 ? 1 : -1;
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return true;
}

function sampleSprite(
  grid: PixelGrid,
  scale: number,
  ox: number,
  oy: number,
  x: number,
  y: number,
): string | null {
  const col = Math.floor((x - ox) / scale);
  const row = Math.floor((y - oy) / scale);
  if (row < 0 || row >= grid.rows.length) return null;
  const line = grid.rows[row];
  if (col < 0 || col >= line.length) return null;
  return grid.palette[line[col]] ?? null;
}

function samplePrim(p: Prim, x: number, y: number): string | null {
  switch (p.kind) {
    case "quad":
      return inQuad(p.pts, x, y) ? p.fill : null;
    case "sprite":
      return sampleSprite(p.grid, p.scale, p.x, p.y, x, y);
    case "wallSprite": {
      const i = Math.floor((x - p.x0) / p.pu);
      const row0 = grid0(p.grid);
      if (i < 0 || i >= row0) return null;
      // Stepped vertical shift per column — the iso wall shear, quantized
      // to whole art pixels so the edge staircases like real pixel art.
      const shift = Math.round(i * p.slope) * p.pu;
      const j = Math.floor((y - p.y0 - shift) / p.pu);
      if (j < 0 || j >= p.grid.rows.length) return null;
      return p.grid.palette[p.grid.rows[j][i]] ?? null;
    }
    case "ring": {
      const dx = (x - p.cx) / p.rx;
      const dy = (y - p.cy) / p.ry;
      const d = Math.sqrt(dx * dx + dy * dy);
      const t = p.thickness / Math.min(p.rx, p.ry);
      return d <= 1 && d >= 1 - t ? p.fill : null;
    }
  }
}

function grid0(g: PixelGrid): number {
  return g.rows[0]?.length ?? 0;
}

function primBBox(p: Prim): [number, number, number, number] {
  switch (p.kind) {
    case "quad": {
      const xs = p.pts.map((q) => q[0]);
      const ys = p.pts.map((q) => q[1]);
      return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    }
    case "sprite":
      return [p.x, p.y, p.x + grid0(p.grid) * p.scale, p.y + p.grid.rows.length * p.scale];
    case "wallSprite": {
      const w = grid0(p.grid) * p.pu;
      const shift = Math.abs(Math.round((grid0(p.grid) - 1) * p.slope)) * p.pu;
      return [p.x0, p.y0 - shift, p.x0 + w, p.y0 + p.grid.rows.length * p.pu + shift];
    }
    case "ring":
      return [p.cx - p.rx, p.cy - p.ry, p.cx + p.rx, p.cy + p.ry];
  }
}

/* ------------------------------------------------------------ rasterize */

export function rasterize(prims: Prim[], pu: number = PU): Raster {
  if (!prims.length) return { rects: [], minX: 0, minY: 0, maxX: 0, maxY: 0 };

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const boxes = prims.map((p) => {
    const b = primBBox(p);
    minX = Math.min(minX, b[0]);
    minY = Math.min(minY, b[1]);
    maxX = Math.max(maxX, b[2]);
    maxY = Math.max(maxY, b[3]);
    return b;
  });

  // Snap the origin to the global PU grid so every object's pixels align.
  minX = Math.floor(minX / pu) * pu;
  minY = Math.floor(minY / pu) * pu;
  const cols = Math.ceil((maxX - minX) / pu);
  const rows = Math.ceil((maxY - minY) / pu);

  const rects: RasterRect[] = [];
  for (let iy = 0; iy < rows; iy++) {
    const y = minY + (iy + 0.5) * pu;
    let runStart = -1;
    let runFill = "";
    const flush = (endIx: number) => {
      if (runStart < 0) return;
      rects.push({
        x: minX + runStart * pu,
        y: minY + iy * pu,
        w: (endIx - runStart) * pu,
        fill: runFill,
      });
      runStart = -1;
    };
    for (let ix = 0; ix < cols; ix++) {
      const x = minX + (ix + 0.5) * pu;
      // Topmost primitive wins (paint order = array order).
      let fill: string | null = null;
      for (let pi = prims.length - 1; pi >= 0; pi--) {
        const b = boxes[pi];
        if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue;
        fill = samplePrim(prims[pi], x, y);
        if (fill) break;
      }
      if (!fill) flush(ix);
      else if (fill !== runFill || runStart < 0) {
        flush(ix);
        runStart = ix;
        runFill = fill;
      }
    }
    flush(cols);
  }
  return { rects, minX, minY, maxX: minX + cols * pu, maxY: minY + rows * pu };
}
