"use client";

/**
 * AVATAR LAYER — the player character + owl familiar + movement engine.
 * ----------------------------------------------------------------------
 * A single requestAnimationFrame loop moves the avatar (grid coords with
 * collision), depth-sorts it against furniture, finds the nearest
 * interactive object (the "press E" prompt), and eases the pet along
 * behind. Positions are written straight to DOM transforms — React state
 * only changes for low-frequency things (facing, walk frame, prompt).
 *
 * The loop pauses (skips movement, keeps rendering) whenever `paused` is
 * true — e.g. while a window is open or a room transition is running.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { PlacedObject, RoomDef } from "@/data/rooms";
import { avatar as avatarSprites, pet as petSprites } from "@/data/sprites";
import { PixelSprite } from "@/lib/pixel";
import { TILE_H, SCREEN_DIRS, facingFromVector, toScreen, type Facing } from "@/lib/iso";
import { buildBlocked, canStand } from "@/lib/collision";
import { input, bindKeyboard } from "@/lib/input";
import { audio } from "@/lib/audio";
import { avatarPos, useWorld } from "@/store/world";
import { features, site } from "@/data/config";

const SPEED = 3.4; // tiles per second
const AVATAR_SCALE = 3; // matches the world's pixel unit (lib/rasterize PU)
const INTERACT_RANGE = 1.35; // tiles

/** Floor tile from which an object is interacted with (doors live on walls). */
function objectAnchor(obj: PlacedObject): { gx: number; gy: number } {
  if (obj.wall === "right") return { gx: obj.gx + 0.5, gy: 0.5 };
  if (obj.wall === "left") return { gx: 0.5, gy: obj.gy + 0.5 };
  const w = obj.footprint?.w ?? 1;
  const h = obj.footprint?.h ?? 1;
  return { gx: obj.gx + w / 2, gy: obj.gy + h / 2 };
}

function objectDistance(obj: PlacedObject, x: number, y: number): number {
  if (obj.wall === "right" || obj.wall === "left") {
    const anchor = objectAnchor(obj);
    return Math.hypot(anchor.gx - x, anchor.gy - y);
  }

  const w = obj.footprint?.w ?? 1;
  const h = obj.footprint?.h ?? 1;
  const x1 = obj.gx;
  const y1 = obj.gy;
  const x2 = obj.gx + w;
  const y2 = obj.gy + h;
  const nearestX = Math.min(Math.max(x, x1), x2);
  const nearestY = Math.min(Math.max(y, y1), y2);
  return Math.hypot(nearestX - x, nearestY - y);
}

type Props = {
  room: RoomDef;
  originX: number;
  originY: number;
  paused: boolean;
  onInteract: (obj: PlacedObject) => void;
};

