/**
 * ISOMETRIC FURNITURE — every floor object, as pixel-art iso volumes.
 * ---------------------------------------------------------------------
 * A piece is composed from `box()` calls (top + two visible faces,
 * auto-shaded from one base color) plus detail quads. The primitives are
 * rasterized to chunky pixels by lib/rasterize.ts, so all diagonals
 * stair-step and every piece sits on the same global pixel grid — one
 * cohesive pixel-art scene, dylan-li style.
 *
 * Coordinate space inside a piece: tile units relative to the object's
 * anchor tile's NORTH corner; heights in world px.
 *
 * To add furniture: write a piece function returning Prim[], register it
 * with its max height, reference its key from data/rooms.ts. Heights:
 * beds ~26, desks ~34, wardrobes/shelves ~80–90 (walls are 116).
 */

import { TILE_H, TILE_W } from "@/lib/iso";
import type { Prim } from "@/lib/rasterize";
import { furniture as gridSprites } from "@/data/sprites";

const HW = TILE_W / 2; // 24
const HH = TILE_H / 2; // 12

/** Project tile-space (a, b) at height `up` to world px. */
const P = (a: number, b: number, up = 0): [number, number] => [
  (a - b) * HW,
  (a + b) * HH - up,
];

/** Multiply a hex color's brightness (0.6 = 40% darker). */
function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.min(255, Math.round(v * f));
  return `#${[ch(n >> 16), ch((n >> 8) & 255), ch(n & 255)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** An iso box: footprint (x,y,w,h) in tiles, `ht` tall, sitting at height z. */
function box(
  x: number,
  y: number,
  w: number,
  h: number,
  ht: number,
  z: number,
  base: string,
  opts: { topColor?: string } = {},
): Prim[] {
  const t = z + ht;
  return [
    // south-west face (lower-left)
    { kind: "quad", pts: [P(x, y + h, t), P(x + w, y + h, t), P(x + w, y + h, z), P(x, y + h, z)], fill: shade(base, 0.72) },
    // south-east face (lower-right)
    { kind: "quad", pts: [P(x + w, y + h, t), P(x + w, y, t), P(x + w, y, z), P(x + w, y + h, z)], fill: shade(base, 0.55) },
    // top
    { kind: "quad", pts: [P(x, y, t), P(x + w, y, t), P(x + w, y + h, t), P(x, y + h, t)], fill: opts.topColor ?? base },
  ];
}

/** Flat diamond on a horizontal plane at height `up`. */
function flat(x: number, y: number, w: number, h: number, up: number, fill: string): Prim {
  return {
    kind: "quad",
    pts: [P(x, y, up), P(x + w, y, up), P(x + w, y + h, up), P(x, y + h, up)],
    fill,
  };
}

/** Vertical quad on the plane through tile points (ax,ay)→(bx,by). */
function vquad(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  v0: number,
  v1: number,
  fill: string,
): Prim {
  return {
    kind: "quad",
    pts: [P(ax, ay, v1), P(bx, by, v1), P(bx, by, v0), P(ax, ay, v0)],
    fill,
  };
}

/* ---------------------------------------------------------------- palette */

const C = {
  white: "#d9d6cf", // "white" furniture, dimmed for the night room
  woodWarm: "#a3867a", // wardrobe / door pink-brown
  woodDark: "#5c4636",
  dark: "#23202e",
  blanket: "#5a86c8",
  blanketAlt: "#7aa2d8",
  screen: "#8fd3ff",
  amber: "#ffb454",
  amberPale: "#ffd9a0",
  plum: "#7a4a63",
  orange: "#ef8b3f",
  books: ["#e05c5c", "#5a8dee", "#ffb454", "#4fd6c9", "#9a7bd8", "#6dbb6d"],
};

type Piece = () => Prim[];

/* ================================================================ pieces */

/** Bed (2×3): white frame, checkered blanket, pillows, plushies. */
const bed: Piece = () => {
  const parts: Prim[] = [
    ...box(0, 0, 2, 3, 10, 0, C.white),
    ...box(0.08, 0.08, 1.84, 2.84, 8, 10, shade(C.white, 1.06)),
    // headboard against the right wall (north-east end)
    ...box(0, 0, 2, 0.18, 30, 0, shade(C.white, 0.92)),
    // blanket over the lower two-thirds
    ...box(0.04, 1.0, 1.92, 1.9, 7, 15, C.blanket),
  ];
  const cell = 0.48;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if ((i + j) % 2 === 0) continue;
      parts.push(flat(0.04 + i * cell, 1.0 + j * cell * 0.99, cell, cell * 0.99, 22, C.blanketAlt));
    }
  }
  // pillows
  parts.push(...box(0.18, 0.28, 0.68, 0.5, 7, 18, shade(C.white, 1.12)));
  parts.push(...box(1.12, 0.28, 0.68, 0.5, 7, 18, shade(C.white, 1.12)));
  return parts;
};

/** Nightstand (1×1) with a little amber lamp. */
const nightstand: Piece = () => [
  ...box(0.15, 0.15, 0.7, 0.7, 22, 0, C.white),
  vquad(0.15, 0.85, 0.85, 0.85, 10, 16, shade(C.white, 0.6)),
  ...box(0.46, 0.44, 0.1, 0.1, 12, 22, C.woodDark),
  ...box(0.34, 0.32, 0.34, 0.34, 10, 34, C.amber, { topColor: C.amberPale }),
];

/** Desk (2×1): white slab, monitor facing the viewer, keyboard. */
const desk: Piece = () => [
  ...box(0.06, 0.12, 0.1, 0.78, 28, 0, shade(C.white, 0.94)),
  ...box(1.84, 0.12, 0.1, 0.78, 28, 0, shade(C.white, 0.94)),
  ...box(0, 0, 2, 1, 5, 28, C.white),
  // monitor: dark slab, glowing screen on the viewer-facing side
  ...box(0.55, 0.22, 0.95, 0.1, 26, 40, C.dark),
  vquad(0.63, 0.34, 1.42, 0.34, 45, 62, C.screen),
  ...box(0.94, 0.24, 0.16, 0.1, 7, 33, C.dark),
  // keyboard
  ...box(0.7, 0.55, 0.68, 0.26, 2.5, 33, shade(C.white, 0.85)),
];

/** Desk chair (1×1) — backrest toward the viewer (it faces the desk). */
const chair: Piece = () => [
  ...box(0.4, 0.4, 0.2, 0.2, 12, 0, "#4a4658"),
  ...box(0.16, 0.16, 0.68, 0.68, 7, 12, "#3a3648"),
  ...box(0.22, 0.72, 0.56, 0.1, 20, 19, "#3a3648"),
];

/** Wardrobe (1×2), warm wood, two doors. */
const wardrobe: Piece = () => [
  ...box(0, 0, 1, 2, 86, 0, C.woodWarm),
  ...box(-0.03, -0.03, 1.06, 2.06, 4, 86, C.woodWarm),
  vquad(1, 0.98, 1, 1.04, 2, 82, shade(C.woodWarm, 0.5)),
  vquad(1, 0.86, 1, 0.94, 40, 46, shade(C.woodWarm, 0.45)),
  vquad(1, 1.08, 1, 1.16, 40, 46, shade(C.woodWarm, 0.45)),
];

/** Bookshelf factory: `front` = which face shows the books. */
function shelfPiece(front: "sw" | "se"): Piece {
  return () => {
    const parts: Prim[] = [...box(0, 0, 1, 1, 78, 0, C.woodDark)];
    // face endpoints: sw face runs W(0,1)→S(1,1); se runs S(1,1)→E(1,0)
    const [ax, ay, bx, by] = front === "sw" ? [0, 1, 1, 1] : [1, 1, 1, 0];
    const seg = (u: number) => [ax + (bx - ax) * u, ay + (by - ay) * u] as const;
    const [ix0, iy0] = seg(0.06);
    const [ix1, iy1] = seg(0.94);
    parts.push(vquad(ix0, iy0, ix1, iy1, 6, 74, shade(C.woodDark, 0.55)));
    [12, 34, 56].forEach((v, row) => {
      let u = 0.08;
      let i = 0;
      while (u < 0.88) {
        const bw = 0.09 + ((row * 3 + i) % 3) * 0.025;
        const [b0x, b0y] = seg(u);
        const [b1x, b1y] = seg(Math.min(0.92, u + bw));
        const h = 14 + ((i + row) % 3) * 2;
        parts.push(vquad(b0x, b0y, b1x, b1y, v, v + h, C.books[(i + row * 2) % C.books.length]));
        u += bw + 0.015;
        i++;
      }
      const [s0x, s0y] = seg(0.04);
      const [s1x, s1y] = seg(0.96);
      parts.push(vquad(s0x, s0y, s1x, s1y, v - 3, v, shade(C.woodDark, 1.35)));
    });
    return parts;
  };
}

/** Easel (1×1) with a canvas-in-progress. */
const easel: Piece = () => [
  ...box(0.12, 0.62, 0.08, 0.08, 56, 0, C.woodDark),
  ...box(0.78, 0.62, 0.08, 0.08, 56, 0, C.woodDark),
  ...box(0.45, 0.14, 0.08, 0.08, 52, 0, C.woodDark),
  ...box(0.06, 0.55, 0.9, 0.14, 4, 26, C.woodDark),
  ...box(0.1, 0.52, 0.84, 0.06, 34, 30, C.white, { topColor: shade(C.white, 0.9) }),
  vquad(0.2, 0.62, 0.45, 0.62, 40, 56, "#4fd6c9"),
  vquad(0.5, 0.62, 0.72, 0.62, 36, 50, "#9a7bd8"),
  vquad(0.32, 0.62, 0.6, 0.62, 34, 39, C.amber),
];

/** Paint table (1×1). */
const paints: Piece = () => [
  ...box(0.05, 0.1, 0.9, 0.8, 20, 0, C.white),
  flat(0.2, 0.3, 0.18, 0.18, 22, "#e05c5c"),
  flat(0.45, 0.25, 0.18, 0.18, 22, "#5a8dee"),
  flat(0.62, 0.5, 0.18, 0.18, 22, "#4fd6c9"),
  flat(0.3, 0.58, 0.18, 0.18, 22, "#9a7bd8"),
];

/** Comic longbox (1×1): open box with spines showing. */
const comicbox: Piece = () => {
  const parts: Prim[] = [
    ...box(0.08, 0.14, 0.84, 0.72, 17, 0, shade(C.white, 0.85)),
    flat(0.14, 0.2, 0.72, 0.6, 17.5, shade(C.dark, 0.8)),
  ];
  for (let i = 0; i < 6; i++) {
    parts.push(flat(0.17 + i * 0.11, 0.24, 0.09, 0.5, 18.5, C.books[i % C.books.length]));
  }
  parts.push(vquad(0.08, 0.86, 0.92, 0.86, 6, 11, "#e05c5c"));
  return parts;
};

/** Sports corner (1×2): mini hoop + duffel bag. */
const hoopset: Piece = () => {
  const ringAt = P(0.52, 0.75);
  return [
    ...box(0.12, 1.15, 0.76, 0.62, 15, 0, C.dark),
    vquad(0.12, 1.42, 0.88, 1.42, 2, 15, "#c0392b"),
    flat(0.12, 1.4, 0.76, 0.1, 15, "#c0392b"),
    ...box(0.46, 0.42, 0.1, 0.1, 58, 0, shade(C.dark, 1.4)),
    ...box(0.3, 0.36, 0.42, 0.06, 2, 58, C.white),
    ...box(0.22, 0.3, 0.6, 0.08, 24, 60, C.white),
    { kind: "ring", cx: ringAt[0], cy: ringAt[1] - 62, rx: 10, ry: 5.5, thickness: 3, fill: C.orange },
  ];
};

/** Floor lamp (1×1) — the glow pool itself comes from the room renderer. */
const lamp: Piece = () => [
  ...box(0.32, 0.32, 0.36, 0.36, 4, 0, C.dark),
  ...box(0.46, 0.46, 0.09, 0.09, 58, 4, shade(C.dark, 1.4)),
  ...box(0.3, 0.3, 0.42, 0.42, 14, 60, C.amber, { topColor: C.amberPale }),
];

/** Reading armchair (1×1), plum. */
const armchair: Piece = () => [
  ...box(0.08, 0.08, 0.84, 0.84, 15, 0, C.plum),
  ...box(0.08, 0.02, 0.84, 0.16, 34, 12, shade(C.plum, 0.92)),
  ...box(0.02, 0.1, 0.12, 0.8, 25, 0, shade(C.plum, 0.85)),
  ...box(0.86, 0.1, 0.12, 0.8, 25, 0, shade(C.plum, 0.85)),
  flat(0.2, 0.24, 0.6, 0.6, 15.5, shade(C.plum, 1.18)),
];

/** Letter desk (2×1) with envelopes waiting. */
const letterdesk: Piece = () => [
  ...box(0.06, 0.12, 0.1, 0.78, 24, 0, shade(C.woodWarm, 0.9)),
  ...box(1.84, 0.12, 0.1, 0.78, 24, 0, shade(C.woodWarm, 0.9)),
  ...box(0, 0, 2, 1, 5, 24, C.woodWarm),
  flat(0.35, 0.3, 0.4, 0.28, 29.5, shade(C.white, 1.05)),
  flat(0.5, 0.42, 0.4, 0.28, 30, shade(C.white, 0.92)),
  flat(0.82, 0.5, 0.09, 0.09, 30.5, "#e05c5c"),
  ...box(1.4, 0.4, 0.34, 0.07, 2, 29, C.dark),
];

/** The humming amphora (pixel sprite — organic shape). */
const amphora: Piece = () => {
  const at = P(0.5, 0.5);
  return [{ kind: "sprite", grid: gridSprites.artifact, scale: 3, x: at[0] - 15, y: at[1] - 33 }];
};

/** Kickable soccer ball. */
const soccerBall: Piece = () => {
  const at = P(0.5, 0.5);
  return [{ kind: "sprite", grid: gridSprites.ball, scale: 3, x: at[0] - 12, y: at[1] - 24 }];
};

/* ============================================================== registry
   `h` = how tall the piece reaches (px) — sizes its SVG/hit box snugly. */

export const isoFurniture: Record<string, { h: number; prims: Piece }> = {
  bed: { h: 60, prims: bed },
  nightstand: { h: 48, prims: nightstand },
  desk: { h: 66, prims: desk },
  chair: { h: 48, prims: chair },
  wardrobe: { h: 94, prims: wardrobe },
  "bookshelf-right": { h: 82, prims: shelfPiece("sw") }, // against the RIGHT wall
  "bookshelf-left": { h: 82, prims: shelfPiece("se") }, // against the LEFT wall
  easel: { h: 68, prims: easel },
  paints: { h: 26, prims: paints },
  comicbox: { h: 24, prims: comicbox },
  hoopset: { h: 88, prims: hoopset },
  lamp: { h: 78, prims: lamp },
  armchair: { h: 50, prims: armchair },
  letterdesk: { h: 34, prims: letterdesk },
  amphora: { h: 34, prims: amphora },
  ball: { h: 24, prims: soccerBall },
};
