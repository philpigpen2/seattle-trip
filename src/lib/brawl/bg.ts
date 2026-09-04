// Shared background helpers: deterministic noise, banded skies, infinite tiling.

export type Frame = {
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  cam: number;
  t: number;
  horizon: number;
  groundTop: number;
  groundBottom: number;
};

/** Stable pseudo-random in [0,1) for an integer index. */
export function hash(n: number, salt = 0): number {
  const x = Math.sin(n * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function pick<T>(arr: readonly T[], n: number, salt = 0): T {
  return arr[Math.floor(hash(n, salt) * arr.length) % arr.length];
}

export function rect(f: Frame, x: number, y: number, w: number, h: number, c: string) {
  f.ctx.fillStyle = c;
  f.ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/**
 * Walks every tile of an infinitely repeating layer that is visible right now.
 * `cb` receives the tile's screen x and its world index (use it with `hash`).
 */
export function tile(
  f: Frame,
  spacing: number,
  parallax: number,
  pad: number,
  cb: (x: number, i: number) => void,
) {
  const off = f.cam * parallax;
  const first = Math.floor((off - pad) / spacing);
  const last = Math.ceil((off + f.W + pad) / spacing);
  for (let i = first; i <= last; i++) cb(i * spacing - off, i);
}

/** Horizontal colour bands with a one-pixel dithered seam, NES-style. */
export function bandSky(f: Frame, colors: string[], top = 0, bottom = f.horizon) {
  const n = colors.length;
  const span = bottom - top;
  const ctx = f.ctx;
  for (let i = 0; i < n; i++) {
    const y0 = Math.round(top + (span * i) / n);
    const y1 = Math.round(top + (span * (i + 1)) / n);
    ctx.fillStyle = colors[i];
    ctx.fillRect(0, y0, f.W, y1 - y0);
    if (i > 0) {
      // Dither the seam with a 2px checker of the colour above.
      ctx.fillStyle = colors[i - 1];
      for (let x = 0; x < f.W; x += 2) ctx.fillRect(x, y0, 1, 1);
      ctx.fillRect(0, y0 - 1, 0, 0);
      for (let x = 1; x < f.W; x += 4) ctx.fillRect(x, y0 + 1, 1, 1);
    }
  }
}

export function stars(f: Frame, count: number, color: string, twinkle = true) {
  const ctx = f.ctx;
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const x = Math.floor(hash(i, 1) * f.W * 2 - (f.cam * 0.03) % (f.W * 2));
    const sx = ((x % (f.W * 2)) + f.W * 2) % (f.W * 2);
    if (sx > f.W) continue;
    const y = Math.floor(hash(i, 2) * (f.horizon * 0.62));
    if (twinkle && (Math.floor(f.t / 14) + i) % 11 === 0) continue;
    ctx.fillRect(sx, y, 1, 1);
  }
}

export function moon(f: Frame, x: number, y: number, r: number, c: string, shade: string) {
  const ctx = f.ctx;
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy)));
    ctx.fillStyle = c;
    ctx.fillRect(x - w, y + dy, w * 2 + 1, 1);
  }
  ctx.fillStyle = shade;
  ctx.fillRect(x - 2, y - 2, 2, 2);
  ctx.fillRect(x + 1, y + 1, 3, 2);
  ctx.fillRect(x - 3, y + 3, 2, 1);
}

/** A soft vertical light cone under a lamp. */
export function lightCone(
  f: Frame,
  x: number,
  y: number,
  h: number,
  spread: number,
  color: string,
) {
  const ctx = f.ctx;
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = color;
  for (let i = 0; i < h; i++) {
    const w = Math.round(2 + (spread * i) / h);
    ctx.fillRect(Math.round(x - w / 2), y + i, w, 1);
  }
  ctx.restore();
}
