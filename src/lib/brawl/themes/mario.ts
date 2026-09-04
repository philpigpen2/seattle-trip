// World 1-1. Super Mario Bros, NES: a 256-pixel-wide screen, a ground exactly
// two tiles deep, and everything standing on one line.
import { hash, rect, tile, type Frame } from "../bg";
import { hudText } from "../hud";
import type { Theme } from "./types";

const TILE = 16;

// NES palette entries actually used by World 1-1.
const SKY = "#5c94fc";
const ORANGE = "#c84c0c";
const ORANGE2 = "#e45c10";
const BLACK = "#000000";
const GREEN = "#00a800";
const GREEN_L = "#58d854";
const GREEN_D = "#007800";
const WHITE = "#fcfcfc";
const CLOUD_EDGE = "#7c88fc";
const GOLD = ["#fac000", "#e09020", "#c86818"];

const SKIN = "#fca044";
const SKIN2 = "#d07020";
const OVERALL = "#0058f8";
const OVERALL2 = "#0040b8";
const BOOT = "#7c3800";
const BOOT2 = "#5a2800";

function overalls(shirt: string, shirt2: string, accent: string) {
  return {
    skin: SKIN, skinShade: SKIN2,
    hair: "#7c3800", hair2: "#5a2800",
    shirt, shirt2, accent,
    belt: OVERALL2, pants: OVERALL, pants2: OVERALL2,
    shoes: BOOT, shoes2: BOOT2,
  };
}

/**
 * The cloud/bush sprite. In the real game these are the same tiles in two
 * palettes, so they are the same function here too.
 */
function puff(f: Frame, x: number, baseY: number, fill: string, edge: string, big: boolean) {
  // A flat base bar with three round bumps sitting on it — the SMB cloud, and
  // the same shape in green for the bushes.
  const w = big ? 52 : 38;
  const base = big ? 6 : 5;
  // Mostly bumps, sitting on a shallow bar — the bumps are the shape.
  const bumps: [number, number][] = big
    ? [[12, 10], [26, 15], [40, 11]]
    : [[9, 8], [19, 11], [29, 8]];

  const rows: [number, number, number][] = []; // x, width, y (top-down)
  for (let dy = 0; dy < base; dy++) rows.push([0, w, baseY - dy - 1]);
  for (const [cx, r] of bumps) {
    for (let dy = 0; dy <= r; dy++) {
      const hw = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)));
      if (hw < 1) continue;
      rows.push([cx - hw, hw * 2, baseY - base - dy]);
    }
  }

  f.ctx.fillStyle = edge;
  for (const [rx, rw, ry] of rows) f.ctx.fillRect(Math.round(x + rx - 1), Math.round(ry - 1), rw + 2, 3);
  f.ctx.fillStyle = fill;
  for (const [rx, rw, ry] of rows) f.ctx.fillRect(Math.round(x + rx), Math.round(ry), rw, 1);
  f.ctx.fillStyle = edge;
  f.ctx.fillRect(Math.round(x - 1), Math.round(baseY), w + 2, 1);
}

/** A stepped green mound with the two dark spots the originals have. */
function hill(f: Frame, x: number, baseY: number, width: number, height: number) {
  for (let i = 0; i < height; i += 2) {
    const t = i / height;
    const w = Math.max(TILE, Math.round(width * (1 - t * t * 0.82)));
    rect(f, x + (width - w) / 2, baseY - i - 2, w, 2, GREEN);
  }
  // The dark spots that give the hills their face.
  const spot = (sx: number, sy: number) => {
    rect(f, x + sx, baseY - sy, 4, 4, GREEN_D);
    rect(f, x + sx - 2, baseY - sy + 4, 8, 2, GREEN_D);
  };
  spot(Math.round(width * 0.26), 14);
  spot(Math.round(width * 0.58), 20);
}

