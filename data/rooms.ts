/**
 * ROOM REGISTRY — the entire world layout, as data.
 * --------------------------------------------------
 * Just here to change TEXT? Every object's `label:` (hover name) and
 * `sign:` (door plaque) live right after `sprite:` on each line, before
 * the position/layout properties. For the longer text inside windows —
 * About, Projects, Writing, etc. — see data/content.ts instead. Full
 * map: README.md § "Editing all visible text".
 *
 * A room is a diamond floor of `cols × rows` tiles plus a list of placed
 * objects. Adding a room = adding an entry here (see EXTENDING.md for a
 * copy-paste recipe). Nothing else in the codebase needs to change.
 *
 * Coordinates: gx runs toward the lower-RIGHT edge of the floor diamond,
 * gy toward the lower-LEFT. (0,0) is the back corner where the walls meet.
 * The LEFT wall stands along gx=0; the RIGHT wall along gy=0.
 * Turn on the dev debug overlay (` key) to see the grid while placing things.
 *
 * Layout principle (dylan-li style): furniture backs onto the two walls,
 * one clear cluster per interest, generous open floor in the middle.
 * Floor sprites are isometric pieces from components/world/iso-furniture.tsx;
 * wall sprites are pixel grids from data/sprites.tsx.
 */

export type Interaction =
  /** Opens a retro window with a panel from data/content.ts */
  | { type: "window"; panelId: string }
  /** Walks you to another room. `entry` = tile you appear on. */
  | { type: "door"; to: string; entry: { gx: number; gy: number } }
  /** Playful bounce + toast message (the soccer ball). */
  | { type: "bounce"; message: string }
  /** Sparkle + opens a panel (the mythic artifact). */
  | { type: "sparkle"; panelId: string };

export type PlacedObject = {
  id: string;
  /** Key into isoFurniture (floor pieces) or sprites.furniture (wall art). */
  sprite: string;
  /** Accessible name + hover label. */
  label: string;
  gx: number;
  gy: number;
  /** Tiles occupied (collision + depth). Default 1×1. Ignored for wall objects. */
  footprint?: { w: number; h: number };
  /** If set, the object hangs on a wall above the given tile instead of
   *  standing on the floor: 'left' wall uses gy=this.gy at gx=0,
   *  'right' wall uses gx=this.gx at gy=0. */
  wall?: "left" | "right";
  /** Sprite pixel scale — wall sprites only. Default 2. */
  scale?: number;
  /** Blocks walking. Default true for floor objects, false for wall objects. */
  solid?: boolean;
  interaction?: Interaction;
  /** Emits a warm pool of lamp light (only when the lamp is on — see time). */
  glow?: boolean;
  /** Always-visible sign above the object (doors: where they lead). */
  sign?: string;
  /** Nudge the sign plaque down (+) or up (-) in px, independent of the
   *  door's own height — use this so signs on different walls/positions
   *  line up visually, without moving the door itself. */
  signOffset?: number;
  /** Wall objects: px above the wall/floor seam (doors 0, décor 26). */
  lift?: number;
  /** Wall objects: render flat (facing the viewer) instead of sheared onto
   *  the wall plane — right for emblems/posters with fine detail. */
  flat?: boolean;
};

export type RoomDef = {
  id: string;
  name: string;
  cols: number;
  rows: number;
  /** Where the avatar stands on first load of this room. */
  spawn: { gx: number; gy: number };
  objects: PlacedObject[];
};

