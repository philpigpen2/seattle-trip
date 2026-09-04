// World 1-1 as a playable side-scroller: a tile map with real collision,
// gravity, jumping, pits, goombas that squash, and blocks that pay out coins.
import type { Frame } from "../bg";
import { rect } from "../bg";
import { drawText } from "../font";
import type { CustomStage } from "./types";
import {
  BLACK, CLOUD_EDGE, GOLD, GREEN, GREEN_D, ORANGE, SKY, TILE, WHITE,
  brick, castle, flagpole, groundTile, hill, pipe, puff, qblock, stairTile,
} from "./mario-art";

const ROWS = 15;
const GROUND_ROW = 13; // rows 13 and 14 are the ground band
const COLS = 168;

/** '.' air  'X' ground  'B' brick  '?' block  'S' stair  'p' pipe */
type Cell = "." | "X" | "B" | "?" | "S" | "p";

type Level = {
  grid: Cell[][];
  /** Pipe left-hand columns mapped to their height in tiles. */
  pipes: Map<number, number>;
  goombas: number[];
  koopas: number[];
  hills: [number, boolean][];
  bushes: number[];
  clouds: [number, number, boolean][];
  flag: number;
  keep: number;
};

/** Lays out the opening of World 1-1: blocks, pipes, pits, stairs, flagpole. */
function buildLevel(): Level {
  const grid: Cell[][] = Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill("."));
  const pipes = new Map<number, number>();
  const goombas: number[] = [];
  const koopas: number[] = [];
  const hills: [number, boolean][] = [];
  const bushes: number[] = [];
  const clouds: [number, number, boolean][] = [];

  const ground = (from: number, to: number) => {
    for (let c = from; c <= to; c++) {
      grid[GROUND_ROW][c] = "X";
      grid[GROUND_ROW + 1][c] = "X";
    }
  };
  const put = (col: number, row: number, cell: Cell) => {
    if (col >= 0 && col < COLS) grid[row][col] = cell;
  };
  const addPipe = (col: number, tiles: number) => {
    pipes.set(col, tiles);
    for (let t = 0; t < tiles; t++) {
      put(col, GROUND_ROW - 1 - t, "p");
      put(col + 1, GROUND_ROW - 1 - t, "p");
    }
  };

  ground(0, COLS - 1);
  // Two pits, the way 1-1 has them.
  for (const [a, b] of [[69, 70], [86, 87], [153, 154]]) {
    for (let c = a; c <= b; c++) {
      grid[GROUND_ROW][c] = ".";
      grid[GROUND_ROW + 1][c] = ".";
    }
  }

  // The lone question block, then the famous row of five.
  put(16, 9, "?");
  put(20, 9, "B");
  put(21, 9, "?");
  put(22, 9, "B");
  put(23, 9, "?");
  put(24, 9, "B");
  put(22, 5, "?");

  // Pipes of increasing height.
  addPipe(28, 2);
  addPipe(38, 3);
  addPipe(46, 4);
  addPipe(57, 4);

  // Brick rows after the first pit.
  for (let c = 77; c <= 79; c++) put(c, 9, "B");
  put(80, 9, "?");
  for (let c = 81; c <= 83; c++) put(c, 9, "B");
  for (let c = 91; c <= 92; c++) put(c, 5, "B");
  put(93, 5, "?");
  put(94, 5, "B");

  // Staircase up, a gap, then staircase down.
  for (let s = 0; s < 4; s++) {
    for (let r = 0; r <= s; r++) put(100 + s, GROUND_ROW - 1 - r, "S");
  }
  for (let s = 0; s < 4; s++) {
    for (let r = 0; r <= 3 - s; r++) put(106 + s, GROUND_ROW - 1 - r, "S");
  }
  for (let s = 0; s < 5; s++) {
    for (let r = 0; r <= s; r++) put(120 + s, GROUND_ROW - 1 - r, "S");
  }

  addPipe(112, 3);
  addPipe(133, 2);
  for (let c = 138; c <= 141; c++) put(c, 9, "B");
  put(140, 9, "?");

  goombas.push(15, 33, 52, 53, 74, 90, 97, 118, 130, 146, 160);
  koopas.push(43, 84, 126);

  for (let c = 4; c < COLS; c += 24) hills.push([c, (c / 24) % 2 === 0]);
  for (let c = 12; c < COLS; c += 17) bushes.push(c);
  for (let c = 6; c < COLS; c += 13) clouds.push([c, 1 + ((c * 7) % 4), c % 3 === 0]);

  return { grid, pipes, goombas, koopas, hills, bushes, clouds, flag: 148, keep: 152 };
}

