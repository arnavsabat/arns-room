/**
 * MOOD PLAYLISTS — shown in the music player HUD.
 * Replace the `url`s with real Spotify playlist links from the account in
 * data/config.ts. The `icon` is a key into the tiny pixel icons drawn by the
 * player (sea | arcane | hype).
 */

export type MoodPlaylist = {
  name: string;
  icon: "sea" | "arcane" | "hype";
  url: string;
  note: string;
};

export const playlists: MoodPlaylist[] = [
  {
    name: "Sea Level",
    icon: "sea",
    url: "https://open.spotify.com/user/cruz6ubtpaf0rdgrexwqmgfvh",
    note: "calm tides for drawing",
  },
  {
    name: "Arcane Hours",
    icon: "arcane",
    url: "https://open.spotify.com/user/cruz6ubtpaf0rdgrexwqmgfvh",
    note: "midnight writing fuel",
  },
  {
    name: "Full Court",
    icon: "hype",
    url: "https://open.spotify.com/user/cruz6ubtpaf0rdgrexwqmgfvh",
    note: "warm-up energy",
  },
];