export const rooms: Record<string, RoomDef> = {
  /* ============================================================ BEDROOM
     Right wall, left→right: crest above bed · bed · STUDIO door · desk ·
     bookshelf. Left wall: window · CONTACT door. Floor: chair at the desk,
     comic box, ball, sports corner (decorative). */
  bedroom: {
    id: "bedroom",
    name: "The Bedroom",
    cols: 9,
    rows: 7,
    spawn: { gx: 4, gy: 3 },
    objects: [
      // --- left wall (gx = 0) ---
      { id: "window", sprite: "window", label: "Window to the night", gx: 0, gy: 1, wall: "left", scale: 3 },
      { id: "door-contact", sprite: "door", label: "Door — Contact Nook", gx: 0, gy: 5, wall: "left", scale: 3, sign: "CONTACT", interaction: { type: "door", to: "contact", entry: { gx: 1, gy: 1 } } },
      // --- right wall (gy = 0) ---
      { id: "crest", sprite: "crest", label: "FC Barcelona crest", gx: 1, gy: 0, wall: "right", scale: 3, lift: 33 },
      { id: "bed", sprite: "bed", label: "Bed — About me", gx: 0, gy: 0, footprint: { w: 2, h: 3 }, interaction: { type: "window", panelId: "about" } },
      { id: "door-studio", sprite: "door", label: "Door — Studio", gx: 4, gy: 0, wall: "right", scale: 3, sign: "STUDIO", signOffset: 36, interaction: { type: "door", to: "studio", entry: { gx: 1, gy: 1 } } },
      // (gx 5 stays clear so the door isn't hidden behind the desk)
      { id: "desk", sprite: "desk", label: "Computer — Projects", gx: 6, gy: 0, footprint: { w: 2, h: 1 }, interaction: { type: "window", panelId: "projects" } },
      { id: "bookshelf", sprite: "bookshelf-right", label: "Bookshelf — Writing & Fiction", gx: 8, gy: 0, interaction: { type: "window", panelId: "writing" } },
      // --- floor ---
      { id: "chair", sprite: "chair", label: "Desk chair", gx: 6, gy: 1 },
      { id: "comicbox", sprite: "comicbox", label: "Comic longbox", gx: 4, gy: 4, interaction: { type: "window", panelId: "comics" } },
      { id: "ball", sprite: "ball", label: "Soccer ball (kick me)", gx: 6, gy: 4, solid: false, interaction: { type: "bounce", message: "GOOOAL! (crowd noises)" } },
      { id: "hoopset", sprite: "hoopset", label: "Mini hoop and gym bag", gx: 8, gy: 4, footprint: { w: 1, h: 2 } },
    ],
  },

  /* ================================================= STUDIO (art + writing) */
  studio: {
    id: "studio",
    name: "The Studio",
    cols: 8,
    rows: 7,
    spawn: { gx: 3, gy: 3 },
    objects: [
      { id: "door-back", sprite: "door", label: "Door — Bedroom", gx: 1, gy: 0, wall: "right", scale: 3, sign: "BEDROOM", interaction: { type: "door", to: "bedroom", entry: { gx: 4, gy: 1 } } },
      { id: "gallery", sprite: "gallery", label: "Gallery wall — Design & Art", gx: 4, gy: 0, wall: "right", scale: 3, interaction: { type: "window", panelId: "art" } },
      { id: "shelf-a", sprite: "bookshelf-left", label: "Myth shelf — Writing & Fiction", gx: 0, gy: 1, interaction: { type: "window", panelId: "writing" } },
      { id: "shelf-b", sprite: "bookshelf-left", label: "Fantasy shelf — Writing & Fiction", gx: 0, gy: 2, interaction: { type: "window", panelId: "writing" } },
      { id: "paints", sprite: "paints", label: "Paint table", gx: 0, gy: 4 },
      { id: "armchair", sprite: "armchair", label: "Reading chair", gx: 5, gy: 4 },
      { id: "lamp", sprite: "lamp", label: "Floor lamp", gx: 7, gy: 5, glow: true },
    ],
  },

  /* ======================================================= CONTACT NOOK */
  contact: {
    id: "contact",
    name: "The Contact Nook",
    cols: 6,
    rows: 5,
    spawn: { gx: 3, gy: 2 },
    objects: [
      { id: "door-back", sprite: "door", label: "Door — Bedroom", gx: 0, gy: 1, wall: "left", scale: 3, sign: "BEDROOM", interaction: { type: "door", to: "bedroom", entry: { gx: 1, gy: 5 } } },
      { id: "letterdesk", sprite: "letterdesk", label: "Letter desk — Say hi", gx: 2, gy: 0, footprint: { w: 2, h: 1 }, interaction: { type: "window", panelId: "contact" } },
      { id: "lamp", sprite: "lamp", label: "Floor lamp", gx: 5, gy: 3, glow: true },
    ],
  },
};

/** The room the site opens in. */
export const START_ROOM = "bedroom";