const LEVEL = buildLevel();

const wrapCol = (c: number) => ((c % COLS) + COLS) % COLS;

function solidAt(col: number, row: number): boolean {
  if (row < 0 || row >= ROWS) return false;
  const cell = LEVEL.grid[row][wrapCol(col)];
  return cell !== ".";
}

/* ------------------------------------------------------------------ cast - */

type Pal = { cap: string; shirt: string; overall: string; skin: string; hair: string };

const CAST: Pal[] = [
  { cap: "#00a800", shirt: "#00a800", overall: "#0058f8", skin: "#fca044", hair: "#8a3a1e" },
  { cap: "#d82800", shirt: "#d82800", overall: "#0058f8", skin: "#fca044", hair: "#7c3800" },
  { cap: "#9b5cf0", shirt: "#9b5cf0", overall: "#0058f8", skin: "#fca044", hair: "#6b4423" },
  { cap: "#f878b8", shirt: "#f878b8", overall: "#0058f8", skin: "#fca044", hair: "#f0d488" },
];
const DOG = { fur: "#a8603a", fur2: "#8a4a2a" };

type Actor = {
  x: number;
  y: number;
  /** Where they were before this frame moved them. */
  py: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  onGround: boolean;
  face: 1 | -1;
  frame: number;
  flash: number;
};

type Foe = Actor & { kind: "goomba" | "koopa"; alive: boolean; flat: number; col: number };
type Pop = { x: number; y: number; life: number; text: string };
type Coin = { x: number; y: number; vy: number; life: number };

/* ------------------------------------------------------------- the sprite - */

/**
 * A plumber. Small ones are a head and a pair of dungarees; the grown-ups get
 * the full two-tile sprite.
 */
function drawPlumber(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  big: boolean,
  p: Pal,
  frame: number,
  face: 1 | -1,
  state: "stand" | "run" | "jump",
) {
  const rects: [number, number, number, number, string][] = [];
  const W = big ? 16 : 12;
  const R = (rx: number, ry: number, rw: number, rh: number, c: string) => rects.push([rx, ry, rw, rh, c]);

  if (big) {
    // Cap with a brim, a wide face, moustache, dungarees and big shoes.
    R(3, 0, 10, 3, p.cap);
    R(2, 2, 12, 2, p.cap);
    R(9, 3, 7, 2, p.cap);
    R(3, 4, 3, 5, p.hair);
    R(5, 4, 9, 8, p.skin);
    R(10, 6, 2, 3, BLACK);
    R(13, 7, 1, 3, p.skin);
    R(5, 9, 8, 2, p.hair);
    R(5, 12, 8, 2, p.skin);
    R(3, 13, 10, 6, p.shirt);
    R(0, 14, 3, 5, p.shirt);
    R(13, 14, 3, 5, p.shirt);
    R(0, 18, 3, 3, WHITE);
    R(13, 18, 3, 3, WHITE);
    R(4, 15, 8, 8, p.overall);
    R(5, 13, 2, 3, p.overall);
    R(9, 13, 2, 3, p.overall);
    R(4, 16, 2, 2, GOLD[0]);
    R(10, 16, 2, 2, GOLD[0]);
    if (state === "jump") {
      R(3, 22, 5, 4, p.overall);
      R(9, 21, 5, 4, p.overall);
      R(1, 25, 7, 3, "#7c3800");
      R(10, 24, 6, 3, "#7c3800");
    } else if (state === "run" && frame % 2 === 0) {
      R(2, 22, 5, 4, p.overall);
      R(9, 22, 5, 4, p.overall);
      R(0, 25, 7, 3, "#7c3800");
      R(9, 25, 7, 3, "#7c3800");
    } else {
      R(4, 22, 4, 4, p.overall);
      R(9, 22, 4, 4, p.overall);
      R(2, 25, 6, 3, "#7c3800");
      R(8, 25, 6, 3, "#7c3800");
    }
  } else {
    R(2, 0, 8, 2, p.cap);
    R(1, 1, 10, 2, p.cap);
    R(7, 2, 5, 2, p.cap);
    R(2, 3, 2, 3, p.hair);
    R(3, 3, 7, 5, p.skin);
    R(8, 4, 1, 2, BLACK);
    R(4, 6, 5, 1, p.hair);
    R(2, 8, 8, 4, p.overall);
    R(2, 8, 8, 1, p.shirt);
    R(0, 8, 2, 3, p.shirt);
    R(10, 8, 2, 3, p.shirt);
    R(3, 9, 1, 1, GOLD[0]);
    R(8, 9, 1, 1, GOLD[0]);
    if (state === "jump") {
      R(0, 12, 5, 4, "#7c3800");
      R(8, 11, 4, 4, "#7c3800");
    } else if (state === "run" && frame % 2 === 0) {
      R(0, 12, 5, 4, "#7c3800");
      R(7, 12, 5, 4, "#7c3800");
    } else {
      R(1, 12, 4, 4, "#7c3800");
      R(7, 12, 4, 4, "#7c3800");
    }
  }

  const bx = Math.round(x);
  const by = Math.round(y);
  for (const [rx, ry, rw, rh, c] of rects) {
    const sx = face === -1 ? bx + W - rx - rw : bx + rx;
    ctx.fillStyle = c;
    ctx.fillRect(sx, by + ry, rw, rh);
  }
}