/** Warp pipe: two tiles of barrel under a lip that overhangs both sides. */
function pipe(f: Frame, x: number, baseY: number, tiles: number) {
  const h = tiles * TILE;
  const bx = x + 4;
  // Barrel: 24 wide, sunk under a 32-wide lip.
  rect(f, bx, baseY - h + TILE, 24, h - TILE, GREEN);
  rect(f, bx + 1, baseY - h + TILE, 5, h - TILE, GREEN_L);
  rect(f, bx + 19, baseY - h + TILE, 4, h - TILE, GREEN_D);
  rect(f, bx, baseY - h + TILE, 1, h - TILE, BLACK);
  rect(f, bx + 23, baseY - h + TILE, 1, h - TILE, BLACK);
  // Lip.
  rect(f, x, baseY - h, 32, TILE, GREEN);
  rect(f, x + 1, baseY - h + 1, 5, TILE - 2, GREEN_L);
  rect(f, x + 26, baseY - h + 1, 5, TILE - 2, GREEN_D);
  rect(f, x, baseY - h, 32, 1, BLACK);
  rect(f, x, baseY - h, 1, TILE, BLACK);
  rect(f, x + 31, baseY - h, 1, TILE, BLACK);
  rect(f, x, baseY - h + TILE - 1, 32, 1, BLACK);
}

/** Destructible brick: four courses of masonry in running bond. */
function brick(f: Frame, x: number, y: number) {
  rect(f, x, y, TILE, TILE, ORANGE);
  rect(f, x, y, TILE, 1, ORANGE2);
  for (let r = 1; r < 4; r++) rect(f, x, y + r * 4, TILE, 1, BLACK);
  for (let r = 0; r < 4; r++) {
    const off = r % 2 === 0 ? 4 : 0;
    rect(f, x + off, y + r * 4 + 1, 1, 3, BLACK);
    rect(f, x + off + 8, y + r * 4 + 1, 1, 3, BLACK);
  }
  rect(f, x, y + TILE - 1, TILE, 1, BLACK);
}

/** Question block, cycling through three golds like the original. */
function qblock(f: Frame, x: number, y: number, t: number) {
  const gold = GOLD[Math.floor(t / 9) % 3];
  rect(f, x, y, TILE, TILE, gold);
  rect(f, x, y, TILE, 1, BLACK);
  rect(f, x, y + TILE - 1, TILE, 1, BLACK);
  rect(f, x, y, 1, TILE, BLACK);
  rect(f, x + TILE - 1, y, 1, TILE, BLACK);
  for (const [rx, ry] of [[2, 2], [12, 2], [2, 12], [12, 12]]) rect(f, x + rx, y + ry, 2, 2, BLACK);
  // The question mark itself.
  rect(f, x + 6, y + 4, 4, 2, WHITE);
  rect(f, x + 9, y + 5, 2, 3, WHITE);
  rect(f, x + 7, y + 7, 3, 2, WHITE);
  rect(f, x + 7, y + 9, 2, 2, WHITE);
  rect(f, x + 7, y + 12, 2, 2, WHITE);
}

