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

## The six games (rotation order)
1. **Double Dragon II** (`street`) — night street, chain-link fence, oil drums; energy-bar HUD
2. **Super Mario Bros.** (`mario`) — goombas + koopas as real critters, jump-stomps that flatten
   them, point-value popups, MARIO/COIN/WORLD/TIME bar, flagpole
3. **Pac-Man** (`pacman`) — blue maze, corridor of dots eaten behind the party, four ghosts,
   1UP/HIGH SCORE/2UP, lives and a cherry
4. **Golden Axe** (`goldenaxe`) — sunset ridges, torches; magic burns the screen and drops
   everything standing; magic-pot meter
5. **TMNT** (`tmnt`) — burning New York block, purple Foot Soldiers who vanish in a puff, four
   shells with four weapons, four status panels along the bottom
6. **Contra** (`contra`) — side-on jungle platformer, rocky ledge, girder bridge over water,
   five-shot spread, weapon capsule

## Selector and play (2026-09-04, later)
- The loop is still the default. `GameSelector` along the bottom pins a game (mirrored into
  `?game=`); AUTO returns to rotation. Games are shown as **pixel icons, never names**.
- **Pac-Man is playable.** Arrow keys / WASD (window listener in the engine), a swipe on the
  canvas, or the on-screen `DPad`, which calls `handle.input(dir)` directly.
- **Five family characters, five Pac-Man slots.** Whoever you pick becomes Pac-Man; the other
  four take the classic ghost colours. They are told apart by a *topper* — long hair, cap,
  ponytail, bob, dog ears — drawn on the dome or the disc. `PlayerPicker` chooses.
- Steering model: he moves ONLY while a direction is held, and stops on a cell when it is
  released. A turn is buffered and taken at the first corner where it fits. Walking into a
  wall stops him rather than sliding him along it.
- **Once someone takes over, the attract AI never drives Pac-Man again** (Phil, explicit).
  There is no idle hand-back. Do not reintroduce one.
- Do NOT latch a `stalled` flag — an earlier attempt deadlocked because unstalling needed the
  very input that could not be consumed while stalled. Re-evaluate each frame instead.
- **Super Mario Bros is a real platformer too** (`mario-sim.ts`, art in `mario-art.ts`):
  World 1-1 as a looping tile map, gravity, variable-height jumps, axis-resolved tile
  collision, pits, question blocks that pay out once, goombas and koopas that squash.
  Hold left/right to run, up to jump. The family runs as a line and stops when you stop —
  which is right for a platformer, unlike Pac-Man where he carries straight on.
- **All six are playable.** The four brawlers are steered through the engine's own brawl
  loop: arrows move the taken hero sideways and in depth (`Hero.ox` + `lane`), and
  space / Z / X or the on-screen **A** button swings. A taken hero never auto-attacks.
  Pac-Man and Mario run their own simulations.
- The cabinet controls fade to low opacity after ~3s and wake on any pointer, key or
  touch, so the game keeps the screen.
- The slim marquee is **Pac-Man only**. Applying it to every played game put the page
  title straight over the corners the brawlers use for score and energy bars.
- A `custom` stage draws its own world; the engine still calls `theme.hud` over the top, so
  Mario keeps the MARIO/COIN/WORLD/TIME bar and Pac-Man draws its own readout instead.

## Play-testing (the only way these bugs were found)
`scratchpad/playtest.ts` stubs a DOM (canvas, rAF, ResizeObserver) and drives the REAL engine
headlessly for minutes of game time per stage, capturing what `theme.hud` receives. The custom
sims expose `debug()` for the same purpose. Screenshots cannot find any of this. Faults it caught:
- **Mario froze after ~17s**: the runner jumped when already touching a pipe, so it went straight
  up and landed in the same place forever. Needs look-ahead, air control, and enough height for a
  four-tile pipe.
- **Pac-Man stopped scoring after ~80s**: computing only the FIRST step of a route at every corner
  makes it ping-pong; and vetoing any dot near a ghost made it starve. It now plans a whole route
  and commits, and falls back to a guarded dot.
- **Landing on a goomba scored as walking into one**: the ground tile under it had already set
  `onGround`. Judge a stomp from the actor's PREVIOUS position (`Actor.py`), never `onGround`.

## Rules for the games (Phil, 2026-09-04)
- Three lives, death, GAME OVER, restart. One level to finish per game — Mario at the flagpole,
  Pac-Man when the maze is clear, brawlers at `STAGE_LENGTH` — then it starts again.
- **The attract loop must NOT die**; it plays the course. Stakes belong to whoever takes over
  (`taken`). Without this the demo just loops death animations.

## Verification traps found here
- **Headless Chrome clamps the layout viewport to 500px wide**, so `--window-size=390,...`
  renders at 500 and crops — apparent mobile overflow was an artifact, not a bug.
- `--virtual-time-budget` does not tick `requestAnimationFrame`; use the engine's `warmup`.
- Custom stages need their own warm-up (`custom.step()`), or screenshots sit 20 frames in.
- Vercel's GitHub integration silently skipped a commit once; an empty commit re-triggered it.
  Check `gh api /repos/philpigpen2/seattle-trip/deployments?sha=<sha>` before assuming it built.

Ghosts 'n Goblins was built and then removed at Phil's request in favour of TMNT.

## Fidelity rules (Phil, 2026-09-04 — after he rejected the first pass)
- **Each stage must genuinely look like the game it represents.** The first build was
  pastiche and he called it out on SMB specifically.
- **No game names on screen.** The art has to identify the game.
- **Pixel size is per-era.** `targetW` / `targetH` on a theme set the internal buffer, so an
  8-bit NES screen is 256 wide and a Sega System 16 board is 320. Do not use one scale for all.
- **Staging is per-genre.** `staging: "flat"` puts the whole cast on one ground line for the
  platformers (Mario, Contra). The depth plane is for the brawlers only. A game may replace the
  brawl entirely with `custom` — Pac-Man does.

## Cast rules (Phil, 2026-09-04)
- **No labels of any kind above the characters.** The birth years (Bethany 1981, Phil 1981,
  Evelyn 2015, Charlotte 2017) were given ONLY to decide how big to draw each of them — two
  adults at full height, two children shorter (`HERO_SCALE`). Never put them on screen.
  Cast order is [Bethany, Phil, Evelyn, Charlotte].
- The two children are drawn shorter (`HERO_SCALE` in `themes/types.ts`).
- Delaney is a **chihuahua x dachshund**: long, low, short legs, big upright ears.
- **No game names anywhere on screen** — the art has to identify the game.

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
- Another game = one file in `src/lib/brawl/themes/` + one line in `themes/index.ts`.
- Each theme owns its own `hud()`, `intro` card, and `impact` style; `special` is the optional
  screen-filling move (Golden Axe magic is the only user so far).
- Non-humanoid enemies are `sprite: "goomba" | "koopa" | "ghost"` on a FoeSpec, drawn by
  `drawCritter`. Never tint a downed enemy white — it renders as a solid slab.
- The between-games card sits at 0.72 * height on purpose: the page title covers the middle.
- Favicon is a **static** `src/app/icon.svg`. It was an `icon.tsx` using next/og, which broke a
  production build: rendering an emoji makes it fetch a font, and that fetch failed on Vercel.

## Landing route for this repo
Personal repo, no PR ceremony: commit + push to `main`, then verify the Vercel production deployment reaches `success` before reporting done.
