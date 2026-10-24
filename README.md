# Arns Room

A cozy and interactive pixel-art night world.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS + Zustand +
Framer Motion**. All art is original pixel work defined as editable text grids.

## Controls

| Input | Action |
| --- | --- |
| WASD / arrow keys | walk |
| E / Enter / Space | interact with the nearby glowing object |
| Click / tap any object | interact directly (no walking needed) |
| Esc | close the top window |
| Tab | reach every button/window control |
| ` (backquote, dev only) | debug overlay: grid coords, collision, phase |

## Where everything lives

```
data/          where edits live
  config.ts    name, tagline, links, feature flags
  rooms.ts     every room, object, and door
  content.ts   what's inside each window
  sprites.tsx  character pixel art as text grids
  playlists.ts music-player mood playlists
components/
  world/       sky, room renderer, iso furniture, avatar & movement
  windows/     retro dialog windows + panel renderers
  hud/         clock, socials, music, toggles
  boot/        loading screen
lib/           small systems: pixel renderer, iso math, input, audio,
               time (day/night), weather, collision
store/         global state (current room, open windows)
app/           routes + API (spotify / weather / github)
```

## Live widgets (all fail-soft)

- **Weather**: Open-Meteo, no key needed. Uses geolocation only if the browser
  has already granted it. Otherwise the fallback city in `data/config.ts`.
- **GitHub "currently building"**: public API, no key. Hides itself if empty.
- **Spotify now-playing**: needs keys (below). Without them the player shows
  mood playlists.
- **Day/night cycle**: the sky, lamp, and scene widget follow the visitor's
  local clock. Phase colors live in `app/globals.css`.

## Accessibility & performance notes

- Full keyboard play; focus-trapped dialogs; Esc everywhere; `prefers-reduced-motion`
  turns off all ambient animation and typewriter effects.
- `/explore` is the complete text alternative.
- All animation is transform/opacity only. the avatar loop is a single
  `requestAnimationFrame`; sprites are crisp SVG rects (no blurry scaling).
- Every live widget has a quiet fallback so a missing key never breaks the page.