function drawGoomba(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, flat: boolean) {
  const cap = "#a85820";
  const face = "#e8a060";
  const foot = "#6b3a10";
  const bx = Math.round(x);
  const by = Math.round(y);
  const R = (rx: number, ry: number, rw: number, rh: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(bx + rx, by + ry, rw, rh);
  };
  if (flat) {
    R(0, 12, 16, 4, cap);
    R(3, 13, 3, 2, face);
    R(10, 13, 3, 2, face);
    return;
  }
  R(5, 0, 6, 1, "#c86828");
  R(3, 1, 10, 1, cap);
  R(1, 2, 14, 7, cap);
  R(0, 4, 1, 4, cap);
  R(15, 4, 1, 4, cap);
  R(1, 9, 14, 4, face);
  R(3, 6, 3, 4, WHITE);
  R(10, 6, 3, 4, WHITE);
  R(5, 7, 1, 3, BLACK);
  R(10, 7, 1, 3, BLACK);
  R(2, 5, 4, 1, BLACK);
  R(4, 6, 2, 1, BLACK);
  R(10, 5, 4, 1, BLACK);
  R(10, 6, 2, 1, BLACK);
  const s = frame & 1;
  R(s ? 0 : 1, 13, 6, 3, foot);
  R(s ? 10 : 9, 13, 6, 3, foot);
}

function drawKoopa(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, face: 1 | -1) {
  const skin = "#f8d878";
  const skin2 = "#d0a840";
  const belly = "#f8e0a0";
  const rects: [number, number, number, number, string][] = [
    // Head, beak and eye.
    [7, 0, 7, 7, skin],
    [13, 3, 4, 3, skin2],
    [16, 4, 1, 1, BLACK],
    [10, 2, 2, 3, BLACK],
    [7, 6, 5, 2, skin2],
    // Shell over the back, cream plastron down the front.
    [1, 7, 12, 13, GREEN],
    [2, 8, 10, 2, GREEN_D],
    [3, 12, 3, 3, GREEN_D],
    [7, 15, 3, 3, GREEN_D],
    [11, 8, 5, 12, belly],
    [11, 8, 5, 1, skin2],
    // Arm.
    [8, 11, 3, 4, skin],
  ];
  const s = frame & 1;
  rects.push([3 + (s ? 2 : 0), 20, 5, 4, "#e45c10"]);
  rects.push([9 - (s ? 2 : 0), 20, 5, 4, "#b04000"]);
  const bx = Math.round(x);
  const by = Math.round(y);
  for (const [rx, ry, rw, rh, c] of rects) {
    const sx = face === -1 ? bx + 18 - rx - rw : bx + rx;
    ctx.fillStyle = c;
    ctx.fillRect(sx, by + ry, rw, rh);
  }
}

