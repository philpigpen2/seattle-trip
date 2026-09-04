# Handover — philiplaney.com arcade landing page

**Started:** 2026-09-04 · **Repo:** `~/seattle-trip` (philpigpen2/seattle-trip) · **Vercel:** phil-7305s-projects/seattle-trip · **Domain:** philiplaney.com

## What Phil asked for
1. philiplaney.com currently lists all his apps to anyone. **Hide the app list behind login** — logged-out visitors get a landing page they can log in from.
2. The landing page is **one auto-playing animation**, full bleed: a **1980s video game** in the style of **Double Dragon II**.
3. Four characters on screen: **Bethany, Phil, Evelyn, Charlotte**, plus a little dog **Delaney**, walking along beating up people in the street.
4. (follow-up) Also make a **Golden Axe** version.
5. (follow-up) **Five versions from classic 80s games, including Mario, rotating over time.** Build ONE first so Phil can see it properly.

## Decisions taken
- **Canvas pixel-art engine, not a rendered video.** Autoplay never blocked, crisp at any size, tiny payload, infinite non-repeating loop, respects `prefers-reduced-motion`. Phil said "video, GIF, remotion, or hyperframes, any of those things" — tech was open.
- Low-res backing store (canvas.width ≈ cssWidth/scale) stretched with `image-rendering: pixelated` → real chunky pixels.
- **Theme-driven from the start** so the 5 games are data, not rewrites.
- Auth is **Clerk**, already wired in this repo (invite-only/restricted). `/` becomes: signed out → arcade landing; signed in → the existing app cards.
- `/dryht` stays PUBLIC — memory `handover_rollout_trackers_20260808` records it as an intentionally public (noindex) tracker.

## The five games
1. **Double Dragon II** — night city street, thugs. ← built first
2. **Super Mario Bros.** — overworld, goombas
3. **Golden Axe** — fantasy path, skeleton knights
4. **Ghosts 'n Goblins** — graveyard, zombies
5. **Contra** — jungle base, explosions

## Files
- `src/lib/brawl/font.ts` — 5x7 bitmap font + `drawText`
- `src/lib/brawl/sprites.ts` — `drawFighter` (poses: walk/punch/kick/slash/hurt/ko/idle/cheer, weapons) + `drawDog`
- `src/lib/brawl/bg.ts` — noise, banded sky, infinite tiling, light cones
- `src/lib/brawl/engine.ts` — sim + render loop + HUD + effects (theme-agnostic)
- `src/lib/brawl/themes/*.ts` — one file per game
- `src/components/StreetBrawl.tsx` — React wrapper
- `src/app/page.tsx` — auth gate

## Status — DONE AND LIVE (2026-09-04)

All five games are live on philiplaney.com and rotate every 30s. Logged-out
visitors get only the attract screen; the app list renders only when signed in
(verified: the logged-out HTML contains "PRESS START" and none of the app names).

Shipped on `main`: `d1c3fa7` (gate + Double Dragon), `37b4170` (four more games +
rotation), `8aae4d9` (`?game=` pin + rAF guard). Production deployment Ready under
Vercel scope **`phil-laneys-projects`** — the `phil-7305s-projects` scope named in
the older memory does not exist and `vercel --scope` rejects it.

`philiplaney.com/?game=street|mario|goldenaxe|ghosts|contra` pins one game.

### If you pick up more work here
- Preview harness (no Clerk keys needed locally): `scratchpad/preview/` bundled with
  `npx esbuild <main.ts> --bundle --outfile=main.js --format=iife`, served with
  `python3 -m http.server 8791`, screenshotted with headless Chrome. Use
  `?warm=<frames>` to jump to a moment; `?theme=<id>` to pin a game.
- Do NOT try to advance the animation with `--virtual-time-budget`: rAF does not
  tick, and stubbing rAF with setTimeout stops the compositor painting (black canvas).
  The `warmup` option is the supported way to reach a later frame.
- A sixth game = one file in `src/lib/brawl/themes/` + one line in `themes/index.ts`.

## Landing route for this repo
Personal repo, no PR ceremony: commit + push to `main`, then verify the Vercel production deployment reaches `success` before reporting done.
