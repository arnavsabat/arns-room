/**
 * SITE CONFIG — every piece of personal info and every feature flag lives here.
 * This is the first file to edit when making the site yours.
 */

export const site = {
  /** Display name used in the HUD clock, dialogue box, etc. */
  name: "Arnav",
  /** Browser tab title. */
  tabTitle: "Arns Room",
  /** The line the avatar "types" in its speech bubble on load. */
  tagline: "Hi, I'm Arnav, a creative.",
  /** Contact email (Contact nook + About window). */
  email: "sabat.arnav@gmail.com",
  /** Social links (top-left HUD). Resume can be a PDF dropped into /public. */
  links: {
    github: "https://github.com/arnavsabat",
    linkedin: "https://www.linkedin.com/in/arnavsabat",
    /** Set to e.g. "/resume.pdf" once the PDF is added to /public. null hides the button. */
    resume: null as string | null,
  },
  /** GitHub username for the live activity widget (public API, no key needed). */
  githubUser: "arnavsabat",
  /** Spotify username — playlists in data/playlists.ts belong to this account. */
  spotifyUser: "cruz6ubtpaf0rdgrexwqmgfvh",
  /** For the pixel-artist: how the avatar should look. */
  avatarDescription:
    "black hair, summer fit and shorts, bright and high-spirited vibe",
  /** SEO description. */
  description:
    "Arnav's cozy pixel room — a little night world of design, art, mythology, comics, sport, and fiction. Walk around, click things.",
} as const;

/**
 * FEATURE FLAGS — toggle systems on/off without touching code.
 */
export const features = {
  /** Real-time day/night cycle (sky, lamp, star density follow the clock). */
  dayNightCycle: true,
  /** Live weather particles (Open-Meteo, no API key required). */
  weather: true,
  /** Ask for geolocation for weather. If false/denied, fallbackCity is used. */
  weatherGeolocation: true,
  /** Fallback coordinates for weather when no geolocation. (San Francisco) */
  fallbackCity: { lat: 37.77, lon: -122.42, label: "SF" },
  /** Spotify now-playing widget (requires env keys; degrades to playlists). */
  spotify: true,
  /** GitHub recent-activity widget (hidden gracefully if it errors). */
  github: true,
  /** Faint CRT scanline overlay. */
  crtOverlay: true,
  /** The pet familiar that follows the avatar. */
  pet: false,
  /** Sound effects (always opt-in; false removes the toggle entirely). */
  sound: true,
} as const;

export type DayPhase = "dawn" | "day" | "dusk" | "night";
