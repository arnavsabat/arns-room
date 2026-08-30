# Extending the room — copy-paste recipes

Everything here is a one-file edit. Turn on the debug overlay while placing
things: run `npm run dev`, open the site, press **`** (backquote) — you'll see
tile coordinates on the floor and blocked tiles in red.

---

## Add a new interactive object

There are two kinds of objects, drawn two different ways so every angle in the
room stays cohesive:

**Floor furniture** (isometric volumes) lives in
`components/world/iso-furniture.tsx`. A piece is composed from `box()` calls
(an iso box with auto-shaded faces) plus optional face details. Copy an
existing piece — the desk or the nightstand are good starting points:

```tsx
const turntable: Render = () => [
  box("body", 0.1, 0.1, 0.8, 0.8, 16, 0, C.woodWarm),
  flat("disc", 0.3, 0.3, 0.4, 0.4, 17, C.dark),
];
// then register it (h = how tall it reaches, for the hit box):
export const isoFurniture = {
  ...,
  turntable: { h: 20, render: turntable },
};
```

**Wall art** (windows, doors, posters) stays as pixel-text grids in
`data/sprites.tsx` — each character is a pixel; the room renderer skews them
onto the wall plane automatically.

Then **place it** in a room in `data/rooms.ts`:

```ts
{ id: "turntable", sprite: "turntable", label: "Turntable — Music", gx: 4, gy: 5,
  interaction: { type: "window", panelId: "music" } },
```

- `gx, gy` — tile position (debug overlay shows the grid)
- `footprint: { w, h }` — tiles it blocks (default 1×1)
- `wall: "left" | "right"` — hang it on a wall instead of the floor
- `solid: false` — walkable/kickable
- `glow: true` — emits lamp light at night
- `sign: "MUSIC"` — always-visible plaque above it (used for doors)

**Placement tip:** floor furniture visually leans up-and-left in iso, so leave
one empty tile between a tall piece and any door/wall art to its left —
otherwise the furniture's pixels will cover the door's click area.

If it opens a window, add the panel (next recipe).

## Add a content window

Add an entry to `data/content.ts`. Pick a `kind` and the matching fields —
`cards` (project-style grid), `writing` (pieces + shelf), `about`
(paragraphs + facts), or `contact`:

```ts
music: {
  id: "music",
  title: "Guitar — Noise I Make",
  accent: "var(--arcane)",
  kind: "about",
  size: { w: 480, h: 380 },
  paragraphs: ["Three chords and the truth."],
},
```

Point any object's `interaction` at `panelId: "music"` — done.

## Add a whole room

1. New entry in `data/rooms.ts`:

   ```ts
   arcade: {
     id: "arcade",
     name: "The Arcade",
     cols: 7,
     rows: 6,
     spawn: { gx: 3, gy: 3 },
     objects: [
       // a door back home (always give visitors a way out!)
       { id: "door-back", sprite: "door", label: "Door — Bedroom",
         gx: 1, gy: 0, wall: "right",
         interaction: { type: "door", to: "bedroom", entry: { gx: 5, gy: 5 } } },
     ],
   },
   ```

2. Add a door **to** it from an existing room:

   ```ts
   { id: "door-arcade", sprite: "door", label: "Door — Arcade",
     gx: 3, gy: 0, wall: "right", scale: 3, sign: "ARCADE",
     interaction: { type: "door", to: "arcade", entry: { gx: 2, gy: 2 } } },
   ```

`entry` is the tile the avatar appears on in the destination room. Always give
doors a short `sign` — it renders as a permanent plaque so visitors never have
to guess where a door goes.

## Swap / restyle the avatar

The avatar lives in `data/sprites.tsx` under `avatar` — three facings
(`front`, `back`, `side`) with two frames each (frame 0 = idle, frame 1 =
mid-step; `side` faces right and is auto-flipped for left). Edit the grids or
the `BODY` palette (hair, skin, hoodie, pants colors) at the top of the file.

## Change the color palette / mood

All colors are CSS variables in `app/globals.css` (`:root` block). The
day/night variants are right below (`[data-phase="dawn"]` etc.). Sprite-art
colors are the `C` constants at the top of `data/sprites.tsx`.

## Add a mood playlist

Add an entry in `data/playlists.ts` with a real Spotify playlist URL. Icons:
`sea`, `arcane`, `hype` (add new ones in `components/hud/MusicPlayer.tsx`).

## Add a constellation to the sky

`components/world/Sky.tsx` → `CONSTELLATIONS` array: points in a 0–100 box,
`lines` connect point indexes, `at` positions it on screen (% + size in vmin).

## Toggle features

`data/config.ts` → `features`: day/night cycle, weather, geolocation, Spotify,
GitHub widget, CRT overlay, the owl, sound. Flip a boolean; no code surgery.

