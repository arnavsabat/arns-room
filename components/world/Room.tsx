"use client";

/**
 * ROOM — renders one RoomDef from data/rooms.ts as a layered pixel-art
 * iso scene: walls + floor (rasterized to chunky pixels) → lamp-glow pools
 * → objects & avatar (z-sorted by iso depth) → door signs → hover labels.
 *
 * EVERYTHING visual goes through lib/rasterize.ts, so walls, floor,
 * furniture and wall art all share one global pixel grid — one cohesive
 * piece of pixel art, stepped diagonals included.
 *
 * Depth: objects sort by the iso depth of their FOOTPRINT CENTER
 * (gx + w/2 + gy + h/2). The avatar uses its feet position on the same
 * scale, so it walks in front of and behind furniture correctly.
 */

import React, { useMemo, useState } from "react";
import type { PlacedObject, RoomDef } from "@/data/rooms";
import { furniture } from "@/data/sprites";
import { TILE_H, TILE_W, toScreen } from "@/lib/iso";
import { buildBlocked } from "@/lib/collision";
import { rasterize, PU, type Prim, type Raster } from "@/lib/rasterize";
import { useWorld } from "@/store/world";
import { isoFurniture } from "./iso-furniture";

export const WALL_H = 116; // wall height in world px

/** Full world-px bounding box of a room (used by World to scale-to-fit). */
export function roomBounds(room: RoomDef) {
  const width = ((room.cols + room.rows) * TILE_W) / 2;
  const height = ((room.cols + room.rows) * TILE_H) / 2 + WALL_H + 40;
  const originX = (room.rows * TILE_W) / 2; // world-px x of grid (0,0)
  const originY = WALL_H; // world-px y of grid (0,0)
  return { width, height, originX, originY };
}

/** Rasterization is pure and deterministic — cache per sprite/placement so
 *  hover/proximity re-renders don't re-rasterize the whole room. */
const rasterCache = new Map<string, Raster>();
function cachedRaster(key: string, make: () => Prim[]): Raster {
  let r = rasterCache.get(key);
  if (!r) {
    r = rasterize(make());
    rasterCache.set(key, r);
  }
  return r;
}

/** Render a Raster as SVG rects (fills may be CSS vars). */
function RasterRects({ raster }: { raster: Raster }) {
  return (
    <>
      {raster.rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={PU} fill={r.fill} />
      ))}
    </>
  );
}

type RoomProps = {
  room: RoomDef;
  lampsOn: boolean;
  onInteract: (obj: PlacedObject) => void;
  children?: React.ReactNode;
};

