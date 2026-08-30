/**
 * SPRITES — the character-style pixel art, defined as text grids.
 * ----------------------------------------------------------------
 * Each sprite is a PixelGrid: rows of characters + a palette mapping each
 * character to a color; "." = transparent. Edit a letter, edit a pixel.
 *
 * Only "character" art lives here (avatar, pet, wall décor, small props).
 * Furniture is generated as true isometric volumes in
 * components/world/iso-furniture.tsx so every angle in the room matches.
 */

import type { PixelGrid } from "@/lib/pixel";

/* ---------------------------------------------------------------- palette */

const C = {
  outline: "#1b1724",
  hair: "#20202a", // black, short and spiky
  skin: "#f0c8a0",
  skinShade: "#d8ab7f",
  shirt: "#ece7dd", // white tee
  stripe: "#1b1724", // black stripe down the middle
  pants: "#4e7a3a", // green cargo pants
  pantsShade: "#3d6130",
  shoes: "#26262f",
  white: "#ece7dd",
  woodHi: "#6b4f3a",
  wood: "#4a3a2e",
  woodDark: "#2e2119",
  woodWarm: "#a3867a",
  woodWarmDark: "#7d655b",
  amber: "#ffb454",
  night: "#0e0f24",
  star: "#f5f3ff",
  teal: "#4fd6c9",
  purple: "#9a7bd8",
  red: "#e05c5c",
  orange: "#ef8b3f",
} as const;

const BODY = {
  h: C.hair,
  s: C.skin,
  S: C.skinShade,
  w: C.shirt,
  b: C.stripe,
  g: C.pants,
  G: C.pantsShade,
  k: C.shoes,
  e: C.outline,
};

/* ================================================================ AVATAR
   14×22 — a bright, high-spirited kid: black spiky hair, white tee with a
   black stripe down the middle, green cargo pants, dark shoes.
   Facings: front / back / side (side faces right; flipped for left).
   Frame 0 = idle (breathes via CSS), frame 1 = mid-step. */

export const avatar: Record<string, PixelGrid[]> = {
  front: [
    {
      palette: BODY,
      rows: [
        "..h.hh.hh..h..",
        "..hhhhhhhhhh..",
        ".hhhhhhhhhhhh.",
        ".hhhhhhhhhhhh.",
        ".hhsssssssshh.",
        ".hhsesssseshh.",
        ".hhsssssssshh.",
        "..hsssseessh..",
        "...ssssssss...",
        "....ssSSss....",
        "..wwwwbbwwww..",
        ".bwwwwbbwwwwb.",
        ".swwwwbbwwwws.",
        ".swwwwbbwwwws.",
        ".swwwwbbwwwws.",
        "..wwwwbbwwww..",
        "..wwwwbbwwww..",
        "...gggggggg...",
        "...gGg..gGg...",
        "...ggg..ggg...",
        "..kkkk..kkkk..",
        "..............",
      ],
    },
    {
      palette: BODY,
      rows: [
        "..h.hh.hh..h..",
        "..hhhhhhhhhh..",
        ".hhhhhhhhhhhh.",
        ".hhhhhhhhhhhh.",
        ".hhsssssssshh.",
        ".hhsesssseshh.",
        ".hhsssssssshh.",
        "..hsssseessh..",
        "...ssssssss...",
        "....ssSSss....",
        "..wwwwbbwwww..",
        ".bwwwwbbwwwwb.",
        ".swwwwbbwwwws.",
        ".swwwwbbwwwws.",
        ".swwwwbbwwwws.",
        "..wwwwbbwwww..",
        "..wwwwbbwwww..",
        "...gggggggg...",
        "..gGg....gGg..",
        "..ggg....ggg..",
        ".kkkk....kkkk.",
        "..............",
      ],
    },
  ],
  back: [
    {
      palette: BODY,
      rows: [
        "..h.hh.hh..h..",
        "..hhhhhhhhhh..",
        ".hhhhhhhhhhhh.",
        ".hhhhhhhhhhhh.",
        ".hhhhhhhhhhhh.",
        ".hhhhhhhhhhhh.",
        ".hhhhhhhhhhhh.",
        "..hhhhhhhhhh..",
        "...hhhhhhhh...",
        "....ssssss....",
        "..wwwwbbwwww..",
        ".bwwwwbbwwwwb.",
        ".swwwwbbwwwws.",
        ".swwwwbbwwwws.",
        ".swwwwbbwwwws.",
        "..wwwwbbwwww..",
        "..wwwwbbwwww..",
        "...gggggggg...",
        "...gGg..gGg...",
        "...ggg..ggg...",
        "..kkkk..kkkk..",
        "..............",
      ],
    },
    {
      palette: BODY,
      rows: [
        "..h.hh.hh..h..",
        "..hhhhhhhhhh..",
        ".hhhhhhhhhhhh.",
        ".hhhhhhhhhhhh.",
        ".hhhhhhhhhhhh.",
        ".hhhhhhhhhhhh.",
        ".hhhhhhhhhhhh.",
        "..hhhhhhhhhh..",
        "...hhhhhhhh...",
        "....ssssss....",
        "..wwwwbbwwww..",
        ".bwwwwbbwwwwb.",
        ".swwwwbbwwwws.",
        ".swwwwbbwwwws.",
        ".swwwwbbwwwws.",
        "..wwwwbbwwww..",
        "..wwwwbbwwww..",
        "...gggggggg...",
        "..gGg....gGg..",
        "..ggg....ggg..",
        ".kkkk....kkkk.",
        "..............",
      ],
    },
  ],
  /* Side sprite faces RIGHT; the renderer flips it for "left". */
  side: [
    {
      palette: BODY,
      rows: [
        "....h.hh.h....",
        "...hhhhhhhh...",
        "..hhhhhhhhhh..",
        "..hhhhhhhhhh..",
        "..hhhhssssss..",
        "..hhhhssess...",
        "..hhhhssssss..",
        "...hhhssses...",
        "....ssssss....",
        ".....ssSs.....",
        "...wwwwwwwb...",
        "..bwwwwwwwb...",
        "..wsswwwwwb...",
        "..wsswwwwwb...",
        "..wsSwwwwwb...",
        "...wwwwwww....",
        "...wwwwwww....",
        "....gggggg....",
        "....gggGg.....",
        "....ggggg.....",
        "....kkkkk.....",
        "..............",
      ],
    },
    {
      palette: BODY,
      rows: [
        "....h.hh.h....",
        "...hhhhhhhh...",
        "..hhhhhhhhhh..",
        "..hhhhhhhhhh..",
        "..hhhhssssss..",
        "..hhhhssess...",
        "..hhhhssssss..",
        "...hhhssses...",
        "....ssssss....",
        ".....ssSs.....",
        "...wwwwwwwb...",
        "..bwwwwwwwb...",
        "..wsswwwwwb...",
        "..wsswwwwwb...",
        "..wsSwwwwwb...",
        "...wwwwwww....",
        "...wwwwwww....",
        "....gggggg....",
        "...gGg..gg....",
        "...ggg...gg...",
        "..kkkk...kkk..",
        "..............",
      ],
    },
  ],
};

