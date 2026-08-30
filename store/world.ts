/**
 * WORLD STORE (Zustand) — the small set of global facts about the world:
 * which room we're in, which windows are open, whether we're mid-transition.
 *
 * NOTE ON THE AVATAR: its position updates every animation frame, so it does
 * NOT live in React state — that would re-render on every frame. Instead the
 * movement loop (components/world/AvatarController) writes transforms straight
 * to the DOM and shares its position via `avatarPos` below (a plain mutable
 * object). Only low-frequency facts (facing, nearby object) go through the
 * store.
 */

import { create } from "zustand";

export type OpenWindow = {
  /** id of a ContentPanel from data/content.ts */
  panelId: string;
  /** monotonically increasing — highest is focused/front */
  z: number;
};

type WorldState = {
  /** Loading screen finished and the world is visible. */
  booted: boolean;
  roomId: string;
  /** Non-null while fading between rooms: the room we're heading to. */
  transitionTo: { roomId: string; entry: { gx: number; gy: number } } | null;
  openWindows: OpenWindow[];
  /** Interactive object the avatar is standing next to (shows "press E"). */
  nearbyObjectId: string | null;
  /** Konami-code star shower active. */
  konami: boolean;
  /** Dev-only debug overlay. */
  debug: boolean;

  boot: () => void;
  openWindow: (panelId: string) => void;
  closeWindow: (panelId: string) => void;
  focusWindow: (panelId: string) => void;
  closeTopWindow: () => void;
  startTransition: (roomId: string, entry: { gx: number; gy: number }) => void;
  finishTransition: () => void;
  setNearby: (id: string | null) => void;
  setKonami: (on: boolean) => void;
  toggleDebug: () => void;
};

let zCounter = 10;

export const useWorld = create<WorldState>((set, get) => ({
  booted: false,
  roomId: "bedroom",
  transitionTo: null,
  openWindows: [],
  nearbyObjectId: null,
  konami: false,
  debug: false,

  boot: () => set({ booted: true }),

  openWindow: (panelId) =>
    set((s) => {
      const existing = s.openWindows.find((w) => w.panelId === panelId);
      if (existing) {
        // Already open — just bring it to front.
        return {
          openWindows: s.openWindows.map((w) =>
            w.panelId === panelId ? { ...w, z: ++zCounter } : w,
          ),
        };
      }
      return { openWindows: [...s.openWindows, { panelId, z: ++zCounter }] };
    }),

  closeWindow: (panelId) =>
    set((s) => ({
      openWindows: s.openWindows.filter((w) => w.panelId !== panelId),
    })),

  focusWindow: (panelId) =>
    set((s) => ({
      openWindows: s.openWindows.map((w) =>
        w.panelId === panelId ? { ...w, z: ++zCounter } : w,
      ),
    })),

  closeTopWindow: () => {
    const { openWindows, closeWindow } = get();
    if (!openWindows.length) return;
    const top = openWindows.reduce((a, b) => (a.z > b.z ? a : b));
    closeWindow(top.panelId);
  },

  startTransition: (roomId, entry) => set({ transitionTo: { roomId, entry } }),

  finishTransition: () => {
    const t = get().transitionTo;
    if (!t) return;
    avatarPos.gx = t.entry.gx;
    avatarPos.gy = t.entry.gy;
    set({ roomId: t.roomId, transitionTo: null, nearbyObjectId: null });
  },

  setNearby: (id) => {
    if (get().nearbyObjectId !== id) set({ nearbyObjectId: id });
  },

  setKonami: (on) => set({ konami: on }),
  toggleDebug: () => set((s) => ({ debug: !s.debug })),
}));

/**
 * High-frequency avatar position, shared by reference (see note at top).
 * Grid coordinates, updated by the movement loop every frame.
 */
export const avatarPos = { gx: 5, gy: 6 };
