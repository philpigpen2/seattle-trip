// Small helpers so each game can draw its own authentic status display.
import type { Frame } from "./bg";
import { drawText, textWidth, type TextOpts } from "./font";

export function hudText(
  f: Frame,
  text: string,
  x: number,
  y: number,
  color: string,
  opts: TextOpts = {},
) {
  drawText(f.ctx, text, x, y, color, opts);
}

export function width(text: string, scale = 1) {
  return textWidth(text, scale);
}

/** A segmented energy bar of the kind every 80s brawler put on screen. */
export function bar(
  f: Frame,
  x: number,
  y: number,
  w: number,
  h: number,
  pct: number,
  fill: string,
  fill2: string,
  back = "#2a1a2e",
  edge = "#000000",
) {
  const ctx = f.ctx;
  ctx.fillStyle = edge;
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = back;
  ctx.fillRect(x, y, w, h);
  const n = Math.max(0, Math.min(w, Math.round(w * pct)));
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, n, h);
  ctx.fillStyle = fill2;
  ctx.fillRect(x, y, n, 1);
}

/** A stack of small life pips. */
export function lives(f: Frame, x: number, y: number, n: number, color: string) {
  for (let i = 0; i < n; i++) {
    f.ctx.fillStyle = color;
    f.ctx.fillRect(x + i * 5, y, 3, 3);
    f.ctx.fillRect(x + i * 5 + 1, y - 1, 1, 5);
  }
}