export function AvatarLayer({ room, originX, originY, paused, onInteract }: Props) {
  const avatarRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<HTMLDivElement>(null);
  const [facing, setFacing] = useState<Facing>("front");
  const [moving, setMoving] = useState(false);
  const [frame, setFrame] = useState(0);
  const [petFrame, setPetFrame] = useState(0);
  const setNearby = useWorld((s) => s.setNearby);
  const reducedMotion = useReducedMotion();

  const blocked = useMemo(() => buildBlocked(room), [room]);
  const interactives = useMemo(
    () => room.objects.filter((o) => o.interaction),
    [room],
  );

  /* Refs so the RAF loop always sees fresh values without re-binding. */
  const pausedRef = useRef(paused);
  const roomRef = useRef(room);
  const nearbyRef = useRef<PlacedObject | null>(null);
  const onInteractRef = useRef(onInteract);
  useEffect(() => {
    pausedRef.current = paused;
    roomRef.current = room;
    onInteractRef.current = onInteract;
  }, [paused, room, onInteract]);

  /* Keyboard: bound once; disabled while paused. */
  useEffect(() => {
    const unbindKeys = bindKeyboard(() => !pausedRef.current);
    const unbindTap = input.onTap(() => {
      if (!pausedRef.current && nearbyRef.current)
        onInteractRef.current(nearbyRef.current);
    });
    return () => {
      unbindKeys();
      unbindTap();
    };
  }, []);

  /* The movement loop. */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let walkClock = 0;
    let stepClock = 0;
    const pet = { gx: avatarPos.gx - 1, gy: avatarPos.gy + 1 };

    const apply = () => {
      const a = toScreen(avatarPos.gx, avatarPos.gy);
      if (avatarRef.current) {
        avatarRef.current.style.transform = `translate3d(${a.x + originX}px, ${a.y + originY}px, 0)`;
        avatarRef.current.style.zIndex = String(
          Math.round((avatarPos.gx + avatarPos.gy) * 10) + 5,
        );
      }
      if (petRef.current) {
        const p = toScreen(pet.gx, pet.gy);
        petRef.current.style.transform = `translate3d(${p.x + originX}px, ${p.y + originY}px, 0)`;
        petRef.current.style.zIndex = String(Math.round((pet.gx + pet.gy) * 10) + 4);
      }
    };
    apply();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (pausedRef.current) {
        setMoving(false);
        return;
      }

      /* --- movement --- */
      let dgx = 0;
      let dgy = 0;
      for (const key of ["up", "down", "left", "right"] as const) {
        if (input.isHeld(key)) {
          dgx += SCREEN_DIRS[key].gx;
          dgy += SCREEN_DIRS[key].gy;
        }
      }
      const isMoving = dgx !== 0 || dgy !== 0;
      setMoving(isMoving);

      if (isMoving) {
        const len = Math.hypot(dgx, dgy);
        const step = (SPEED * dt) / len;
        const r = roomRef.current;
        // Try full move, then each axis (lets you slide along furniture).
        const nx = avatarPos.gx + dgx * step;
        const ny = avatarPos.gy + dgy * step;
        if (canStand(r, blocked, nx, ny)) {
          avatarPos.gx = nx;
          avatarPos.gy = ny;
        } else if (canStand(r, blocked, nx, avatarPos.gy)) {
          avatarPos.gx = nx;
        } else if (canStand(r, blocked, avatarPos.gx, ny)) {
          avatarPos.gy = ny;
        }
        setFacing(facingFromVector(dgx, dgy));

        walkClock += dt;
        setFrame(Math.floor(walkClock / 0.16) % 2);
        stepClock += dt;
        if (stepClock > 0.28) {
          stepClock = 0;
          audio.play("step");
        }
        apply();
      } else {
        setFrame(0);
      }

      /* --- pet follows, trailing one tile behind --- */
      if (features.pet) {
        const tx = avatarPos.gx - 0.9;
        const ty = avatarPos.gy + 0.9;
        const ease = reducedMotion ? 1 : Math.min(1, dt * 2.5);
        pet.gx += (tx - pet.gx) * ease;
        pet.gy += (ty - pet.gy) * ease;
        apply();
      }

      /* --- proximity prompt --- */
      let best: PlacedObject | null = null;
      let bestDist = INTERACT_RANGE;
      for (const obj of interactives) {
        const d = objectDistance(obj, avatarPos.gx, avatarPos.gy);
        if (d < bestDist) {
          best = obj;
          bestDist = d;
        }
      }
      nearbyRef.current = best;
      setNearby(best ? best.id : null);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [blocked, interactives, originX, originY, reducedMotion, setNearby]);

  /* Pet blink every few seconds. */
  useEffect(() => {
    if (!features.pet) return;
    const id = setInterval(() => {
      setPetFrame(1);
      setTimeout(() => setPetFrame(0), 180);
    }, 3600);
    return () => clearInterval(id);
  }, []);

  const facingKey = facing === "left" || facing === "right" ? "side" : facing;
  const grid = avatarSprites[facingKey]?.[moving ? frame : 0] ?? avatarSprites.front[0];

  return (
    <>
      {/* Avatar. Outer div is positioned by the loop; inner centers the feet. */}
      <div ref={avatarRef} className="absolute left-0 top-0 will-change-transform">
        <div
          className="relative"
          style={{
            transform: `translate(-50%, -100%) translateY(${TILE_H / 2}px)`,
          }}
        >
          <div style={{ animation: moving ? undefined : "breathe 2.8s ease-in-out infinite" }}>
            <PixelSprite
              grid={grid}
              scale={AVATAR_SCALE}
              flip={facing === "left"}
              label={`${site.name}'s avatar`}
            />
          </div>
          <SpeechBubble />
        </div>
      </div>

      {/* Owl familiar */}
      {features.pet && (
        <div ref={petRef} className="absolute left-0 top-0 will-change-transform" aria-hidden>
          <div
            className="relative"
            style={{ transform: `translate(-50%, -100%) translateY(${TILE_H / 2 - 14}px)` }}
          >
            <div style={{ animation: "breathe 2.2s ease-in-out infinite" }}>
              <PixelSprite grid={petSprites[petFrame]} scale={2} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------------------------------------------------- speech bubble
   Types out the tagline on first load. Click to skip; fades out after. */

function SpeechBubble() {
  const reducedMotion = useReducedMotion();
  const [chars, setChars] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const done = chars >= site.tagline.length;

  /* Type one character at a time; reduced motion jumps straight to the end. */
  useEffect(() => {
    if (done) return;
    const id = setTimeout(
      () => setChars((c) => (reducedMotion ? site.tagline.length : c + 1)),
      reducedMotion ? 0 : chars === 0 ? 900 : 48,
    );
    return () => clearTimeout(id);
  }, [chars, done, reducedMotion]);

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setDismissed(true), 6000);
    return () => clearTimeout(id);
  }, [done]);

  if (dismissed) return null;

  return (
    <button
      onClick={() => (done ? setDismissed(true) : setChars(site.tagline.length))}
      className="pixel-panel absolute bottom-full left-1/2 mb-3 w-max max-w-[220px] px-3 py-2 text-left text-sm"
      style={{ transform: "translateX(-50%)" }}
      aria-label={`${site.name} says: ${site.tagline}. Click to dismiss.`}
    >
      {site.tagline.slice(0, chars)}
      <span
        aria-hidden
        style={{ animation: "blink-caret 0.8s steps(1) infinite", color: "var(--lamp)" }}
      >
        ▌
      </span>
      {/* bubble tail */}
      <span
        aria-hidden
        className="absolute left-1/2 top-full -translate-x-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderTop: "8px solid var(--panel-wood)",
        }}
      />
    </button>
  );
}
