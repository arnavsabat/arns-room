/**
 * CONTENT PANELS — everything shown inside the retro windows.
 * ------------------------------------------------------------
 * This is the file for the LONG text: bios, project descriptions, writing
 * excerpts. For short in-world labels (hover names, door signs) see
 * data/rooms.ts instead. Full map: README.md § "Editing all visible text".
 *
 * Each panel is pure data rendered by generic components in
 * components/windows/panels.tsx. To add a window: add an entry here, then
 * point a room object at its id in data/rooms.ts. No component changes.
 *
 * All copy below is starter content written to be replaced — edit freely.
 */

export type Card = {
  title: string;
  description: string;
  tags?: string[];
  link?: { href: string; label: string };
  /** Small pixel accent square color (any CSS color / var). */
  accent?: string;
};

export type WritingPiece = {
  title: string;
  status: "drafting" | "editing" | "published" | "idea";
  blurb: string;
  excerpt?: string;
  link?: { href: string; label: string };
};

export function makeWritingPiece(
  title: string,
  status: WritingPiece["status"],
  blurb: string,
  excerpt = "",
  link?: WritingPiece["link"],
): WritingPiece {
  return {
    title,
    status,
    blurb,
    ...(excerpt ? { excerpt } : {}),
    ...(link ? { link } : {}),
  };
}

export type ContentPanel = {
  id: string;
  /** Window title-bar text. */
  title: string;
  /** Title-bar accent (CSS color). */
  accent?: string;
  /** Rough starting size in px (clamped to viewport by the window). */
  size?: { w: number; h: number };
} & (
  | { kind: "about"; paragraphs: string[]; facts?: Array<{ label: string; value: string }> }
  | { kind: "cards"; intro?: string; cards: Card[] }
  | { kind: "writing"; intro: string; pieces: WritingPiece[]; shelf?: Array<{ title: string; note: string; link?: { href: string; label: string } }> }
  | { kind: "contact"; blurb: string }
);

/**
 * Small helper for future cards: add more entries by appending makeCard(...)
 * calls. Empty cards are ignored automatically by the UI, so you can keep a
 * growing list without having to delete placeholder rows later.
 */
export function makeCard(
  title: string,
  description: string,
  tags: string[] = [],
  accent = "var(--arcane)",
  link?: Card["link"],
): Card {
  return {
    title,
    description,
    ...(tags.some(Boolean) ? { tags: tags.filter(Boolean) } : {}),
    accent,
    ...(link ? { link } : {}),
  };
}

