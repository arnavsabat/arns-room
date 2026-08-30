import { NextResponse } from "next/server";

/**
 * SPOTIFY NOW-PLAYING — server-side so tokens never reach the browser.
 *
 * Setup (see README §Spotify):
 *   SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN in
 *   .env.local. Without them this returns { configured: false } and the
 *   player shows mood playlists only — never an error.
 */

export const dynamic = "force-dynamic";

const ID = process.env.SPOTIFY_CLIENT_ID;
const SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH = process.env.SPOTIFY_REFRESH_TOKEN;

async function accessToken(): Promise<string | null> {
  if (!ID || !SECRET || !REFRESH) return null;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${ID}:${SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: REFRESH }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export async function GET() {
  if (!ID || !SECRET || !REFRESH) {
    return NextResponse.json({ configured: false });
  }
  try {
    const token = await accessToken();
    if (!token) return NextResponse.json({ configured: false });

    // Currently playing, falling back to the most recently played track.
    const nowRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (nowRes.status === 200) {
      const now = (await nowRes.json()) as {
        is_playing?: boolean;
        item?: { name: string; artists: Array<{ name: string }>; external_urls: { spotify: string } };
      };
      if (now.item) {
        return NextResponse.json({
          configured: true,
          playing: !!now.is_playing,
          track: {
            name: now.item.name,
            artist: now.item.artists.map((a) => a.name).join(", "),
            url: now.item.external_urls.spotify,
          },
        });
      }
    }

    const recentRes = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=1",
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    );
    if (recentRes.ok) {
      const recent = (await recentRes.json()) as {
        items?: Array<{
          track: { name: string; artists: Array<{ name: string }>; external_urls: { spotify: string } };
        }>;
      };
      const track = recent.items?.[0]?.track;
      if (track) {
        return NextResponse.json({
          configured: true,
          playing: false,
          track: {
            name: track.name,
            artist: track.artists.map((a) => a.name).join(", "),
            url: track.external_urls.spotify,
          },
        });
      }
    }
    return NextResponse.json({ configured: true, playing: false });
  } catch {
    return NextResponse.json({ configured: true, playing: false });
  }
}
