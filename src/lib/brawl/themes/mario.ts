// Stage 2 — WORLD 1-1. Super Mario Bros: blue sky, hills, pipes, brick ground.
import { hash, rect, tile } from "../bg";
import type { Theme } from "./types";

const SKY = "#5c94fc";
const GREEN = "#00a800";
const GREEN2 = "#58d854";
const BRICK = "#c84c0c";
const BRICK2 = "#e07a2c";
const MORTAR = "#1b1008";

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

/** A stepped SMB hill sitting on the horizon. */
function hill(f: Parameters<Theme["far"]>[0], x: number, w: number, h: number) {
  const base = f.horizon;
  for (let i = 0; i < h; i++) {
    const inset = Math.round((i / h) * (w / 2));
    rect(f, x + inset, base - i - 1, w - inset * 2, 1, GREEN);
  }
  rect(f, x + Math.round(w * 0.3), base - 4, 2, 2, GREEN2);
  rect(f, x + Math.round(w * 0.55), base - 6, 2, 2, GREEN2);
  rect(f, x + Math.round(w * 0.45), base - 2, 3, 1, GREEN2);
}

function cloud(f: Parameters<Theme["far"]>[0], x: number, y: number, s: number) {
  const w = 6 * s;
  rect(f, x, y + s, w, s * 2, "#ffffff");
  rect(f, x + s, y, s * 2, s, "#ffffff");
  rect(f, x + s * 3, y - s, s * 2, s * 2, "#ffffff");
  rect(f, x - s, y + s * 2, w + s * 2, s, "#ffffff");
  rect(f, x, y + s * 3, w, s, "#c8d8f8");
}

