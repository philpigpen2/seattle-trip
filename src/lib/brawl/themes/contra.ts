// Stage 5 — THE JUNGLE BASE. Contra: palms, steel, tracer fire.
import { bandSky, hash, rect, stars, tile } from "../bg";
import type { Theme } from "./types";

function palm(f: Parameters<Theme["far"]>[0], x: number, base: number, h: number, c: string, lean: number) {
  for (let i = 0; i < h; i++) {
    rect(f, x + Math.round((i / h) * lean), base - i, 2, 1, c);
  }
  const tx = x + lean;
  const ty = base - h;
  rect(f, tx - 9, ty + 1, 9, 2, c);
  rect(f, tx - 12, ty + 4, 5, 2, c);
  rect(f, tx + 2, ty, 9, 2, c);
  rect(f, tx + 9, ty + 3, 5, 2, c);
  rect(f, tx - 5, ty - 3, 5, 2, c);
  rect(f, tx + 1, ty - 4, 5, 2, c);
  rect(f, tx - 1, ty - 1, 4, 2, c);
}

export const contra: Theme = {
  id: "contra",
  game: "CONTRA",
  stage: "STAGE 1 - THE JUNGLE",
  scroll: 0.6,
  style: "shoot",
  hitWords: ["BLAM!", "BOOM!", "KABOOM!", "RATATAT!", "DAKKA!"],
  hudInk: "#9ef0c0",
  hudShadow: "#03181c",

  heroes: [
    {
      hair: "long", weapon: "gun",
      pal: {
        skin: "#f0b892", skinShade: "#c98a68",
        hair: "#8a3a1e", hair2: "#b1522c",
        shirt: "#2f8ad0", shirt2: "#215f96", accent: "#e63946",
        belt: "#2a2f22", pants: "#3f4a2a", pants2: "#2d3620",
        shoes: "#3a2a20", shoes2: "#281c14",
      },
    },
    {
      hair: "short", weapon: "gun",
      pal: {
        skin: "#f0b892", skinShade: "#c98a68",
        hair: "#3a2a20", hair2: "#5a4231",
        shirt: "#e63946", shirt2: "#ad2733", accent: "#f6f0d0",
        belt: "#2a2f22", pants: "#3f4a2a", pants2: "#2d3620",
        shoes: "#3a2a20", shoes2: "#281c14",
      },
    },
    {
      hair: "pony", weapon: "gun",
      pal: {
        skin: "#f6c9a4", skinShade: "#d09a75",
        hair: "#5b3520", hair2: "#7d4b2d",
        shirt: "#f0a93c", shirt2: "#c07f22", accent: "#2f8ad0",
        belt: "#2a2f22", pants: "#4a5630", pants2: "#353f22",
        shoes: "#3a2a20", shoes2: "#281c14",
      },
    },
    {
      hair: "bob", weapon: "gun",
      pal: {
        skin: "#f6c9a4", skinShade: "#d09a75",
        hair: "#c98a3c", hair2: "#e5ad5c",
        shirt: "#7ad06a", shirt2: "#52a046", accent: "#e63946",
        belt: "#2a2f22", pants: "#3f4a2a", pants2: "#2d3620",
        shoes: "#3a2a20", shoes2: "#281c14",
      },
    },
  ],

  dog: { fur: "#c8a25a", fur2: "#a07c38", nose: "#1a1410", collar: "#e63946" },

  foes: [
    {
      hp: 1, speed: 0.95, weight: 4,
      fighter: {
        hair: "helm",
        pal: {
          skin: "#d99a72", skinShade: "#b0714f",
          hair: "#8a2020", hair2: "#a83030",
          shirt: "#c03028", shirt2: "#94221c", accent: "#f0d060",
          belt: "#2a2233", pants: "#3f4a2a", pants2: "#2d3620",
          shoes: "#241a14", shoes2: "#180f0c",
        },
      },
    },
    {
      hp: 1, speed: 1.05, weight: 3,
      fighter: {
        hair: "cap",
        pal: {
          skin: "#c98a5e", skinShade: "#a06740",
          hair: "#2a3320", hair2: "#3f4a2a",
          shirt: "#4f6b8a", shirt2: "#3a5068", accent: "#f0d060",
          belt: "#2a2233", pants: "#37414f", pants2: "#28303b",
          shoes: "#241a14", shoes2: "#180f0c",
        },
      },
    },
    {
      hp: 1, speed: 0.85, weight: 2,
      fighter: {
        hair: "bald",
        pal: {
          skin: "#c47a4a", skinShade: "#9c5b33",
          hair: "#c47a4a", hair2: "#9c5b33",
          shirt: "#6b7a3a", shirt2: "#4e5a28", accent: "#e63946",
          belt: "#2a2233", pants: "#4a5630", pants2: "#353f22",
          shoes: "#241a14", shoes2: "#180f0c",
        },
      },
    },
    {
      hp: 2, speed: 0.62, weight: 1,
      fighter: {
        hair: "helm", big: true,
        pal: {
          skin: "#a8a8b0", skinShade: "#7c7c88",
          hair: "#e63946", hair2: "#ad2733",
          shirt: "#5d6878", shirt2: "#3a4250", accent: "#f0d060",
          belt: "#2a2233", pants: "#3a4250", pants2: "#2a3140",
          shoes: "#1d1a2b", shoes2: "#141220",
        },
      },
    },
  ],

  sky(f) {
    bandSky(f, ["#03151c", "#062430", "#0a3644", "#0e4a54", "#166a68", "#2a8a6a"]);
    stars(f, 34, "#a8f0d0");
  },

  far(f) {
    tile(f, 23, 0.1, 40, (x, i) => {
      const h = Math.max(14, Math.round(f.horizon * (0.16 + hash(i, 101) * 0.22)));
      palm(f, x, f.horizon + 2, h, "#0a2a2e", Math.round(hash(i, 102) * 6) - 3);
    });
  },

  mid(f) {
    tile(f, 31, 0.28, 50, (x, i) => {
      const h = Math.max(20, Math.round(f.horizon * (0.24 + hash(i, 103) * 0.26)));
      palm(f, x, f.horizon + 3, h, "#10403c", Math.round(hash(i, 104) * 8) - 4);
    });

    // The base wall behind the fight.
    const base = f.horizon;
    const wh = Math.max(20, Math.round(base * 0.24));
    rect(f, 0, base - wh, f.W, wh + 4, "#2c3a44");
    rect(f, 0, base - wh, f.W, 2, "#48606e");
    tile(f, 22, 0.5, 26, (x, i) => {
      rect(f, x, base - wh + 4, 18, wh - 6, "#25313a");
      rect(f, x, base - wh + 4, 18, 1, "#3a4d59");
      rect(f, x + 1, base - 4, 1, 1, "#48606e");
      rect(f, x + 16, base - 4, 1, 1, "#48606e");
      if (hash(i, 105) > 0.66) {
        // Hazard stripes.
        for (let k = 0; k < 5; k++) rect(f, x + 3 + k * 3, base - wh + 7, 2, 4, k % 2 ? "#1c242b" : "#e0b83c");
      } else if (hash(i, 106) > 0.5) {
        const on = Math.floor(f.t / 18 + i) % 2 === 0;
        rect(f, x + 6, base - wh + 8, 6, 5, on ? "#e63946" : "#5a1c22");
      }
      // Pipes.
      rect(f, x + 19, base - wh + 6, 2, wh - 8, "#3f5460");
    });
  },

  ground(f) {
    const top = f.groundTop;
    rect(f, 0, f.horizon + 2, f.W, top - f.horizon, "#1c3326");
    rect(f, 0, top + 2, f.W, f.H - top, "#2a4430");
    rect(f, 0, top + 2, f.W, 2, "#3a5a3c");

    // Steel walkway plates.
    tile(f, 16, 1, 20, (x) => {
      rect(f, x, top + 4, 15, f.groundBottom - top - 2, "#33503a");
      f.ctx.fillStyle = "#243a2a";
      f.ctx.fillRect(Math.round(x + 15), top + 4, 1, f.groundBottom - top - 2);
      rect(f, x + 2, top + 6, 1, 1, "#4e7350");
      rect(f, x + 12, f.groundBottom - 4, 1, 1, "#4e7350");
    });

    // Crates and sandbags along the back.
    tile(f, 53, 1, 30, (x, i) => {
      const y = top + 6 + Math.round(hash(i, 107) * 6);
      const r = hash(i, 108);
      if (r > 0.7) {
        rect(f, x, y - 11, 12, 11, "#7a5a34");
        rect(f, x, y - 11, 12, 1, "#96703f");
        rect(f, x, y - 6, 12, 1, "#5c421f");
        rect(f, x + 5, y - 11, 2, 11, "#5c421f");
      } else if (r > 0.5) {
        for (let k = 0; k < 3; k++) rect(f, x + (k % 2) * 2, y - 3 - k * 3, 12, 3, k % 2 ? "#6b7050" : "#7d8460");
      }
    });

    rect(f, 0, f.groundBottom + 1, f.W, f.H - f.groundBottom, "#1a2c1e");
  },

  fore(f) {
    // Sandbag wall and ammo crates rolling past in front of the fight.
    tile(f, 97, 1.3, 30, (x, i) => {
      const r = hash(i, 109);
      const y = f.H - 3;
      if (r > 0.62) {
        rect(f, x, y - 12, 14, 12, "#5a6b3a");
        rect(f, x, y - 12, 14, 2, "#75884c");
        rect(f, x + 3, y - 8, 8, 3, "#e0b83c");
        rect(f, x + 6, y - 12, 2, 12, "#3f4c26");
      } else if (r > 0.3) {
        for (let k = 0; k < 3; k++) {
          rect(f, x + (k % 2) * 3, y - 4 - k * 4, 16, 4, k % 2 ? "#6b7050" : "#7d8460");
          rect(f, x + (k % 2) * 3, y - 4 - k * 4, 16, 1, "#8f9670");
        }
      }
    });
  },
};