export const mario: Theme = {
  id: "mario",
  intro: ["WORLD 1-1"],
  staging: "flat",
  floor: TILE * 2,
  targetW: 256,
  scroll: 0.7,
  style: "stomp",
  impact: "points",
  ink: WHITE,
  shadow: BLACK,

  hud(f, s) {
    const y = 6;
    const cols = [0.07, 0.35, 0.58, 0.82].map((c) => Math.round(f.W * c));
    hudText(f, "MARIO", cols[0], y, WHITE);
    hudText(f, String(s.score).padStart(6, "0"), cols[0], y + 9, WHITE);

    const step = Math.floor(s.t / 7) % 4;
    const cw = [4, 3, 1, 3][step];
    rect(f, cols[1] + 2 - Math.floor(cw / 2), y + 9, cw, 7, GOLD[0]);
    rect(f, cols[1] + 2 - Math.floor(cw / 2), y + 9, cw, 1, "#fce0a0");
    hudText(f, "X07", cols[1] + 8, y + 9, WHITE);

    hudText(f, "WORLD", cols[2], y, WHITE);
    hudText(f, "1-1", cols[2] + 9, y + 9, WHITE);

    hudText(f, "TIME", cols[3], y, WHITE);
    hudText(f, String(Math.max(0, s.timer)).padStart(3, "0"), cols[3] + 5, y + 9, WHITE);
  },

  heroes: [
    { hair: "long", pal: { ...overalls(GREEN, "#007000", WHITE), hair: "#a04000", hair2: "#c86020" } },
    { hair: "cap", moustache: true, pal: { ...overalls("#d82800", "#a81800", WHITE), hair: "#7c3800", hair2: "#d82800" } },
    { hair: "pony", pal: { ...overalls("#9b5cf0", "#7a41c4", "#fce0a0"), hair: "#7c3800", hair2: "#a05820" } },
    { hair: "bob", skirt: true, pal: { ...overalls("#f878b8", "#c04888", WHITE), hair: "#fcd8a0", hair2: "#e0b070" } },
  ],

  dog: { fur: "#e8a038", fur2: "#c07818", nose: BLACK, collar: "#d82800" },

  foes: [
    {
      hp: 1, speed: 0.5, weight: 6, sprite: "goomba",
      fighter: {
        hair: "bald",
        pal: {
          skin: "#e8a060", skinShade: "#c07840",
          hair: "#a85820", hair2: "#c86828",
          shirt: "#a85820", shirt2: "#c86828", accent: WHITE,
          belt: "#6b3a10", pants: "#6b3a10", pants2: "#542c0c",
          shoes: "#6b3a10", shoes2: "#542c0c",
        },
      },
    },
    {
      hp: 1, speed: 0.62, weight: 3, sprite: "koopa",
      fighter: {
        hair: "bald",
        pal: {
          skin: "#f8d878", skinShade: "#d0a840",
          hair: "#f8d878", hair2: "#d0a840",
          shirt: GREEN, shirt2: "#007000", accent: "#f8e0a0",
          belt: BLACK, pants: "#e45c10", pants2: "#b04000",
          shoes: "#e45c10", shoes2: "#b04000",
        },
      },
    },
    {
      hp: 1, speed: 0.78, weight: 2, sprite: "koopa",
      fighter: {
        hair: "bald",
        pal: {
          skin: "#f8d878", skinShade: "#d0a840",
          hair: "#f8d878", hair2: "#d0a840",
          shirt: "#d82800", shirt2: "#a81800", accent: "#f8e0a0",
          belt: BLACK, pants: "#e45c10", pants2: "#b04000",
          shoes: "#e45c10", shoes2: "#b04000",
        },
      },
    },
  ],

  sky(f) {
    rect(f, 0, 0, f.W, f.H, SKY);
  },

  far(f) {
    // Clouds drift slowly; bushes and hills sit on the ground line.
    const g = f.groundTop;
    const band = Math.max(24, f.horizon - 60);
    tile(f, 150, 0.35, 80, (x, i) => {
      const big = hash(i, 61) > 0.6;
      puff(f, x, 46 + Math.round(hash(i, 62) * band * 0.35), WHITE, CLOUD_EDGE, big);
      if (hash(i, 63) > 0.55) {
        puff(f, x + 88, 40 + Math.round(hash(i, 64) * band * 0.28), WHITE, CLOUD_EDGE, false);
      }
      if (f.horizon > 150 && hash(i, 77) > 0.4) {
        puff(f, x + 40, 40 + Math.round(hash(i, 78) * band * 0.8), WHITE, CLOUD_EDGE, hash(i, 79) > 0.7);
      }
    });
    tile(f, 168, 0.62, 100, (x, i) => {
      if (hash(i, 65) > 0.35) hill(f, x, g, 80, 48);
      if (hash(i, 66) > 0.62) hill(f, x + 104, g, 48, 32);
    });
  },

  mid(f) {
    const g = f.groundTop;
    tile(f, 108, 0.85, 70, (x, i) => {
      if (hash(i, 67) > 0.34) puff(f, x, g, GREEN, GREEN_D, hash(i, 68) > 0.62);
    });

    // The castle, once in a long while, sitting behind the hills.
    tile(f, 1100, 1, 110, (x, i) => {
      if (hash(i, 69) < 0.6) return;
      const body = 3 * TILE;
      const top = g - body;
      const w = 64;
      rect(f, x, top, w, body, ORANGE);
      for (let y = top; y < g; y += 8) rect(f, x, y, w, 1, BLACK);
      for (let c = 0; c < 4; c++) {
        f.ctx.fillStyle = BLACK;
        f.ctx.fillRect(Math.round(x + (c % 2 === 0 ? 0 : 8) + c * 16), top, 1, body);
      }
      // Crenellations along the wall top.
      for (let k = 0; k < 4; k++) rect(f, x + 2 + k * 16, top - 8, 12, 8, ORANGE);
      // Central tower.
      rect(f, x + 20, top - 24, 24, 24, ORANGE);
      for (let y = top - 24; y < top; y += 8) rect(f, x + 20, y, 24, 1, BLACK);
      for (let k = 0; k < 3; k++) rect(f, x + 21 + k * 9, top - 32, 6, 8, ORANGE);
      // Arched doorway and windows.
      rect(f, x + 26, g - 22, 12, 22, BLACK);
      rect(f, x + 28, g - 25, 8, 4, BLACK);
      rect(f, x + 8, top - 20, 8, 10, BLACK);
      rect(f, x + 48, top - 20, 8, 10, BLACK);
      rect(f, x + 28, top - 18, 8, 10, BLACK);
    });
  },

  ground(f) {
    const g = f.groundTop;

    // Pipes and the flagpole stand on the ground, behind the party.
    tile(f, 196, 1, 60, (x, i) => {
      if (hash(i, 70) < 0.5) return;
      pipe(f, x, g, 2 + Math.floor(hash(i, 71) * 3));
    });
    tile(f, 560, 1, 80, (x, i) => {
      if (hash(i, 72) < 0.5) return;
      const h = Math.max(4 * TILE, Math.min(9 * TILE, g - 26));
      rect(f, x, g - h, 2, h, "#bcbcbc");
      rect(f, x - 2, g - h - 6, 6, 5, GREEN);
      rect(f, x - 1, g - h - 5, 4, 3, GREEN_L);
      // Flag, hanging on the left of the pole.
      rect(f, x - 15, g - h + 4, 15, 11, GREEN_L);
      rect(f, x - 15, g - h + 4, 15, 1, WHITE);
      rect(f, x - 9, g - h + 8, 4, 4, GREEN_D);
      rect(f, x - 5, g - 5, 12, 5, ORANGE);
      rect(f, x - 5, g - 5, 12, 1, ORANGE2);
    });

    // Block rows, four tiles up.
    tile(f, 96, 1, 50, (x, i) => {
      const r = hash(i, 73);
      if (r < 0.45) return;
      const y = g - 4 * TILE - (r > 0.85 ? 4 * TILE : 0);
      const n = r > 0.7 ? 5 : 1;
      for (let k = 0; k < n; k++) {
        const bx = x + k * TILE;
        if (n === 1 || k % 2 === 1) qblock(f, bx, y, f.t);
        else brick(f, bx, y);
      }
    });

    // The ground: two tiles of masonry, and nothing else.
    rect(f, 0, g, f.W, f.H - g, ORANGE);
    rect(f, 0, g, f.W, 1, BLACK);
    const courses = Math.ceil((f.H - g) / 8);
    for (let r = 1; r < courses; r++) rect(f, 0, g + r * 8, f.W, 1, BLACK);
    tile(f, TILE, 1, 20, (x, i) => {
      for (let r = 0; r < courses; r++) {
        const off = r % 2 === 0 ? 0 : TILE / 2;
        f.ctx.fillStyle = BLACK;
        f.ctx.fillRect(Math.round(x + off), g + r * 8 + 1, 1, 7);
      }
      if (hash(i, 74) > 0.7) rect(f, x + 3, g + 3, 2, 2, ORANGE2);
      if (hash(i, 76) > 0.8) rect(f, x + 10, g + 11, 2, 2, ORANGE2);
    });
  },

  fore(f) {
    // Coins hanging over the block rows.
    tile(f, 96, 1, 50, (x, i) => {
      if (hash(i, 75) < 0.74) return;
      const y = f.groundTop - 5 * TILE - 4;
      const step = Math.floor(f.t / 7 + i) % 4;
      const w = [6, 4, 2, 4][step];
      rect(f, x + 5 - Math.floor(w / 2), y, w, 10, GOLD[0]);
      rect(f, x + 5 - Math.floor(w / 2), y, w, 1, "#fce0a0");
      rect(f, x + 5 - Math.floor(w / 2), y + 9, w, 1, "#c07000");
    });
  },
};
