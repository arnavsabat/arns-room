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
};

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
  | { kind: "writing"; intro: string; pieces: WritingPiece[]; shelf?: Array<{ title: string; note: string }> }
  | { kind: "contact"; blurb: string }
);

export const panels: Record<string, ContentPanel> = {
  /* ------------------------------------------------ Design & Art (easel) */
  art: {
    id: "art",
    title: "Studio — Design & Art",
    accent: "var(--arcane)",
    kind: "cards",
    size: { w: 560, h: 460 },
    intro:
      "The easel is where everything starts. A few pieces and design experiments — more on the gallery wall soon.",
    cards: [
      {
        title: "Night Room (this site)",
        description:
          "A cozy pixel world built as a portfolio. Original sprites, a starry night sky, and a lot of amber light.",
        tags: ["pixel art", "web design", "worldbuilding"],
        accent: "var(--lamp)",
      },
      {
        title: "Constellation Studies",
        description:
          "A series of star-line figures drawn from Greek myth — the hunter, the winged horse, the lyre.",
        tags: ["illustration", "mythology"],
        accent: "var(--myth)",
      },
      {
        title: "Poster Experiments",
        description:
          "Comic-inspired layout and type studies. Bold panels, halftones, and heroes of my own invention.",
        tags: ["graphic design", "comics"],
        accent: "var(--arcane)",
      },
    ],
  },

  /* ------------------------------------------------ Projects (computer) */
  projects: {
    id: "projects",
    title: "Computer — Projects",
    accent: "var(--lamp)",
    kind: "cards",
    size: { w: 560, h: 440 },
    intro: "Things I've built or am building. The screen is always glowing with something.",
    cards: [
      {
        title: "Arns Room",
        description:
          "This interactive pixel-room site: Next.js, TypeScript, a data-driven world engine, and hand-placed furniture.",
        tags: ["Next.js", "TypeScript", "creative coding"],
        link: { href: "https://github.com/arnavsabat", label: "GitHub" },
        accent: "var(--lamp)",
      },
      {
        title: "Story Engine (WIP)",
        description:
          "A tool for outlining fiction — characters, myth references, and plot threads pinned to a corkboard.",
        tags: ["writing tools", "WIP"],
        accent: "var(--myth)",
      },
      {
        title: "Match Tracker",
        description:
          "A little dashboard for following soccer and basketball box scores with friends.",
        tags: ["sports", "data"],
        accent: "var(--arcane)",
      },
    ],
  },

  /* ------------------------------------------ Writing & Fiction (books) */
  writing: {
    id: "writing",
    title: "The Shelves — Writing & Fiction",
    accent: "var(--myth)",
    kind: "writing",
    size: { w: 560, h: 480 },
    intro:
      "I write fiction that lives somewhere between Olympus and a city bus stop — myth, magic schools, and heroes figuring it out.",
    pieces: [
      {
        title: "The Lighthouse at the Edge of the Aegean",
        status: "drafting",
        blurb: "A keeper's apprentice discovers the lamp she tends is signaling somebody very old.",
        excerpt:
          "The light turned, and for one full rotation the sea forgot to move.",
      },
      {
        title: "Half the Sky in Bronze",
        status: "editing",
        blurb: "Short story — a sculptor is commissioned to finish a statue the gods abandoned.",
      },
      {
        title: "Court of Second Stringers",
        status: "idea",
        blurb: "A bench player on a struggling team realizes the season is being replayed, again and again.",
      },
    ],
    shelf: [
      { title: "Greek myths, retold and raw", note: "the shelf's spine and soul" },
      { title: "Demigod adventures", note: "the reason I write YA-flavored quests" },
      { title: "Wizarding classics", note: "for the castles and the corridors" },
      { title: "Cape comics — both houses", note: "story structure in four colors" },
    ],
  },

  /* ------------------------------------------------ Comics (longbox) */
  comics: {
    id: "comics",
    title: "Longbox — Comics & Influences",
    accent: "var(--arcane)",
    kind: "cards",
    size: { w: 540, h: 420 },
    intro:
      "A longbox of influences. I read across both big houses — what I steal is structure: splash pages, cliffhangers, secret identities.",
    cards: [
      {
        title: "Panel Rhythm",
        description:
          "What I've learned from comics about pacing a page — and how it maps to designing screens.",
        tags: ["craft", "design"],
        accent: "var(--lamp)",
      },
      {
        title: "Heroes of My Own",
        description:
          "Original character sketches and one-page origin stories. No borrowed capes — new ones.",
        tags: ["original characters", "writing"],
        accent: "var(--myth)",
      },
      {
        title: "Mythology is the First Shared Universe",
        description:
          "An essay-in-progress on why the Greek pantheon reads like a superhero team book.",
        tags: ["essay", "mythology"],
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
      "Hi, I'm Arnav — a creative. I design, draw, and write, usually with a myth open in one tab and a match on in the other.",
      "This room is my corner of the internet: everything in it is clickable, and everything clickable is something I love.",
    ],
    facts: [
      { label: "Making", value: "Design, pixel art, fiction" },
      { label: "Reading", value: "Myth, magic, and cape comics" },
      { label: "Playing", value: "Soccer & basketball" },
      { label: "Email", value: "sabat.arnav@gmail.com" },
    ],
  },

  /* ------------------------------------------------------ Contact */
  contact: {
    id: "contact",
    title: "Letter Desk — Say Hi",
    accent: "var(--arcane)",
    kind: "contact",
    size: { w: 460, h: 340 },
    blurb:
      "There's always paper on this desk. Send a letter about work, writing, art, or your ranking of the Twelve Olympians.",
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