export const panels: Record<string, ContentPanel> = {
  /* ------------------------------------------------ Design & Art (easel) */
  art: {
    id: "art",
    title: "The Studio",
    accent: "var(--arcane)",
    kind: "cards",
    size: { w: 560, h: 460 },
    intro:
      "Working on some things, more sketches soon.",
    cards: [
      makeCard(
        "Night Room (this site)",
        "A cozy pixel world built as a portfolio. Original sprites, a starry night sky, and a lot of amber light.",
        ["pixel art", "web design"],
        "var(--lamp)",
      ),
      makeCard("Coming soon", "", [], "var(--myth)"),
      makeCard("Coming soon", "", [], "var(--arcane)"),
    ],
  },

  /* ------------------------------------------------ Projects (computer) */
  projects: {
    id: "projects",
    title: "The TrustyComputer",
    accent: "var(--lamp)",
    kind: "cards",
    size: { w: 560, h: 440 },
    intro: "Things I've built or am building. The screen is always glowing with something.",
    cards: [
      makeCard(
        "Arns Room",
        "This interactive pixel-room site: Next.js, TypeScript, a data-driven world engine, and hand-placed furniture.",
        ["Next.js", "TypeScript", "creative coding"],
        "var(--lamp)",
        { href: "https://github.com/arnavsabat", label: "GitHub" },
      ),
      makeCard("", "", [], "var(--myth)"),
      makeCard("", "", [], "var(--arcane)"),
    ],
  },

  /* ------------------------------------------ Writing & Fiction (books) */
  writing: {
    id: "writing",
    title: "The Shelves",
    accent: "var(--myth)",
    kind: "writing",
    size: { w: 560, h: 480 },
    intro:
      "I write sometimes...",
    pieces: [
      makeWritingPiece(
        "A John Constantine Story",
        "drafting",
        "Set in 1980s Liverpool, a so called charlatan finds himself at a moral crossroads.",
        "Some day, a feature film.",
        {
          href: "https://docs.google.com/document/d/11B7y2MNSkQHM02Pt_VmyzQcDcM1r4p1qPviqH-ZBFY0/edit?usp=sharing",
          label: "Read Google Doc",
        },
      ),
      makeWritingPiece("Untitled Project", "idea", ""),
      makeWritingPiece("Untitled Project #2", "idea", ""),
    ],
    shelf: [
      {
        title: "The Fruit of Revenge",
        note: "An original Greek epic written by a 14 y/o",
        link: {
          href: "https://docs.google.com/document/d/1n_YBvKL9Y4_zLUp0W5u7vuZHOjbHvdOwqAkYT_Y8e6Y/edit?usp=sharing",
          label: "Read Google Doc",
        },
      },
      { title: "", note: "" },
      { title: "", note: "" },
      { title: "", note: "" },
    ],
  },

  /* ------------------------------------------------ Comics (longbox) */
  comics: {
    id: "comics",
    title: "The Comic Longbox",
    accent: "var(--arcane)",
    kind: "cards",
    size: { w: 540, h: 420 },
    intro:
      "A longbox of influences. Some of my favourite comic issues!",
    cards: [
      {
        title: "...",
        description:
          "probably a spidey comic",
        tags: ["he's", "top 2 fs"],
        accent: "var(--lamp)",
      },
      {
        title: "...",
        description:
          "this one's probably batman",
        tags: ["my childhood", "really"],
        accent: "var(--myth)",
      },
      {
        title: "...",
        description:
          "torn between green lantern and constantine here",
        tags: ["my latest", "favourites"],
        accent: "var(--arcane)",
      },
    ],
  },

  /* ------------------------------------------- Hobbies / sports (hoop) */
  hobbies: {
    id: "hobbies",
    title: "Courtside — Sport & Play",
    accent: "var(--lamp)",
    kind: "about",
    size: { w: 480, h: 400 },
    paragraphs: [
      "Soccer and basketball are how I stay moving. Soccer for the geometry, basketball for the tempo.",
      "Kick the ball on the floor — it still counts as practice.",
    ],
    facts: [
      { label: "Position", value: "Wherever the coach is desperate" },
      { label: "Go-to move", value: "The optimistic through-ball" },
      { label: "Free throws", value: "Improving. Allegedly." },
    ],
  },

  /* ------------------------------------------------------ About me */
  about: {
    id: "about",
    title: "About Arnav",
    accent: "var(--myth)",
    kind: "about",
    size: { w: 520, h: 420 },
    paragraphs: [
      "Hi, I'm Arnav. Alongside building, I enjoy designing, drawing, and writing.",
      "There's a lot that's clickable on this website, feel free to walk around.",
    ],
    facts: [
      { label: "My pasttimes", value: "The movies, hiking, and food." },
      { label: "My email", value: "sabat.arnav@gmail.com" },
      { label: "", value: "" },
      { label: "", value: "" },
    ],
  },

  /* ------------------------------------------------------ Contact */
  contact: {
    id: "contact",
    title: "The Letter Desk",
    accent: "var(--arcane)",
    kind: "contact",
    size: { w: 460, h: 340 },
    blurb:
      "There's always paper on this desk. Say hi!",
  },

  /* --------------------------------------- Mythic artifact (easter egg) */
  artifact: {
    id: "artifact",
    title: "??? — A Humming Amphora",
    accent: "var(--myth)",
    kind: "about",
    size: { w: 420, h: 300 },
    paragraphs: [
      "An amphora that glows faintly violet. The label, in very old handwriting, reads: “DO NOT OPEN. Seriously this time.”",
      "It hums a tune that sounds suspiciously like a lyre. You decide to leave it be — but it's nice to know the room keeps one secret.",
    ],
  },
};