function drawDog(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, face: 1 | -1) {
  const rects: [number, number, number, number, string][] = [
    // Long, low body with a curl of tail and two upright ears.
    [2, 5, 11, 5, DOG.fur],
    [2, 5, 11, 1, DOG.fur2],
    [0, 3, 2, 3, DOG.fur],
    [1, 2, 1, 2, DOG.fur2],
    [11, 2, 5, 5, DOG.fur],
    [15, 4, 3, 2, DOG.fur2],
    [17, 4, 1, 1, BLACK],
    [13, 3, 1, 1, BLACK],
    [10, 0, 2, 3, DOG.fur2],
    [13, -1, 2, 4, DOG.fur],
  ];
  const s = frame & 1;
  rects.push([2 + (s ? 1 : 0), 10, 2, 3, DOG.fur2]);
  rects.push([9 - (s ? 1 : 0), 10, 2, 3, DOG.fur]);
  const bx = Math.round(x);
  const by = Math.round(y);
  for (const [rx, ry, rw, rh, c] of rects) {
    const sx = face === -1 ? bx + 18 - rx - rw : bx + rx;
    ctx.fillStyle = c;
    ctx.fillRect(sx, by + ry, rw, rh);
  }
}

/* -------------------------------------------------------------- the stage - */

export function createMario(): CustomStage {
  let W = 0;
  let H = 0;
  let originY = 0;
  let cam = 0;
  let t = 0;
  let points = 0;
  let coinCount = 0;
  let playerIndex = 1;
  let taken = false;
  let lives = 3;
  let phase: "play" | "dead" | "clear" | "over" = "play";
  let phaseTimer = 0;
  const deaths = { pit: 0, foe: 0 };
  let bestCol = 0;
  let holdLeft = false;
  let holdRight = false;
  let jumpHeld = false;

  let party: Actor[] = [];
  let dog: Actor = null as unknown as Actor;
  let foes: Foe[] = [];
  let pops: Pop[] = [];
  let coins: Coin[] = [];
  const spent = new Set<number>();
  const bumped = new Map<number, number>();
  let nextSpawnCol = 0;

  const groundY = () => originY + GROUND_ROW * TILE;

  function makeActor(x: number, big: boolean): Actor {
    const top = groundY() - (big ? 28 : 16);
    return {
      x,
      y: top,
      py: top,
      vx: 0,
      vy: 0,
      w: big ? 14 : 11,
      h: big ? 28 : 16,
      onGround: true,
      face: 1,
      frame: 0,
      flash: 0,
    };
  }

  /** Puts everyone back at the start of the course. */
  function restartLevel(fresh: boolean) {
    party = [0, 1, 2, 3].map((i) => makeActor(40 + i * 22, i < 2));
    party[2].h = 20;
    party[2].w = 12;
    party[3].h = 16;
    dog = makeActor(20, false);
    dog.h = 13;
    dog.w = 14;
    cam = 0;
    foes = [];
    pops = [];
    coins = [];
    spent.clear();
    bumped.clear();
    nextSpawnCol = 0;
    phase = "play";
    phaseTimer = 0;
    if (fresh) {
      points = 0;
      coinCount = 0;
      lives = 3;
    }
  }

  function reset(w: number, h: number) {
    W = w;
    H = h;
    // The level sits on the bottom of the screen with sky above it.
    originY = H - ROWS * TILE;
    cam = 0;
    party = [0, 1, 2, 3].map((i) => makeActor(40 + i * 22, i < 2));
    party[2].h = 20;
    party[2].w = 12;
    party[3].h = 16;
    dog = makeActor(20, false);
    dog.h = 13;
    dog.w = 14;
    t = 0;
    taken = false;
    holdLeft = holdRight = jumpHeld = false;
    restartLevel(true);
  }

  /* --------------------------------------------------------------- physics */

  function moveActor(a: Actor, gravity = 0.5) {
    a.py = a.y;
    a.vy = Math.min(7.5, a.vy + gravity);

    // Horizontal, then resolve against anything solid.
    a.x += a.vx;
    const top = a.y;
    const bottom = a.y + a.h - 1;
    const r0 = Math.floor((top - originY) / TILE);
    const r1 = Math.floor((bottom - originY) / TILE);
    for (let r = r0; r <= r1; r++) {
      if (a.vx > 0) {
        const col = Math.floor((a.x + a.w) / TILE);
        if (solidAt(col, r)) {
          a.x = col * TILE - a.w - 0.01;
          a.vx = 0;
        }
      } else if (a.vx < 0) {
        const col = Math.floor(a.x / TILE);
        if (solidAt(col, r)) {
          a.x = (col + 1) * TILE + 0.01;
          a.vx = 0;
        }
      }
    }

    // Vertical.
    a.y += a.vy;
    a.onGround = false;
    const c0 = Math.floor(a.x / TILE);
    const c1 = Math.floor((a.x + a.w - 1) / TILE);
    for (let c = c0; c <= c1; c++) {
      if (a.vy > 0) {
        const row = Math.floor((a.y + a.h - originY) / TILE);
        if (solidAt(c, row)) {
          a.y = originY + row * TILE - a.h;
          a.vy = 0;
          a.onGround = true;
        }
      } else if (a.vy < 0) {
        const row = Math.floor((a.y - originY) / TILE);
        if (solidAt(c, row)) {
          a.y = originY + (row + 1) * TILE;
          a.vy = 0;
          // A block taken from underneath pays out.
          const cell = LEVEL.grid[row]?.[wrapCol(c)];
          const key = row * COLS + wrapCol(c);
          if (cell === "?" && !spent.has(key)) {
            spent.add(key);
            coinCount++;
            points += 200;
            coins.push({ x: wrapCol(c) * TILE + 4, y: originY + row * TILE - 12, vy: -3.2, life: 34 });
          }
          if (cell === "?" || cell === "B") bumped.set(key, 8);
        }
      }
    }

    if (a.onGround) a.frame = Math.floor(Math.abs(a.x) / 6) & 3;
    if (a.flash > 0) a.flash--;
  }

  /** Is there a hole or a wall just in front of this actor? */
  function needsJump(a: Actor): boolean {
    const row = Math.floor((a.y + a.h + 2 - originY) / TILE);
    // Something to climb: look far enough ahead to still be moving forward.
    for (const reach of [10, 20, 28]) {
      const ahead = Math.floor((a.x + a.w + reach) / TILE);
      const wallRow = Math.floor((a.y + a.h - 6 - originY) / TILE);
      if (solidAt(ahead, wallRow)) return true;
    }
    // A hole to clear.
    const gap = Math.floor((a.x + a.w + 8) / TILE);
    if (!solidAt(gap, row) && !solidAt(gap + 1, row)) return true;
    return false;
  }

  /**
   * Is there an enemy at the distance where a hop would come down on its head?
   * Jumping when it is already touching only gets you hit, which is what used
   * to happen.
   */
  function foeAhead(a: Actor): boolean {
    return foes.some((foe) => {
      if (!foe.alive) return false;
      const gap = foe.x - (a.x + a.w);
      // Jump early and often: landing past one is as good as landing on it.
      return gap > -6 && gap < 62 && Math.abs(foe.y + foe.h - (a.y + a.h)) < 22;
    });
  }

  function runRight(a: Actor, speed: number) {
    // Air control matters: without it a jump against a wall goes straight up
    // and lands in the same place, over and over.
    a.vx += (speed - a.vx) * (a.onGround ? 0.18 : 0.09);
    if (speed > 0.15) a.face = 1;
    else if (Math.abs(a.vx) < 0.1) a.vx = 0;
    // Jump a wall, a hole, or something worth landing on.
    if (a.onGround && speed > 0.3) {
      if (needsJump(a)) a.vy = -8.6;
      else if (foeAhead(a)) a.vy = -7.6; // over it, or down on its head
    }
  }

  function spawnAhead() {
    const edge = Math.floor((cam + W + 32) / TILE);
    while (nextSpawnCol <= edge) {
      const col = wrapCol(nextSpawnCol);
      const worldX = nextSpawnCol * TILE;
      if (LEVEL.goombas.includes(col)) {
        foes.push({
          kind: "goomba", alive: true, flat: 0, col,
          x: worldX, y: groundY() - 16, py: groundY() - 16, vx: -0.42, vy: 0, w: 15, h: 16,
          onGround: true, face: -1, frame: 0, flash: 0,
        });
      }
      if (LEVEL.koopas.includes(col)) {
        foes.push({
          kind: "koopa", alive: true, flat: 0, col,
          x: worldX, y: groundY() - 25, py: groundY() - 25, vx: -0.34, vy: 0, w: 15, h: 25,
          onGround: true, face: -1, frame: 0, flash: 0,
        });
      }
      nextSpawnCol++;
    }
  }

  function step() {
    t++;

    if (phase !== "play") {
      if (--phaseTimer > 0) return;
      if (phase === "dead") {
        lives--;
        if (lives <= 0) {
          phase = "over";
          phaseTimer = 200;
        } else {
          restartLevel(false);
        }
      } else {
        // One course to finish; finishing it starts it again.
        restartLevel(phase === "over");
      }
      return;
    }

    const lead = party[taken ? playerIndex : 0];

    for (let i = 0; i < party.length; i++) {
      const a = party[i];
      if (taken && i === playerIndex) {
        // Under a person's control: only what they ask for.
        const accel = a.onGround ? 0.36 : 0.2;
        if (holdRight) {
          a.vx = Math.min(2.6, a.vx + accel);
          a.face = 1;
        } else if (holdLeft) {
          a.vx = Math.max(-2.6, a.vx - accel);
          a.face = -1;
        } else {
          a.vx *= a.onGround ? 0.78 : 0.96;
          if (Math.abs(a.vx) < 0.05) a.vx = 0;
        }
        if (jumpHeld && a.onGround) a.vy = -8.8;
        if (!jumpHeld && a.vy < -3.4) a.vy = -3.4; // short hop when tapped
      } else if (!taken && i === 0) {
        // One of them sets the pace for the attract loop.
        runRight(a, 1.75);
      } else {
        // The others keep station a little way behind, so they run as a line
        // rather than a heap — and stop when the player stops.
        const anchor = taken ? lead : party[0];
        const spot = anchor.x - 22 - i * 19;
        runRight(a, Math.max(0, Math.min(2.5, (spot - a.x) * 0.055)));
      }
      moveActor(a);
      if (a.y > originY + ROWS * TILE + 40) {
        if (a === lead && taken) {
          // A life, but only when somebody is actually playing: the attract
          // loop should run the course, not die in front of you.
          phase = "dead";
          phaseTimer = 90;
          deaths.pit++;
          return;
        }
        // The others just climb back out.
        a.x = cam + 24;
        a.y = groundY() - a.h - 40;
        a.vy = 0;
        a.flash = 60;
      }
    }

    // Delaney trots along with them.
    const pacer = taken ? lead : party[0];
    runRight(dog, Math.max(0, Math.min(2.7, (pacer.x - 96 - dog.x) * 0.06)));
    moveActor(dog);
    if (dog.y > originY + ROWS * TILE + 40) {
      dog.x = cam + 16;
      dog.y = groundY() - dog.h - 40;
      dog.vy = 0;
    }

    spawnAhead();

    for (const foe of foes) {
      if (!foe.alive) {
        foe.flat--;
        continue;
      }
      foe.frame = Math.floor(t / 8) & 3;
      // Turn round at a wall or the edge of a ledge.
      const ahead = Math.floor((foe.vx < 0 ? foe.x - 2 : foe.x + foe.w + 2) / TILE);
      const footRow = Math.floor((foe.y + foe.h + 2 - originY) / TILE);
      const bodyRow = Math.floor((foe.y + foe.h - 6 - originY) / TILE);
      if (solidAt(ahead, bodyRow) || !solidAt(ahead, footRow)) {
        foe.vx = -foe.vx;
        foe.face = foe.vx < 0 ? -1 : 1;
      }
      moveActor(foe);

      for (const a of [...party, dog]) {
        if (a.flash > 0) continue;
        const hit =
          a.x + a.w > foe.x && a.x < foe.x + foe.w && a.y + a.h > foe.y && a.y < foe.y + foe.h;
        if (!hit) continue;
        // Coming down on its head counts; walking into it does not. Test
        // against where they were last frame — landing on one puts them on the
        // ground tile underneath, so `onGround` is already true by now.
        if (a.py + a.h <= foe.y + 8 && a.y + a.h > foe.y) {
          // Landed on its head.
          foe.alive = false;
          foe.flat = 34;
          a.vy = -4.6;
          points += 100;
          pops.push({ x: foe.x + 8, y: foe.y - 4, life: 34, text: "100" });
        } else if (a === lead && taken) {
          // Walked into while playing: a life.
          phase = "dead";
          phaseTimer = 90;
          deaths.foe++;
          return;
        } else {
          a.vx = -1.6 * (foe.x > a.x ? 1 : -1);
          a.vy = -2.2;
          a.flash = 70;
        }
      }
    }
    foes = foes.filter((f) => (f.alive ? f.x > cam - 80 : f.flat > 0));

    for (const c of coins) {
      c.y += c.vy;
      c.vy += 0.32;
      c.life--;
    }
    coins = coins.filter((c) => c.life > 0);
    for (const p of pops) {
      p.y -= 0.5;
      p.life--;
    }
    pops = pops.filter((p) => p.life > 0);
    for (const [k, v] of bumped) {
      if (v <= 1) bumped.delete(k);
      else bumped.set(k, v - 1);
    }

    bestCol = Math.max(bestCol, Math.round(lead.x / TILE));

    // Reaching the flagpole finishes the course.
    if (lead.x > LEVEL.flag * TILE) {
      phase = "clear";
      phaseTimer = 200;
      points += 1000;
      return;
    }

    // The camera follows whoever is being played, and never backs up.
    const want = lead.x - W * 0.36;
    if (want > cam) cam = want;
    else if (lead.x - cam < 24) cam = lead.x - 24;
  }

  /* ----------------------------------------------------------------- paint */

  function draw(f: Frame) {
    const ctx = f.ctx;
    const g = groundY();
    ctx.fillStyle = SKY;
    ctx.fillRect(0, 0, W, H);

    const firstCol = Math.floor(cam / TILE) - 1;
    const lastCol = Math.ceil((cam + W) / TILE) + 1;
    const sx = (worldX: number) => Math.round(worldX - cam);

    // Sky furniture. Clouds drift more slowly than the ground.
    for (const [col, band, big] of LEVEL.clouds) {
      for (let pass = -1; pass <= Math.ceil(lastCol / COLS); pass++) {
        const wx = (col + pass * COLS) * TILE;
        const px = Math.round(wx - cam * 0.5);
        if (px < -70 || px > W + 20) continue;
        puff(f, px, originY + band * 22 + 26, WHITE, CLOUD_EDGE, big);
      }
    }
    for (const [col, big] of LEVEL.hills) {
      for (let pass = -1; pass <= Math.ceil(lastCol / COLS); pass++) {
        const px = sx((col + pass * COLS) * TILE);
        if (px < -90 || px > W + 20) continue;
        hill(f, px, g, big ? 80 : 48, big ? 48 : 32);
      }
    }
    for (const col of LEVEL.bushes) {
      for (let pass = -1; pass <= Math.ceil(lastCol / COLS); pass++) {
        const px = sx((col + pass * COLS) * TILE);
        if (px < -60 || px > W + 20) continue;
        puff(f, px, g, GREEN, GREEN_D, col % 3 === 0);
      }
    }
    for (let pass = -1; pass <= Math.ceil(lastCol / COLS); pass++) {
      const px = sx((LEVEL.flag + pass * COLS) * TILE);
      if (px > -40 && px < W + 40) flagpole(f, px, g, 9 * TILE);
      const cx = sx((LEVEL.keep + pass * COLS) * TILE);
      if (cx > -90 && cx < W + 40) castle(f, cx, g);
    }

    // Tiles.
    for (let c = firstCol; c <= lastCol; c++) {
      const col = wrapCol(c);
      const px = sx(c * TILE);
      for (let r = 0; r < ROWS; r++) {
        const cell = LEVEL.grid[r][col];
        if (cell === ".") continue;
        const key = r * COLS + col;
        const lift = bumped.get(key) ? 3 : 0;
        const py = originY + r * TILE - lift;
        if (cell === "X") groundTile(f, px, py, r === GROUND_ROW);
        else if (cell === "S") stairTile(f, px, py);
        else if (cell === "B") brick(f, px, py);
        else if (cell === "?") qblock(f, px, py, t, spent.has(key));
      }
      // Pipes are drawn whole so the lip overhangs properly.
      const tall = LEVEL.pipes.get(col);
      if (tall) pipe(f, px, g, tall);
    }

    // Coins bouncing out of blocks.
    for (const c of coins) {
      const px = sx(c.x);
      const step = Math.floor(c.life / 4) % 4;
      const w = [6, 4, 2, 4][step];
      rect(f, px + 3 - w / 2, c.y, w, 10, GOLD[0]);
      rect(f, px + 3 - w / 2, c.y, w, 1, "#fce0a0");
    }

    for (const foe of foes) {
      const px = sx(foe.x);
      if (px < -24 || px > W + 24) continue;
      if (foe.kind === "goomba") drawGoomba(ctx, px, foe.y, foe.frame, !foe.alive);
      else if (foe.alive) drawKoopa(ctx, px, foe.y, foe.frame, foe.face);
      else drawGoomba(ctx, px, foe.y, foe.frame, true);
    }

    drawDog(ctx, sx(dog.x), dog.y, Math.floor(t / 5) & 3, dog.face);

    for (let i = 0; i < party.length; i++) {
      const a = party[i];
      if (a.flash > 0 && Math.floor(a.flash / 4) % 2 === 0) continue;
      const state = !a.onGround ? "jump" : Math.abs(a.vx) > 0.25 ? "run" : "stand";
      drawPlumber(ctx, sx(a.x), a.y, a.h > 20, CAST[i], a.frame, a.face, state);
      // A small marker over whoever is being played.
      if (taken && i === playerIndex) {
        rect(f, sx(a.x) + 5, a.y - 7, 4, 2, WHITE);
        rect(f, sx(a.x) + 6, a.y - 5, 2, 2, WHITE);
      }
    }

    for (const p of pops) drawText(ctx, p.text, Math.round(sx(p.x)), Math.round(p.y), WHITE, { align: "center" });

    // Lives, and the words that stop the course.
    drawText(ctx, "x" + Math.max(0, lives), 6, originY + 4 * TILE, WHITE);
    const banner =
      phase === "clear" ? "COURSE CLEAR" : phase === "over" ? "GAME OVER" : phase === "dead" ? "" : null;
    if (banner) {
      const bx = Math.round(W / 2);
      const by = Math.round(originY + 6 * TILE);
      const bw = banner.length * 12;
      ctx.fillStyle = "#000000";
      ctx.fillRect(bx - bw / 2 - 5, by - 5, bw + 10, 22);
      drawText(ctx, banner, bx, by, phase === "over" ? "#e45c10" : WHITE, { align: "center", scale: 2 });
    }
    void ORANGE;
    void BLACK;
  }

  return {
    reset,
    step,
    draw,
    score: () => points,

    /** Internals, for the headless play-tests. */
    debug: () => ({
      cam: Math.round(cam),
      col: Math.round(party[0].x / TILE),
      party: party.map((a) => `${Math.round(a.x)},${Math.round(a.y)}${a.onGround ? "g" : "a"}`).join(" "),
      foes: foes.length,
      taken, phase, lives, bestCol, deaths: `pit ${deaths.pit} foe ${deaths.foe}`,
    }),
    coins: () => coinCount,
    setPlayer(index: number) {
      playerIndex = Math.max(0, Math.min(party.length - 1, index));
      holdLeft = holdRight = jumpHeld = false;
    },
    input(dir) {
      taken = true;
      if (dir === 0) {
        holdRight = true;
        holdLeft = false;
      } else if (dir === 2) {
        holdLeft = true;
        holdRight = false;
      } else if (dir === 3) {
        jumpHeld = true;
      } else {
        holdLeft = holdRight = false;
      }
    },
    release() {
      holdLeft = holdRight = jumpHeld = false;
    },
  } as CustomStage & { coins: () => number };
}