export function Room({ room, lampsOn, onInteract, children }: RoomProps) {
  const { width, height, originX, originY } = roomBounds(room);
  const nearbyId = useWorld((s) => s.nearbyObjectId);
  const debug = useWorld((s) => s.debug);
  const blocked = useMemo(() => buildBlocked(room), [room]);
  /** ids currently playing a bounce/sparkle one-shot animation */
  const [fx, setFx] = useState<Record<string, "bounce" | "sparkle">>({});

  const pt = (gx: number, gy: number) => {
    const { x, y } = toScreen(gx, gy);
    return { x: x + originX, y: y + originY };
  };

  /* -------------------------------------------- room shell (pixelated) */
  const shell = useMemo(() => {
    const corner = pt(0, 0);
    const rightEnd = pt(room.cols, 0);
    const leftEnd = pt(0, room.rows);
    const bottom = pt(room.cols, room.rows);
    const q = (pts: Array<[number, number]>, fill: string): Prim => ({ kind: "quad", pts, fill });
    const prims: Prim[] = [
      // walls
      q([[corner.x, corner.y], [leftEnd.x, leftEnd.y], [leftEnd.x, leftEnd.y - WALL_H], [corner.x, corner.y - WALL_H]], "var(--wall)"),
      q([[corner.x, corner.y], [rightEnd.x, rightEnd.y], [rightEnd.x, rightEnd.y - WALL_H], [corner.x, corner.y - WALL_H]], "var(--wall-lit)"),
      // baseboards
      q([[corner.x, corner.y], [leftEnd.x, leftEnd.y], [leftEnd.x, leftEnd.y - 8], [corner.x, corner.y - 8]], "rgba(236,231,221,0.16)"),
      q([[corner.x, corner.y], [rightEnd.x, rightEnd.y], [rightEnd.x, rightEnd.y - 8], [corner.x, corner.y - 8]], "rgba(236,231,221,0.22)"),
    ];
    // floor tiles + grout seams
    for (let gx = 0; gx < room.cols; gx++) {
      for (let gy = 0; gy < room.rows; gy++) {
        const n = pt(gx, gy);
        const e = pt(gx + 1, gy);
        const s = pt(gx + 1, gy + 1);
        const w = pt(gx, gy + 1);
        const isBlocked = blocked.has(`${gx},${gy}`);
        const lighter = (gx * 5 + gy * 3) % 7 === 0;
        prims.push(
          q(
            [[n.x, n.y], [e.x, e.y], [s.x, s.y], [w.x, w.y]],
            debug && isBlocked
              ? "rgba(224,92,92,0.45)"
              : lighter
                ? "var(--floor-lit)"
                : "var(--floor)",
          ),
        );
        // grout: thin seams along the two lower edges of each tile
        prims.push(q([[e.x, e.y], [s.x, s.y], [s.x, s.y - 2.4], [e.x, e.y - 2.4]], "rgba(0,0,0,0.3)"));
        prims.push(q([[w.x, w.y], [s.x, s.y], [s.x, s.y - 2.4], [w.x, w.y - 2.4]], "rgba(0,0,0,0.3)"));
      }
    }
    // front skirt under the floor edge
    prims.push(q([[leftEnd.x, leftEnd.y], [bottom.x, bottom.y], [bottom.x, bottom.y + 10], [leftEnd.x, leftEnd.y + 10]], "var(--wall)"));
    prims.push(q([[rightEnd.x, rightEnd.y], [bottom.x, bottom.y], [bottom.x, bottom.y + 10], [rightEnd.x, rightEnd.y + 10]], "var(--wall)"));
    return rasterize(prims);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, blocked, debug]);

  /* ----------------------------------- wall-object geometry (shared) */
  const wallPlacement = (
    obj: PlacedObject,
  ): {
    grid: (typeof furniture)[string];
    pu: number;
    x0: number;
    y0: number;
    flatY: number;
    slope: number;
    xc: number;
    topY: number;
  } | null => {
    const grid = furniture[obj.sprite];
    if (!grid) return null;
    const pu = obj.scale ?? PU;
    const wArt = grid.rows[0]?.length ?? 0;
    const hArt = grid.rows.length;
    const lift = obj.lift ?? (obj.sprite === "door" ? 0 : 26);
    // baseY sits EXACTLY on the wall/floor seam so doors touch the floor.
    let xc: number, baseY: number, slope: number;
    if (obj.wall === "right") {
      xc = pt(obj.gx + 0.5, 0).x;
      baseY = originY + (xc - originX) * 0.5;
      slope = 0.5;
    } else {
      xc = pt(0, obj.gy + 0.5).x;
      baseY = originY + (originX - xc) * 0.5;
      slope = -0.5;
    }
    const x0 = xc - (wArt * pu) / 2;
    const shiftC = Math.round((wArt / 2) * slope) * pu;
    const y0 = baseY - lift - hArt * pu - shiftC;
    /** top-left y for FLAT (unsheared) rendering */
    const flatY = baseY - lift - hArt * pu;
    return { grid, pu, x0, y0, flatY, slope, xc, topY: y0 - Math.abs(shiftC) };
  };

  /* --------------------------------------------------- object rendering */
  const renderObject = (obj: PlacedObject) => {
    const interactive = !!obj.interaction;
    const isNear = nearbyId === obj.id;
    const fw = obj.footprint?.w ?? 1;
    const fh = obj.footprint?.h ?? 1;

    let raster: Raster;
    let anchor: { x: number; y: number };
    let zIndex: number;

    const iso = !obj.wall ? isoFurniture[obj.sprite] : undefined;
    if (iso) {
      raster = cachedRaster(obj.sprite, () => iso.prims());
      anchor = pt(obj.gx, obj.gy);
      // depth of the footprint center — sorts adjacent furniture correctly
      zIndex = Math.round((obj.gx + fw / 2 + obj.gy + fh / 2) * 10);
    } else if (obj.wall) {
      const placement = wallPlacement(obj);
      if (!placement) return null;
      const { grid, pu, x0, y0, flatY, slope, xc } = placement;
      raster = obj.flat
        ? // flat: faces the viewer (emblems/posters) — no wall shear
          cachedRaster(
            `${obj.sprite}|flat|${pu}|${xc}|${flatY}`,
            () => [
              {
                kind: "sprite",
                grid,
                scale: pu,
                x: xc - ((grid.rows[0]?.length ?? 0) * pu) / 2,
                y: flatY,
              },
            ],
          )
        : cachedRaster(
            `${obj.sprite}|${pu}|${x0}|${y0}|${slope}`,
            () => [{ kind: "wallSprite", grid, pu, x0, y0, slope }],
          );
      anchor = { x: 0, y: 0 }; // wall coords are already room-absolute
      zIndex = 1;
    } else {
      return null;
    }

    const w = raster.maxX - raster.minX;
    const h = raster.maxY - raster.minY;
    const left = anchor.x + raster.minX;
    const top = anchor.y + raster.minY;

    const fxAnim =
      fx[obj.id] === "bounce"
        ? "ball-bounce 0.9s ease-out"
        : fx[obj.id] === "sparkle"
          ? "sparkle-pop 0.9s ease-out"
          : undefined;

    const body = (
      <svg
        className="pixel obj-body"
        width={w}
        height={h}
        viewBox={`${raster.minX} ${raster.minY} ${w} ${h}`}
        shapeRendering="crispEdges"
        aria-hidden
      >
        <RasterRects raster={raster} />
      </svg>
    );

    const handle = () => {
      if (!obj.interaction) return;
      const t = obj.interaction.type;
      if (t === "bounce" || t === "sparkle") {
        setFx((f) => ({ ...f, [obj.id]: t }));
        setTimeout(
          () =>
            setFx((f) => {
              const next = { ...f };
              delete next[obj.id];
              return next;
            }),
          900,
        );
      }
      onInteract(obj);
    };

    return (
      <div
        key={obj.id}
        /* pointer-events-none: object boxes overlap their neighbors, so only
           the drawn pixels inside are clickable (see .obj-btn in globals). */
        className="pointer-events-none absolute"
        style={{ left, top, zIndex }}
      >
        {interactive ? (
          <button
            aria-label={obj.label}
            onClick={handle}
            data-near={isNear || undefined}
            className="obj-btn group relative block cursor-pointer border-0 bg-transparent p-0"
          >
            <div style={{ animation: fxAnim }}>{body}</div>
            {/* floating label (hover / proximity) — signed objects (doors)
                use their permanent sign instead, so nothing overlaps. */}
            {!obj.sign && (
              <span
                className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 text-[11px] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{
                  background: "var(--panel-bg)",
                  border: "2px solid var(--panel-wood)",
                  color: "var(--ink)",
                  opacity: isNear ? 1 : undefined,
                  animation: "float-label 2.4s ease-in-out infinite",
                }}
              >
                {obj.label}
                {isNear && (
                  <span style={{ color: "var(--arcane)" }} className="prompt-key">
                    {" "}
                    · E
                  </span>
                )}
              </span>
            )}
          </button>
        ) : (
          <div style={{ animation: fxAnim }}>{body}</div>
        )}
      </div>
    );
  };

  /* ------------------------------------- door signs (always visible)
     The sign IS the door's popup: when the avatar is near, it lights up
     teal and shows the interact key — nothing else appears on top of it. */
  const signs = room.objects
    .filter((o) => o.sign && o.wall)
    .map((o) => {
      const wp = wallPlacement(o);
      if (!wp) return null;
      const isNear = nearbyId === o.id;
      return (
        <div
          key={`sign-${o.id}`}
          aria-hidden
          className="pointer-events-none absolute px-1.5 py-0.5 text-center text-[8px] tracking-widest transition-colors duration-200"
          style={{
            left: wp.xc,
            top: wp.topY - 24 + (o.signOffset ?? 0),
            transform: "translateX(-50%)",
            zIndex: 3,
            fontFamily: "var(--font-press-start)",
            color: isNear ? "var(--arcane)" : "var(--lamp)",
            background: "var(--panel-bg)",
            border: `2px solid ${isNear ? "var(--arcane)" : "var(--panel-wood)"}`,
            boxShadow: "0 2px 0 rgba(0,0,0,0.35)",
          }}
        >
          {o.sign}
          {isNear && <span className="prompt-key"> · E</span>}
        </div>
      );
    });

  /* ------------------------------------------------------ lamp glow pools */
  const glows = room.objects
    .filter((o) => o.glow)
    .map((o) => {
      const c = pt(o.gx + 0.5, o.gy + 0.5);
      const size = 300;
      return (
        <div
          key={`glow-${o.id}`}
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            left: c.x - size / 2,
            top: c.y - size / 2 - 30,
            width: size,
            height: size,
            zIndex: 2,
            opacity: lampsOn ? 1 : 0,
            transition: "opacity 1.5s linear",
            background:
              "radial-gradient(circle, var(--lamp-soft) 0%, rgba(255,180,84,0.06) 45%, transparent 70%)",
            animation: lampsOn ? "lamp-flicker 6s steps(1) infinite" : undefined,
          }}
        />
      );
    });

  return (
    <div className="relative" style={{ width, height }}>
      {/* walls + floor, pixelated */}
      <svg
        className="pixel absolute"
        style={{ left: shell.minX, top: shell.minY }}
        width={shell.maxX - shell.minX}
        height={shell.maxY - shell.minY}
        viewBox={`${shell.minX} ${shell.minY} ${shell.maxX - shell.minX} ${shell.maxY - shell.minY}`}
        aria-hidden
        shapeRendering="crispEdges"
      >
        <RasterRects raster={shell} />
      </svg>

      {glows}
      {room.objects.map(renderObject)}
      {signs}
      {children}

      {/* debug: tile coordinates */}
      {debug &&
        Array.from({ length: room.cols * room.rows }, (_, i) => {
          const gx = i % room.cols;
          const gy = Math.floor(i / room.cols);
          const c = pt(gx + 0.5, gy + 0.5);
          return (
            <span
              key={i}
              className="pointer-events-none absolute text-[8px]"
              style={{ left: c.x - 8, top: c.y - 5, zIndex: 999, color: "var(--arcane)" }}
            >
              {gx},{gy}
            </span>
          );
        })}
    </div>
  );
}
