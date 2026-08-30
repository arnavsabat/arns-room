"use client";

/**
 * MUSIC PLAYER (bottom-left HUD): Spotify now-playing via /api/spotify,
 * with mood playlists always available underneath. Degrades gracefully:
 * no env keys → playlists only; API error → quiet "no track" state.
 */

import React, { useEffect, useState } from "react";
import { playlists, type MoodPlaylist } from "@/data/playlists";
import { PixelSprite, type PixelGrid } from "@/lib/pixel";
import { features } from "@/data/config";

type NowPlaying =
  | { configured: false }
  | { configured: true; playing: boolean; track?: { name: string; artist: string; url: string } };

/* Small pixel eighth-note (font music glyphs render inconsistently). */
const NOTE_ICON: PixelGrid = {
  palette: { n: "#ffb454" },
  rows: [
    "...nn...",
    "...nnn..",
    "...n.nn.",
    "...n....",
    "...n....",
    ".nnn....",
    "nnnn....",
    ".nn.....",
  ],
};

const MOOD_ICONS: Record<MoodPlaylist["icon"], PixelGrid> = {
  sea: {
    palette: { b: "#4fd6c9", B: "#37b3a6", w: "#f5f3ff" },
    rows: ["........", "..ww....", "bbbbbbbb", "BbBbBbBb", "bBbBbBbB", "BBBBBBBB"],
  },
  arcane: {
    palette: { p: "#9a7bd8", P: "#7a5cb8", s: "#f5f3ff" },
    rows: ["...s....", "..ppp...", ".ppPpp..", "ppPPPpp.", ".ppPpp..", "..ppp..."],
  },
  hype: {
    palette: { o: "#ef8b3f", k: "#1b1724", w: "#f5f3ff" },
    rows: ["..oooo..", ".okoook.", "ooookooo", "ooookooo", ".okoook.", "..oooo.."],
  },
};

export function MusicPlayer() {
  const [now, setNow] = useState<NowPlaying>({ configured: false });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!features.spotify) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/spotify");
        if (!res.ok) return;
        const data = (await res.json()) as NowPlaying;
        if (!cancelled) setNow(data);
      } catch {
        /* keep previous state */
      }
    };
    void load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const track = now.configured && now.track ? now.track : null;

  return (
    <div className="pixel-panel w-56 px-3 py-2">
      <button
        className="flex w-full items-center gap-2 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Collapse music player" : "Expand music player"}
      >
        <span aria-hidden className={track && now.configured && now.playing ? "animate-pulse" : ""}>
          <PixelSprite grid={NOTE_ICON} scale={2} />
        </span>
        <span className="min-w-0 flex-1">
          {track ? (
            <a
              href={track.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-xs hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {now.configured && now.playing ? "" : "paused · "}
              {track.name} — {track.artist}
            </a>
          ) : (
            <span className="block truncate text-xs" style={{ color: "var(--ink-muted)" }}>
              no track playing
            </span>
          )}
        </span>
        <span aria-hidden className="text-xs" style={{ color: "var(--ink-muted)" }}>
          {open ? "▾" : "▸"}
        </span>
      </button>

      {open && (
        <ul className="mt-2 space-y-1.5 border-t-2 pt-2" style={{ borderColor: "var(--panel-wood)" }}>
          {playlists.map((pl) => (
            <li key={pl.name}>
              <a
                href={pl.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-1 text-xs hover:bg-white/5"
              >
                <PixelSprite grid={MOOD_ICONS[pl.icon]} scale={2} />
                <span className="min-w-0">
                  <span className="block truncate">{pl.name}</span>
                  <span className="block truncate" style={{ color: "var(--ink-muted)" }}>
                    {pl.note}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
