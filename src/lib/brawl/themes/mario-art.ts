// The tile and scenery art for World 1-1, kept apart from the simulation so
// both the level and the attract screen can draw from the same set.
import type { Frame } from "../bg";
import { rect } from "../bg";

export const TILE = 16;

export const SKY = "#5c94fc";
export const ORANGE = "#c84c0c";
export const ORANGE2 = "#e45c10";
export const BLACK = "#000000";
export const GREEN = "#00a800";
export const GREEN_L = "#58d854";
export const GREEN_D = "#007800";
export const WHITE = "#fcfcfc";
export const CLOUD_EDGE = "#7c88fc";
export const GOLD = ["#fac000", "#e09020", "#c86818"];

/** The cloud sprite; the same shape in green is a bush. */
export function puff(f: Frame, x: number, baseY: number, fill: string, edge: string, big: boolean) {
  const w = big ? 52 : 38;
  const base = big ? 6 : 5;
  const bumps: [number, number][] = big
    ? [[12, 10], [26, 15], [40, 11]]
    : [[9, 8], [19, 11], [29, 8]];

  const rows: [number, number, number][] = [];
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

/** A green mound with the two dark spots that give the hills their face. */
export function hill(f: Frame, x: number, baseY: number, width: number, height: number) {
  for (let i = 0; i < height; i += 2) {
    const t = i / height;
    const w = Math.max(TILE, Math.round(width * (1 - t * t * 0.82)));
    rect(f, x + (width - w) / 2, baseY - i - 2, w, 2, GREEN);
  }
  const spot = (sx: number, sy: number) => {
    rect(f, x + sx, baseY - sy, 4, 4, GREEN_D);
    rect(f, x + sx - 2, baseY - sy + 4, 8, 2, GREEN_D);
  };
  spot(Math.round(width * 0.26), 14);
  spot(Math.round(width * 0.58), 20);
}

/** Warp pipe: a barrel under a lip that overhangs both sides. */
export function pipe(f: Frame, x: number, baseY: number, tiles: number) {
  const h = tiles * TILE;
  const bx = x + 4;
  rect(f, bx, baseY - h + TILE, 24, h - TILE, GREEN);
  rect(f, bx + 1, baseY - h + TILE, 5, h - TILE, GREEN_L);
  rect(f, bx + 19, baseY - h + TILE, 4, h - TILE, GREEN_D);
  rect(f, bx, baseY - h + TILE, 1, h - TILE, BLACK);
  rect(f, bx + 23, baseY - h + TILE, 1, h - TILE, BLACK);
  rect(f, x, baseY - h, 32, TILE, GREEN);
  rect(f, x + 1, baseY - h + 1, 5, TILE - 2, GREEN_L);
  rect(f, x + 26, baseY - h + 1, 5, TILE - 2, GREEN_D);
  rect(f, x, baseY - h, 32, 1, BLACK);
  rect(f, x, baseY - h, 1, TILE, BLACK);
  rect(f, x + 31, baseY - h, 1, TILE, BLACK);
  rect(f, x, baseY - h + TILE - 1, 32, 1, BLACK);
}

/** Destructible brick: four courses of masonry in running bond. */
export function brick(f: Frame, x: number, y: number) {
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

/** Question block, cycling through three golds; `bumped` draws it spent. */
export function qblock(f: Frame, x: number, y: number, t: number, spent = false) {
  if (spent) {
    rect(f, x, y, TILE, TILE, "#a06020");
    rect(f, x, y, TILE, 1, "#c08040");
    rect(f, x, y, TILE, 1, BLACK);
    rect(f, x, y + TILE - 1, TILE, 1, BLACK);
    rect(f, x, y, 1, TILE, BLACK);
    rect(f, x + TILE - 1, y, 1, TILE, BLACK);
    return;
  }
  const gold = GOLD[Math.floor(t / 9) % 3];
  rect(f, x, y, TILE, TILE, gold);
  rect(f, x, y, TILE, 1, BLACK);
  rect(f, x, y + TILE - 1, TILE, 1, BLACK);
  rect(f, x, y, 1, TILE, BLACK);
  rect(f, x + TILE - 1, y, 1, TILE, BLACK);
  for (const [rx, ry] of [[2, 2], [12, 2], [2, 12], [12, 12]]) rect(f, x + rx, y + ry, 2, 2, BLACK);
  rect(f, x + 6, y + 4, 4, 2, WHITE);
  rect(f, x + 9, y + 5, 2, 3, WHITE);
  rect(f, x + 7, y + 7, 3, 2, WHITE);
  rect(f, x + 7, y + 9, 2, 2, WHITE);
  rect(f, x + 7, y + 12, 2, 2, WHITE);
}

/** One tile of ground: 16x8 masonry, laid in running bond. */
export function groundTile(f: Frame, x: number, y: number, top: boolean) {
  rect(f, x, y, TILE, TILE, ORANGE);
  if (top) rect(f, x, y, TILE, 1, BLACK);
  rect(f, x, y + 8, TILE, 1, BLACK);
  f.ctx.fillStyle = BLACK;
  f.ctx.fillRect(Math.round(x), y + 1, 1, 7);
  f.ctx.fillRect(Math.round(x + 8), y + 9, 1, 7);
}

/** A plain solid block, used for the staircases. */
export function stairTile(f: Frame, x: number, y: number) {
  rect(f, x, y, TILE, TILE, ORANGE);
  rect(f, x, y, TILE, 2, ORANGE2);
  rect(f, x, y, TILE, 1, BLACK);
  rect(f, x, y + TILE - 1, TILE, 1, BLACK);
  rect(f, x, y, 1, TILE, BLACK);
  rect(f, x + TILE - 1, y, 1, TILE, BLACK);
}

export function castle(f: Frame, x: number, groundY: number) {
  const body = 3 * TILE;
  const top = groundY - body;
  const w = 64;
  rect(f, x, top, w, body, ORANGE);
  for (let y = top; y < groundY; y += 8) rect(f, x, y, w, 1, BLACK);
  for (let c = 0; c < 4; c++) {
    f.ctx.fillStyle = BLACK;
    f.ctx.fillRect(Math.round(x + (c % 2 === 0 ? 0 : 8) + c * 16), top, 1, body);
  }
  for (let k = 0; k < 4; k++) rect(f, x + 2 + k * 16, top - 8, 12, 8, ORANGE);
  rect(f, x + 20, top - 24, 24, 24, ORANGE);
  for (let y = top - 24; y < top; y += 8) rect(f, x + 20, y, 24, 1, BLACK);
  for (let k = 0; k < 3; k++) rect(f, x + 21 + k * 9, top - 32, 6, 8, ORANGE);
  rect(f, x + 26, groundY - 22, 12, 22, BLACK);
  rect(f, x + 28, groundY - 25, 8, 4, BLACK);
  rect(f, x + 8, top - 20, 8, 10, BLACK);
  rect(f, x + 48, top - 20, 8, 10, BLACK);
}

export function flagpole(f: Frame, x: number, groundY: number, height: number) {
  rect(f, x, groundY - height, 2, height, "#bcbcbc");
  rect(f, x - 2, groundY - height - 6, 6, 5, GREEN);
  rect(f, x - 1, groundY - height - 5, 4, 3, GREEN_L);
  rect(f, x - 15, groundY - height + 4, 15, 11, GREEN_L);
  rect(f, x - 15, groundY - height + 4, 15, 1, WHITE);
  rect(f, x - 5, groundY - 5, 12, 5, ORANGE);
  rect(f, x - 5, groundY - 5, 12, 1, ORANGE2);
}