/* ================================================================ PET
   The owl familiar (also appears as a plushie on the bed). */

export const pet: PixelGrid[] = [
  {
    palette: { b: "#7a6a9e", B: "#5c4f7a", w: C.white, e: C.amber, k: C.orange },
    rows: [
      ".b......b.",
      ".bb....bb.",
      ".bbbbbbbb.",
      "bbwwbbwwbb",
      "bbwebbwebb",
      "bbbbkkbbbb",
      ".bBBBBBBb.",
      ".bBbbbbBb.",
      "..bbbbbb..",
      "...kk.kk..",
    ],
  },
  {
    palette: { b: "#7a6a9e", B: "#5c4f7a", w: C.white, e: C.amber, k: C.orange },
    rows: [
      ".b......b.",
      ".bb....bb.",
      ".bbbbbbbb.",
      "bbwwbbwwbb",
      "bbbbbbbbbb",
      "bbbbkkbbbb",
      ".bBBBBBBb.",
      ".bBbbbbBb.",
      "..bbbbbb..",
      "...kk.kk..",
    ],
  },
];

/* ====================================================== WALL DÉCOR & PROPS
   Wall-mounted sprites (skewed onto the wall plane by the room renderer)
   and small organic props embedded into iso furniture. */

export const furniture: Record<string, PixelGrid> = {
  /* --- Window: white frame; the panes show the LIVE sky outside — their
     colors are CSS variables that shift with the day/night phase (see the
     --window-* tokens in app/globals.css). --- */
  window: {
    palette: { f: C.white, F: "#b8b5aa", n: "var(--window-sky)" },
    rows: [
      "ffffffffffffffffff",
      "fnnnnnnnffnnnnnnnf",
      "fnnnnnnnffnnnnnnnf",
      "fnnnnnnnffnnnnnnnf",
      "fnnnnnnnffnnnnnnnf",
      "ffffffffffffffffff",
      "fnnnnnnnffnnnnnnnf",
      "fnnnnnnnffnnnnnnnf",
      "fnnnnnnnffnnnnnnnf",
      "fnnnnnnnffnnnnnnnf",
      "ffffffffffffffffff",
      "FFFFFFFFFFFFFFFFFF",
    ],
  },

  /* --- Door: warm wood, simple panel, amber handle --- */
  door: {
    palette: { f: C.woodDark, d: C.woodWarm, D: C.woodWarmDark, a: C.amber },
    rows: [
      "ffffffffffffffff",
      "fddddddddddddddf",
      "fddddddddddddddf",
      "fdDDDDDDDDDDDDdf",
      "fdDddddddddddDdf",
      "fdDddddddddddDdf",
      "fdDddddddddddDdf",
      "fdDddddddddddDdf",
      "fdDDDDDDDDDDDDdf",
      "fddddddddddddddf",
      "fdDDDDDDDDDDDDdf",
      "fdDddddddddddDdf",
      "fdDddddddddaaDdf",
      "fdDddddddddaaDdf",
      "fdDddddddddddDdf",
      "fdDddddddddddDdf",
      "fdDddddddddddDdf",
      "fdDDDDDDDDDDDDdf",
      "fddddddddddddddf",
      "ffffffffffffffff",
    ],
  },

  /* --- Gallery wall: two framed pieces (studio) --- */
  gallery: {
    palette: { d: C.woodDark, w: C.white, t: C.teal, p: C.purple, a: C.amber, n: C.night, s: C.star },
    rows: [
      "dddddddddd..dddddddd",
      "dwwwwwwwwd..dnnnnnnd",
      "dwttwwppwd..dnssnsnd",
      "dwttppppwd..dnnnnnnd",
      "dwwwaawwwd..dnsnnnnd",
      "dwwwaawwwd..dnnnsnnd",
      "dwwwwwwwwd..dnnnnnnd",
      "dddddddddd..dddddddd",
    ],
  },

  /* --- FC Barcelona crest (hangs above the bed, on the wall plane).
     Mimics the real emblem: notched top, gold rim, St George cross top-LEFT,
     Catalan stripes top-RIGHT, gold FCB band, five blaugrana stripes with
     the gold ball, tapering to the shield point. --- */
  crest: {
    palette: {
      k: "#1b1724",
      R: "#d63b3b",
      G: "#f2c94c",
      W: "#ece7dd",
      B: "#2c5c9e",
      C: "#8a2a4a",
    },
    rows: [
      "..kkkkkkkk..kkkkkkkk..",
      ".kGGGGGGGGkkGGGGGGGGk.",
      "kGGGGGGGGGGGGGGGGGGGGk",
      "kGGkkkkkkkkkkkkkkkkGGk",
      "kGGWWWRRWWWGRRGGRRGGGk",
      "kGGWWWRRWWWGRRGGRRGGGk",
      "kGGRRRRRRRRGRRGGRRGGGk",
      "kGGRRRRRRRRGRRGGRRGGGk",
      "kGGWWWRRWWWGRRGGRRGGGk",
      "kGGWWWRRWWWGRRGGRRGGGk",
      "kGGkkkkkkkkkkkkkkkkGGk",
      "kGGGGGGGGGGGGGGGGGGGGk",
      "kGGGkkkkGGkkkGGkkkGGGk",
      "kGGGkkkGGGkGGGGkkkkGGk",
      "kGGGkGGGGGkkkGGkkkGGGk",
      "kGGkkkkkkkkkkkkkkkkGGk",
      "kGGBBBCCCBBBBCCCBBBGGk",
      "kGGBBBCCGGGGGGCCBBBGGk",
      "kGGBBBCCGGkkGGCCBBBGGk",
      "kGGBBBCCGGGGGGCCBBBGGk",
      ".kGGBBCCCBBBBCCCBBGGk.",
      "..kGGBCCCBBBBCCCBGGk..",
      "....kGGCCBBBBCCGGk....",
      "......kGGBBBBGGk......",
      "........kGGGGk........",
      "..........kk..........",
    ],
  },

  /* --- Soccer ball (kickable; also a bed plushie) --- */
  ball: {
    palette: { w: C.white, k: C.outline, g: "#c9c2b4" },
    rows: [
      "..wwww..",
      ".wwkkww.",
      "wwkkkkww",
      "wkkwwkkw",
      "wwkwwkww",
      "wwwkkwww",
      ".gwwwwg.",
      "..gggg..",
    ],
  },

  /* --- Glowing amphora (mythic easter egg, library) --- */
  artifact: {
    palette: { p: C.purple, P: "#7a5cb8", a: "#ffd9a0" },
    rows: [
      "..a....a..",
      "...pppp...",
      "..p....p..",
      "...pppp...",
      "...PppP...",
      "..PppppP..",
      ".PppppppP.",
      ".PppppppP.",
      "..PppppP..",
      "...PPPP...",
      "..PPPPPP..",
    ],
  },
};