export const mario: Theme = {
  id: "mario",
  game: "SUPER MARIO BROS",
  stage: "WORLD 1-1",
  scroll: 0.62,
  style: "stomp",
  hitWords: ["STOMP!", "BONK!", "WHAM!", "POW!", "BOING!"],
  hudInk: "#ffffff",
  hudShadow: "#1b1008",

  heroes: [
    { hair: "long", pal: { ...overalls(GREEN, "#007000", "#ffffff"), hair: "#a04000", hair2: "#c86020" } },
    { hair: "cap", pal: { ...overalls("#d82800", "#a81800", "#ffffff"), hair: "#7c3800", hair2: "#d82800" } },
    { hair: "pony", pal: { ...overalls("#9b5cf0", "#7a41c4", "#fce0a0"), hair: "#7c3800", hair2: "#a05820" } },
    { hair: "bob", skirt: true, pal: { ...overalls("#f878b8", "#c04888", "#ffffff"), hair: "#fcd8a0", hair2: "#e0b070" } },
  ],

  dog: { fur: "#e8a038", fur2: "#c07818", nose: "#1b1008", collar: "#d82800" },

  foes: [
    {
      // Green shell
      hp: 1, speed: 0.8, weight: 3,
      fighter: {
        hair: "bald",
        pal: {
          skin: "#f8d878", skinShade: "#d0a840",
          hair: "#f8d878", hair2: "#d0a840",
          shirt: GREEN, shirt2: "#007000", accent: "#f8f8f8",
          belt: "#f8f8f8", pants: "#f8d878", pants2: "#d0a840",
          shoes: "#e45c10", shoes2: "#b04000",
        },
      },
    },
    {
      // Red shell
      hp: 1, speed: 0.95, weight: 2,
      fighter: {
        hair: "bald",
        pal: {
          skin: "#f8d878", skinShade: "#d0a840",
          hair: "#f8d878", hair2: "#d0a840",
          shirt: "#d82800", shirt2: "#a81800", accent: "#f8f8f8",
          belt: "#f8f8f8", pants: "#f8d878", pants2: "#d0a840",
          shoes: "#e45c10", shoes2: "#b04000",
        },
      },
    },
    {
      // Goomba-brown stomper
      hp: 1, speed: 0.7, weight: 3,
      fighter: {
        hair: "bald",
        pal: {
          skin: "#c07830", skinShade: "#8c5420",
          hair: "#c07830", hair2: "#8c5420",
          shirt: "#8c5420", shirt2: "#6b3c14", accent: "#f8f8f8",
          belt: "#3c2410", pants: "#6b3c14", pants2: "#4c2a0c",
          shoes: "#f8f8f8", shoes2: "#c8c8c8",
        },
      },
    },
    {
      // Hammer bro
      hp: 2, speed: 0.6, weight: 1,
      fighter: {
        hair: "helm",
        pal: {
          skin: "#f8d878", skinShade: "#d0a840",
          hair: "#f8f8f8", hair2: "#c8c8c8",
          shirt: "#00a800", shirt2: "#007000", accent: "#1b1008",
          belt: "#1b1008", pants: "#1b1008", pants2: "#000000",
          shoes: "#e45c10", shoes2: "#b04000",
        },
      },
    },
  ],

  sky(f) {
    rect(f, 0, 0, f.W, f.horizon + 4, SKY);
  },

  far(f) {
    tile(f, 96, 0.08, 60, (x, i) => {
      cloud(f, x + 10, Math.round(f.horizon * 0.16 + hash(i, 61) * f.horizon * 0.3), 3);
      if (hash(i, 62) > 0.4) cloud(f, x + 58, Math.round(f.horizon * 0.1 + hash(i, 63) * f.horizon * 0.2), 2);
    });
    tile(f, 74, 0.2, 60, (x, i) => {
      const big = hash(i, 64) > 0.5;
      hill(f, x, big ? 46 : 28, big ? 22 : 13);
      if (hash(i, 65) > 0.55) hill(f, x + 50, 24, 11);
    });
  },

  mid(f) {
    // Castle on the skyline now and then.
    tile(f, 240, 0.3, 90, (x, i) => {
      if (hash(i, 66) < 0.45) return;
      const base = f.horizon;
      const h = Math.max(26, Math.round(base * 0.3));
      rect(f, x, base - h, 44, h, BRICK);
      for (let y = base - h; y < base; y += 4) rect(f, x, y, 44, 1, MORTAR);
      rect(f, x - 2, base - h - 8, 10, 8, BRICK);
      rect(f, x + 36, base - h - 8, 10, 8, BRICK);
      rect(f, x + 16, base - h - 14, 12, 14, BRICK);
      for (let k = 0; k < 3; k++) rect(f, x - 2 + k * 4, base - h - 11, 2, 3, BRICK);
      rect(f, x + 18, base - 12, 8, 12, MORTAR);
      rect(f, x + 19, base - 16, 6, 5, MORTAR);
    });

    // Bushes along the top of the ground.
    tile(f, 58, 0.55, 40, (x, i) => {
      if (hash(i, 67) < 0.45) return;
      const base = f.horizon;
      rect(f, x, base - 5, 20, 5, GREEN);
      rect(f, x + 3, base - 8, 5, 3, GREEN);
      rect(f, x + 11, base - 9, 6, 4, GREEN);
      rect(f, x + 4, base - 7, 3, 1, GREEN2);
    });
  },

  ground(f) {
    const top = f.groundTop;

    // Floating brick and question blocks above the party.
    tile(f, 62, 0.85, 40, (x, i) => {
      const r = hash(i, 68);
      if (r < 0.42) return;
      const y = top - 26 - Math.round(hash(i, 69) * 16);
      const n = r > 0.8 ? 3 : 1;
      for (let k = 0; k < n; k++) {
        const bx = x + k * 9;
        const isQ = r > 0.62 && k === Math.floor(n / 2);
        if (isQ) {
          const blink = Math.floor(f.t / 12) % 4;
          rect(f, bx, y, 8, 8, blink === 3 ? "#e07a2c" : "#fbb040");
          rect(f, bx, y, 8, 1, "#fce0a0");
          rect(f, bx, y + 7, 8, 1, MORTAR);
          rect(f, bx + 3, y + 2, 2, 1, "#ffffff");
          rect(f, bx + 5, y + 3, 1, 1, "#ffffff");
          rect(f, bx + 4, y + 4, 1, 1, "#ffffff");
          rect(f, bx + 4, y + 6, 1, 1, "#ffffff");
        } else {
          rect(f, bx, y, 8, 8, BRICK);
          rect(f, bx, y, 8, 1, BRICK2);
          rect(f, bx, y + 3, 8, 1, MORTAR);
          rect(f, bx + 3, y, 1, 3, MORTAR);
          rect(f, bx + 1, y + 4, 1, 4, MORTAR);
          rect(f, bx + 6, y + 4, 1, 4, MORTAR);
        }
      }
    });

    // Pipes rise out of the ground behind the party.
    tile(f, 137, 1, 50, (x, i) => {
      if (hash(i, 70) < 0.45) return;
      const h = 16 + Math.round(hash(i, 71) * 12);
      const y = top - h;
      rect(f, x, y + 6, 14, h, GREEN);
      rect(f, x + 1, y + 6, 3, h, GREEN2);
      rect(f, x + 11, y + 6, 2, h, "#007000");
      rect(f, x - 2, y, 18, 7, GREEN);
      rect(f, x - 1, y + 1, 4, 5, GREEN2);
      rect(f, x + 13, y + 1, 2, 5, "#007000");
      rect(f, x - 2, y, 18, 1, MORTAR);
    });

    // The ground itself.
    rect(f, 0, top, f.W, f.H - top, BRICK);
    rect(f, 0, top, f.W, 2, BRICK2);
    for (let y = top + 2; y < f.H; y += 6) rect(f, 0, y, f.W, 1, MORTAR);
    tile(f, 12, 1, 20, (x, i) => {
      for (let y = top + 2; y < f.H; y += 6) {
        const off = (Math.floor((y - top) / 6) % 2) * 6;
        f.ctx.fillStyle = MORTAR;
        f.ctx.fillRect(Math.round(x + off), y, 1, 5);
      }
      if (hash(i, 72) > 0.7) rect(f, x + 3, top + 4, 2, 2, "#a03800");
    });
  },

  fore(f) {
    // Spinning coins hover over the block rows.
    tile(f, 62, 0.85, 40, (x, i) => {
      if (hash(i, 73) < 0.72) return;
      const y = f.groundTop - 44 - Math.round(hash(i, 74) * 10);
      const step = Math.floor(f.t / 7 + i) % 4;
      const w = [4, 3, 1, 3][step];
      const cx = x + 4 - Math.floor(w / 2);
      rect(f, cx, y, w, 6, "#fbb040");
      rect(f, cx, y, w, 1, "#fce0a0");
      rect(f, cx, y + 5, w, 1, "#c07000");
    });
  },
};
