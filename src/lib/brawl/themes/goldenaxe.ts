// Stage 3 — THE MOUNTAIN PATH. Golden Axe: sunset, ruins, skeleton knights.
import { bandSky, hash, moon, rect, tile, type Frame } from "../bg";
import { hudText, lives } from "../hud";
import type { Theme } from "./types";

const INK = "#f6c85a";
const SHADOW = "#2a1020";

function ridge(f: Frame, parallax: number, amp: number, base: number, color: string, seed: number) {
  const ctx = f.ctx;
  ctx.fillStyle = color;
  for (let x = 0; x < f.W; x++) {
    const w = (x + f.cam * parallax) * 0.028;
    const h =
      base +
      Math.sin(w + seed) * amp +
      Math.sin(w * 2.7 + seed * 2.1) * amp * 0.42 +
      Math.abs(Math.sin(w * 0.6 + seed * 3.3)) * amp * 0.8;
    ctx.fillRect(x, f.horizon - Math.round(h), 1, Math.round(h) + 4);
  }
}

export const goldenaxe: Theme = {
  id: "goldenaxe",
  intro: ["STAGE 1", "THE PATH"],
  scroll: 0.5,
  style: "blade",
  impact: "gleam",
  ink: INK,
  shadow: SHADOW,

  // Score, spare lives, and the row of magic pots that decides how big the
  // spell is when you finally cast it.
  hud(f, s) {
    const pad = 5;
    hudText(f, "1P", pad, pad, INK, { shadow: SHADOW });
    hudText(f, String(s.score).padStart(6, "0"), pad, pad + 9, "#f4ecd8", { shadow: SHADOW });
    for (let i = 0; i < 6; i++) {
      const x = pad + i * 6;
      const y = pad + 20;
      const filled = i < s.magic;
      rect(f, x, y, 4, 6, filled ? "#3fa0e6" : "#26304a");
      rect(f, x, y, 4, 1, filled ? "#9adcff" : "#33405f");
      rect(f, x + 1, y - 2, 2, 2, "#8a6a3a");
    }
    lives(f, pad + 1, pad + 32, 3, "#e0503a");
    hudText(f, "HI", f.W - pad, pad, INK, { align: "right", shadow: SHADOW });
    hudText(f, String(s.hi).padStart(6, "0"), f.W - pad, pad + 9, "#f4ecd8", { align: "right", shadow: SHADOW });
  },

  // Casting magic: the screen goes up in fire and everything standing falls.
  special: {
    everyFrames: 760,
    duration: 56,
    render(f, p) {
      // Hold the fire at full height for most of the cast.
      const heat = Math.max(0, Math.min(1, Math.sin(p * Math.PI) * 1.9));
      const ctx = f.ctx;
      ctx.save();
      ctx.globalAlpha = p < 0.12 ? 0.75 : 0.3 * heat;
      ctx.fillStyle = p < 0.12 ? "#ffe9b0" : "#ff7a2a";
      ctx.fillRect(0, 0, f.W, f.H);
      ctx.restore();
      const cols = 7;
      for (let i = 0; i < cols; i++) {
        const x = Math.round((f.W * (i + 0.5)) / cols + Math.sin(f.t / 9 + i) * 3);
        const h = Math.max(4, Math.round(f.groundBottom * heat * (0.5 + ((i * 37) % 11) / 24)));
        const base = f.groundBottom - 2;
        for (let k = 0; k < h; k += 4) {
          const w = Math.max(2, Math.round(11 - (k / h) * 8 + Math.sin((f.t + k) / 5 + i) * 1.6));
          const c = k < h * 0.32 ? "#fff0b0" : k < h * 0.68 ? "#f6c85a" : "#e0521c";
          rect(f, x - w / 2, base - k, w, 4, c);
        }
      }
    },
  },

  heroes: [
    {
      // Bethany — the fire amazon
      hair: "long", weapon: "sword", skirt: true, cape: "#a01818",
      pal: {
        skin: "#f0b892", skinShade: "#c98a68",
        hair: "#e0502a", hair2: "#f4884c",
        shirt: "#d02020", shirt2: "#9c1414", accent: "#f6c85a",
        belt: "#6b4526", pants: "#7a4a2a", pants2: "#5c3620",
        shoes: "#4a2c16", shoes2: "#331d0e",
      },
    },
    {
      // Phil — the barbarian
      hair: "mane", weapon: "sword", cape: "#2f4a8c",
      pal: {
        skin: "#e8ac7c", skinShade: "#bd825a",
        hair: "#5a3418", hair2: "#7c4a26",
        shirt: "#a06840", shirt2: "#7a4c2c", accent: "#f6c85a",
        belt: "#4a2c16", pants: "#2f4a8c", pants2: "#233a6e",
        shoes: "#4a2c16", shoes2: "#331d0e",
      },
    },
    {
      // Evelyn — the green mage
      hair: "pony", weapon: "staff",
      pal: {
        skin: "#f6c9a4", skinShade: "#d09a75",
        hair: "#7c4a26", hair2: "#a06840",
        shirt: "#2f8a4a", shirt2: "#1f6636", accent: "#f6c85a",
        belt: "#6b4526", pants: "#3c6b3c", pants2: "#2b4f2b",
        shoes: "#4a2c16", shoes2: "#331d0e",
      },
    },
    {
      // Charlotte — horned helm and an axe
      hair: "helm", weapon: "axe",
      pal: {
        skin: "#f6c9a4", skinShade: "#d09a75",
        hair: "#e8e0c8", hair2: "#b8b096",
        shirt: "#c04a2a", shirt2: "#93341c", accent: "#b0a68c",
        belt: "#4a2c16", pants: "#6b4526", pants2: "#513218",
        shoes: "#4a2c16", shoes2: "#331d0e",
      },
    },
  ],

  dog: { fur: "#e0b170", fur2: "#bd8c4e", nose: "#2a1a14", collar: "#a01818", hat: "#b0a68c" },

  foes: [
    {
      hp: 1, speed: 0.8, weight: 3,
      fighter: {
        hair: "skull", weapon: "sword",
        pal: {
          skin: "#e8e4d0", skinShade: "#b3ad95",
          hair: "#e8e4d0", hair2: "#b3ad95",
          shirt: "#4a6ea8", shirt2: "#33507e", accent: "#c8d0e0",
          belt: "#2a2233", pants: "#2f4a70", pants2: "#223655",
          shoes: "#33253a", shoes2: "#241a29",
        },
      },
    },
    {
      hp: 1, speed: 0.9, weight: 3,
      fighter: {
        hair: "helm", weapon: "club",
        pal: {
          skin: "#c98a5e", skinShade: "#a06740",
          hair: "#8a2020", hair2: "#a83030",
          shirt: "#a03028", shirt2: "#7a201a", accent: "#8a8272",
          belt: "#3a2a20", pants: "#4a3a2a", pants2: "#33281c",
          shoes: "#3a2a20", shoes2: "#281c14",
        },
      },
    },
    {
      hp: 1, speed: 0.72, weight: 2,
      fighter: {
        hair: "hood", weapon: "sword",
        pal: {
          skin: "#c98a5e", skinShade: "#a06740",
          hair: "#2a2233", hair2: "#3d3450",
          shirt: "#4a3f6b", shirt2: "#352c50", accent: "#f6c85a",
          belt: "#2a2233", pants: "#3a3352", pants2: "#2a2440",
          shoes: "#2a2233", shoes2: "#1d1a2b",
        },
      },
    },
    {
      hp: 2, speed: 0.55, weight: 1,
      fighter: {
        hair: "bald", weapon: "axe", big: true,
        pal: {
          skin: "#8fae5a", skinShade: "#6b873f",
          hair: "#8fae5a", hair2: "#6b873f",
          shirt: "#6b4526", shirt2: "#4e3119", accent: "#f6c85a",
          belt: "#3a2a20", pants: "#5a4030", pants2: "#402c20",
          shoes: "#3a2a20", shoes2: "#281c14",
        },
      },
    },
  ],

  sky(f) {
    bandSky(f, ["#241436", "#42204a", "#6b2c4a", "#a04440", "#d4703c", "#f0a24a"]);
    moon(f, Math.round(f.W * 0.72), Math.round(f.horizon * 0.62), 11, "#ffd98a", "#e8ba63");
    // A flight of birds crossing the sun.
    const bx = Math.round((f.W * 1.4 - (f.t * 0.22) % (f.W * 1.8)));
    for (let i = 0; i < 4; i++) {
      const x = bx + i * 9;
      const y = Math.round(f.horizon * 0.3 + Math.sin((f.t + i * 40) / 55) * 3 + i * 4);
      if (x < -6 || x > f.W) continue;
      rect(f, x, y, 2, 1, "#3a2038");
      rect(f, x + 2, y - 1, 1, 1, "#3a2038");
      rect(f, x + 3, y, 2, 1, "#3a2038");
    }
  },

  far(f) {
    ridge(f, 0.06, Math.max(9, f.horizon * 0.13), Math.max(16, f.horizon * 0.3), "#5c3450", 1.7);
    ridge(f, 0.12, Math.max(8, f.horizon * 0.11), Math.max(12, f.horizon * 0.2), "#402445", 4.2);
  },

  mid(f) {
    ridge(f, 0.26, Math.max(6, f.horizon * 0.08), Math.max(10, f.horizon * 0.13), "#2b1832", 8.1);

    // Ruined towers and dead trees on the ridge line.
    tile(f, 92, 0.36, 60, (x, i) => {
      const base = f.horizon;
      const r = hash(i, 81);
      if (r > 0.55) {
        const h = Math.max(22, Math.round(base * 0.28));
        rect(f, x, base - h, 16, h, "#3d2c3a");
        rect(f, x, base - h, 16, 2, "#54404e");
        for (let k = 0; k < 4; k++) rect(f, x + k * 4, base - h - 3, 3, 3, "#3d2c3a");
        rect(f, x + 5, base - h + 8, 5, 7, "#1a0f1c");
        rect(f, x + 5, base - 12, 5, 12, "#1a0f1c");
      } else if (r > 0.24) {
        const h = Math.max(16, Math.round(base * 0.2));
        rect(f, x + 6, base - h, 3, h, "#2a1a24");
        rect(f, x + 1, base - h + 4, 5, 2, "#2a1a24");
        rect(f, x + 9, base - h + 7, 6, 2, "#2a1a24");
        rect(f, x - 1, base - h + 10, 5, 2, "#2a1a24");
        rect(f, x + 3, base - h - 2, 2, 3, "#2a1a24");
      }
    });
  },

  ground(f) {
    const top = f.groundTop;

    // Grass verge along the back of the path.
    rect(f, 0, f.horizon, f.W, top - f.horizon + 3, "#3f5a2e");
    tile(f, 7, 0.9, 12, (x, i) => {
      if (hash(i, 82) > 0.5) rect(f, x, f.horizon - 2, 1, 3, "#547a3a");
      if (hash(i, 83) > 0.8) rect(f, x + 2, f.horizon - 3, 1, 4, "#6b9448");
    });

    // The dirt path.
    rect(f, 0, top + 2, f.W, f.H - top, "#8a6238");
    rect(f, 0, top + 2, f.W, 2, "#a4794a");
    tile(f, 9, 1, 14, (x, i) => {
      const y = top + 6 + Math.round(hash(i, 84) * (f.groundBottom - top - 4));
      const c = hash(i, 85) > 0.5 ? "#75512c" : "#9c7042";
      rect(f, x, y, 3 + Math.round(hash(i, 86) * 3), 2, c);
    });
    // Cobbles at the front edge.
    rect(f, 0, f.groundBottom + 1, f.W, f.H - f.groundBottom, "#6b4a2a");
    tile(f, 8, 1.1, 12, (x) => rect(f, x, f.groundBottom + 3, 5, 3, "#8a6238"));
  },

  fore(f) {
    const top = f.groundTop;

    // Skulls and stones scattered on the path.
    tile(f, 41, 1.05, 24, (x, i) => {
      const y = top + 8 + Math.round(hash(i, 87) * (f.groundBottom - top - 8));
      const r = hash(i, 88);
      if (r > 0.78) {
        rect(f, x, y - 4, 5, 4, "#e0dcc6");
        rect(f, x + 1, y - 2, 1, 1, "#3a2a20");
        rect(f, x + 3, y - 2, 1, 1, "#3a2a20");
        rect(f, x + 1, y, 3, 1, "#c4c0aa");
      } else if (r > 0.62) {
        rect(f, x, y - 3, 6, 3, "#6b5a48");
        rect(f, x + 1, y - 4, 3, 1, "#8a7a66");
      }
    });

    // Torch posts, guttering in the wind.
    tile(f, 118, 1.25, 40, (x, i) => {
      const y = f.groundBottom + 2;
      const h = 34 + Math.round(hash(i, 89) * 8);
      rect(f, x, y - h, 3, h, "#4a3018");
      rect(f, x + 1, y - h, 1, h, "#66401f");
      const flick = Math.floor(f.t / 5 + i) % 3;
      rect(f, x - 2, y - h - 6 - flick, 7, 7, "#f0742a");
      rect(f, x - 1, y - h - 9 - flick, 5, 5, "#f6c85a");
      rect(f, x, y - h - 11 - flick, 3, 3, "#fff0b0");
    });
  },
};
