/**
 * PIXEL SPRITE RENDERER
 * ---------------------
 * All art in this project is defined as tiny text grids (see data/sprites.tsx)
 * and rendered to crisp SVG. Each character in a row maps to a palette color;
 * "." or " " means transparent. This keeps every sprite editable in a text
 * editor — change a letter, change a pixel — and scales perfectly with no
 * blur at any size (shape-rendering: crispEdges + integer coordinates).
 *
 * When real PNG sprite atlases are ready, swap PixelSprite's internals for an
 * <img>/atlas lookup — the call sites won't change.
 */

import React from "react";

export type PixelGrid = {
  /** Map of grid character → CSS color. Use palette token vars where possible. */
  palette: Record<string, string>;
  /** Rows of the sprite, top to bottom. All rows should be the same length. */
  rows: string[];
};

export function gridSize(grid?: PixelGrid | null): { w: number; h: number } {
  if (!grid) return { w: 0, h: 0 };
  return { w: grid.rows[0]?.length ?? 0, h: grid.rows.length };
}

/**
 * Convert a grid into SVG <rect>s, merging horizontal runs of the same color
 * so a 24×24 sprite is ~40 rects instead of ~576 (keeps the DOM cheap).
 */
function gridToRects(grid: PixelGrid): React.ReactNode[] {
  const rects: React.ReactNode[] = [];
  grid.rows.forEach((row, y) => {
    let runStart = -1;
    let runChar = "";
    const flush = (endX: number) => {
      if (runStart < 0) return;
      const color = grid.palette[runChar];
      if (color) {
        rects.push(
          <rect
            key={`${runStart},${y}`}
            x={runStart}
            y={y}
            width={endX - runStart}
            height={1}
            fill={color}
          />,
        );
      }
      runStart = -1;
    };
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const transparent = ch === "." || ch === " ";
      if (transparent) {
        flush(x);
      } else if (ch !== runChar || runStart < 0) {
        flush(x);
        runStart = x;
        runChar = ch;
      }
    }
    flush(row.length);
  });
  return rects;
}

/**
 * Render a grid as a plain SVG <g> so it can be embedded inside a larger
 * scene (e.g. a plushie sitting on an isometric bed). (x, y) is the TOP-LEFT
 * of the sprite in the parent SVG's coordinate space.
 */
export function PixelGroup({
  grid,
  scale = 1,
  x = 0,
  y = 0,
}: {
  grid: PixelGrid;
  scale?: number;
  x?: number;
  y?: number;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>{gridToRects(grid)}</g>
  );
}

type PixelSpriteProps = {
  grid: PixelGrid;
  /** On-screen size of one sprite pixel, in world px. Default 1. */
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Accessible name. Omit for purely decorative sprites (adds aria-hidden). */
  label?: string;
  /** Mirror horizontally (e.g. side-facing walk sprites). */
  flip?: boolean;
};

export const PixelSprite = React.memo(function PixelSprite({
  grid,
  scale = 1,
  className,
  style,
  label,
  flip,
}: PixelSpriteProps) {
  if (!grid) return null;
  const { w, h } = gridSize(grid);
  return (
    <svg
      className={`pixel ${className ?? ""}`}
      viewBox={`0 0 ${w} ${h}`}
      width={w * scale}
      height={h * scale}
      shapeRendering="crispEdges"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{
        display: "block",
        ...(flip ? { transform: "scaleX(-1)" } : null),
        ...style,
      }}
    >
      {gridToRects(grid)}
    </svg>
  );
});
