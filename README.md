# Arns Room 🛋️✨

A cozy, interactive pixel-art night world — Arnav's portfolio as a little game.
Walk around an isometric bedroom under a Greek-myth constellation sky, click the
furniture to open retro windows (art, projects, writing, comics, sport), wander
through doors into more rooms, and say hi at the letter desk.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS + Zustand +
Framer Motion**. All art is original pixel work defined as editable text grids.

---

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. That's it — no API keys required for anything.

Other commands:

```bash
npm run build   # production build (must pass before deploying)
npm run lint    # ESLint
node scripts/e2e.mjs   # browser smoke test (needs Chrome installed + dev server on :3777)
```

## Controls

| Input | Action |
| --- | --- |
| WASD / arrow keys | walk |
| E / Enter / Space | interact with the nearby glowing object |
| Click / tap any object | interact directly (no walking needed) |
| Esc | close the top window |
| Tab | reach every button/window control |
| ` (backquote, dev only) | debug overlay: grid coords, collision, phase |

There's also a keyboard-free **text version of everything** at [/explore](http://localhost:3000/explore).

## Deploy to Vercel (beginner friendly)

1. Push this folder to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Accept the defaults (Vercel auto-detects Next.js) and click **Deploy**.
4. Optional: in the project's **Settings → Environment Variables**, add the keys
   from `.env.example` (Spotify etc.), then redeploy.

## Where everything lives

```
data/        ← YOUR WORLD. Edit these, rarely anything else.
  config.ts    name, tagline, links, feature flags
  rooms.ts     every room, object, and door (the world layout)
  content.ts   what's inside each window (projects, writing, …)
  sprites.tsx  character pixel art (avatar, owl, wall décor), as text grids
  playlists.ts music-player mood playlists
components/
  world/       sky, room renderer, iso furniture, avatar + movement
  windows/     retro dialog windows + panel renderers
  hud/         clock, socials, music, toggles
  boot/        loading screen
lib/           small systems: pixel renderer, iso math, input, audio,
               time (day/night), weather, collision
store/         global state (current room, open windows)
app/           routes + API (spotify / weather / github)
```

**To customize the site, start with `data/config.ts`** — name, tagline, links,
and feature flags (weather, pet, CRT overlay…) are all there. Then see
[EXTENDING.md](./EXTENDING.md) for copy-paste recipes: add a room, add an
object, add a window, swap the avatar, change the palette.

## Editing all visible text

Every word a visitor can read lives in exactly three files. No hunting
through components — find your text type below, open that file, edit the
string, save.

| What you want to change | File | Look for |
| --- | --- | --- |
| Your name, tagline, email, resumé/social links | `data/config.ts` | `site.*` |
| A room's name (e.g. "The Bedroom") | `data/rooms.ts` | `name:` on the room |
| The label that pops up hovering an object | `data/rooms.ts` | `label:` on the object |
| A door's plaque (e.g. "STUDIO") | `data/rooms.ts` | `sign:` on the door |
| The soccer-ball toast message | `data/rooms.ts` | `message:` inside its `interaction` |
| Everything inside a click-to-open window — About, Projects, Art, Writing, Comics, Sport, Contact | `data/content.ts` | the matching entry in `panels` |
| Music mood-playlist names/notes | `data/playlists.ts` | `playlists` |

`data/content.ts` is the one to open most often — it's the long-form copy
(bios, project descriptions, writing excerpts). `data/rooms.ts` holds the
short, in-world labels alongside each object's position; the two fields
that matter for text (`label` and `sign`) always sit right after `sprite:`
on each line, before the layout/position properties.

## Live widgets (all optional, all fail-soft)

- **Weather** — Open-Meteo, no key needed. Uses geolocation only if the browser
  has already granted it; otherwise the fallback city in `data/config.ts`.
- **GitHub "currently building"** — public API, no key. Hides itself if empty.
- **Spotify now-playing** — needs keys (below). Without them the player shows
  mood playlists.
- **Day/night cycle** — the sky, lamp, and scene widget follow the visitor's
  local clock. Phase colors live in `app/globals.css`.

### Spotify setup

1. Create an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard);
   add `http://localhost:3000/callback` as a redirect URI.
2. Get a **refresh token** with the `user-read-currently-playing
   user-read-recently-played` scopes (any "Spotify refresh token generator"
   guide works — it's a one-time OAuth dance).
3. Put `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` in
   `.env.local` (copy `.env.example`). Keys never reach the browser — the
   widget talks to `/api/spotify` on the server.

## Accessibility & performance notes

- Full keyboard play; focus-trapped dialogs; Esc everywhere; `prefers-reduced-motion`
  turns off all ambient animation and typewriter effects.
- `/explore` is the complete text alternative.
- All animation is transform/opacity only; the avatar loop is a single
  `requestAnimationFrame`; sprites are crisp SVG rects (no blurry scaling).
- Every live widget has a quiet fallback — a missing key never breaks the page.

## Future hooks already wired

- **Touch joystick / D-pad** — input is abstracted in `lib/input.ts`; a touch
  control just calls `input.press("up")` etc. Mobile users can already tap
  every object directly.
