// Contra, Konami 1987 — Stage 1, the jungle. A side-on run-and-gun: one ground
// line, layered foliage, a girder bridge over the water, and soldiers coming
// the other way.
import { hash, rect, tile, type Frame } from "../bg";
import { hudText } from "../hud";
import type { Theme } from "./types";

const NIGHT = "#081820";
const SKY = "#10303c";
const CANOPY = "#0d2a1e";
const LEAF = "#1e6b3c";
const LEAF2 = "#2f8f4c";
const TRUNK = "#3a2a18";
const ROCK = "#6b6252";
const ROCK2 = "#4a4438";
const ROCK3 = "#8f8672";
const GRASS = "#3ca02c";
const WATER = "#1c4c8c";
const WATER2 = "#2f6cbc";
const STEEL = "#8a929e";
const STEEL2 = "#5d6672";
const INK = "#9ef0c0";
const SHADOW = "#03181c";

/** A filled pixel disc. */
function blob(f: Frame, cx: number, cy: number, r: number, c: string) {
  for (let dy = -r; dy <= r; dy++) {
    const hw = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)));
    if (hw <= 0) continue;
    rect(f, cx - hw, cy + dy, hw * 2, 1, c);
  }
}

/** A clump of jungle leaves: overlapping rounded masses, lit from above. */
function foliage(f: Frame, x: number, baseY: number, w: number, h: number, c: string, c2: string) {
  const cx = x + w / 2;
  const masses: [number, number, number][] = [
    [0, 0.34, 0.5],
    [-0.3, 0.2, 0.36],
    [0.31, 0.24, 0.38],
    [-0.14, 0.62, 0.34],
    [0.18, 0.7, 0.3],
  ];
  for (const [mx, my, mr] of masses) {
    blob(f, Math.round(cx + mx * w), Math.round(baseY - my * h), Math.round(mr * w * 0.5), c);
  }
  // Highlight on the upper leaves only.
  for (const [mx, my, mr] of masses.slice(3)) {
    blob(f, Math.round(cx + mx * w), Math.round(baseY - my * h - mr * w * 0.16), Math.round(mr * w * 0.32), c2);
  }
}

export const contra: Theme = {
  id: "contra",
  intro: ["STAGE 1", "JUNGLE"],
  staging: "flat",
  floor: 30,
  targetW: 272,
  scroll: 0.72,
  style: "shoot",
  impact: "boom",
  ink: INK,
  shadow: SHADOW,

  hud(f, s) {
    const pad = 5;
    hudText(f, "1P", pad, pad, "#ff6b6b", { shadow: SHADOW });
    hudText(f, String(s.score).padStart(6, "0"), pad, pad + 9, INK, { shadow: SHADOW });
    // Spare lives, drawn as little soldiers.
    for (let i = 0; i < 3; i++) {
      const x = pad + i * 7;
      const y = pad + 20;
      rect(f, x + 1, y, 3, 3, "#f0b892");
      rect(f, x, y + 3, 5, 4, "#e63946");
      rect(f, x + 1, y + 7, 1, 2, "#3f4a2a");
      rect(f, x + 3, y + 7, 1, 2, "#3f4a2a");
    }
    // Current gun.
    const on = Math.floor(s.t / 16) % 2 === 0;
    rect(f, pad, pad + 32, 11, 11, on ? "#e0b83c" : "#8a6f20");
    rect(f, pad + 1, pad + 33, 9, 9, "#1c242b");
    hudText(f, "S", pad + 3, pad + 35, on ? "#fff3b0" : "#c8a83c");
    hudText(f, "HI", f.W - pad, pad, "#ff6b6b", { align: "right", shadow: SHADOW });
    hudText(f, String(s.hi).padStart(6, "0"), f.W - pad, pad + 9, INK, { align: "right", shadow: SHADOW });
  },

  heroes: [
    {
      // Bare arms, headband, combat trousers.
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
      // Red Falcon infantry, the ones that just run at you.
      hp: 1, speed: 1.15, weight: 5,
      fighter: {
        hair: "cap",
        pal: {
          skin: "#d99a72", skinShade: "#b0714f",
          hair: "#8a2020", hair2: "#c03028",
          shirt: "#c03028", shirt2: "#94221c", accent: "#f0d060",
          belt: "#2a2233", pants: "#e8c090", pants2: "#c09a68",
          shoes: "#241a14", shoes2: "#180f0c",
        },
      },
    },
    {
      hp: 1, speed: 0.95, weight: 3,
      fighter: {
        hair: "helm", weapon: "gun",
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
      hp: 2, speed: 0.6, weight: 1, scale: 1.15,
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
    rect(f, 0, 0, f.W, f.H, NIGHT);
    rect(f, 0, 0, f.W, Math.round(f.horizon * 0.55), SKY);
    for (let y = Math.round(f.horizon * 0.5); y < f.horizon * 0.6; y += 2) {
      for (let x = (y % 4); x < f.W; x += 4) rect(f, x, y, 2, 1, SKY);
    }
  },

  far(f) {
    // Distant canopy: a solid band of silhouette with tree tops poking up.
    const base = Math.round(f.horizon * 0.72);
    tile(f, 22, 0.14, 40, (x, i) => {
      const h = Math.max(14, Math.round(f.horizon * (0.2 + hash(i, 101) * 0.24)));
      foliage(f, x, base + 4, 30, h, CANOPY, CANOPY);
    });
    rect(f, 0, base, f.W, f.horizon - base, CANOPY);
  },

  mid(f) {
    // Trunks and lit foliage in front of the canopy.
    tile(f, 38, 0.36, 60, (x, i) => {
      const h = Math.max(24, Math.round(f.horizon * (0.34 + hash(i, 103) * 0.3)));
      rect(f, x + 14, f.horizon - h + 10, 5, h, TRUNK);
      rect(f, x + 14, f.horizon - h + 10, 2, h, "#4d3a22");
      foliage(f, x, f.horizon - h + 14, 34, Math.round(h * 0.62), LEAF, LEAF2);
    });
    // A lower band of leaves so the wall of jungle feels solid.
    tile(f, 27, 0.5, 40, (x, i) => {
      if (hash(i, 112) < 0.4) return;
      foliage(f, x, f.horizon - 2, 26, 20, "#17512f", LEAF);
    });
    rect(f, 0, f.horizon - 6, f.W, 6, CANOPY);
  },

  ground(f) {
    const g = f.groundTop;
    const deep = f.H - g;

    // Every so often the ground gives way to water with a girder bridge.
    tile(f, 260, 1, 80, (x, i) => {
      if (hash(i, 105) < 0.45) return;
      const w = 120;
      rect(f, x, g, w, deep, WATER);
      for (let k = 0; k < 4; k++) {
        const wy = g + 6 + k * 7;
        const off = Math.round(Math.sin((f.t + k * 40) / 18) * 4);
        for (let wx = x + off; wx < x + w; wx += 14) rect(f, wx, wy, 7, 1, WATER2);
      }
      // Girders under the walkway.
      rect(f, x, g - 2, w, 4, STEEL);
      rect(f, x, g - 2, w, 1, ROCK3);
      for (let k = 0; k <= w; k += 12) {
        rect(f, x + k, g + 2, 2, 8, STEEL2);
        rect(f, x + k, g + 9, 12, 2, STEEL2);
      }
    });

    // The ground is a rocky ledge, lit along the top and falling away to black.
    rect(f, 0, g, f.W, deep, ROCK);
    for (let y = 0; y < deep; y++) {
      const t = y / deep;
      if (t > 0.45) {
        f.ctx.fillStyle = t > 0.78 ? "#241f18" : ROCK2;
        f.ctx.fillRect(0, g + y, f.W, 1);
      }
    }
    rect(f, 0, g, f.W, 3, GRASS);
    rect(f, 0, g + 3, f.W, 1, "#2a7a1e");
    rect(f, 0, g + 4, f.W, 1, ROCK3);
    tile(f, 5, 1, 12, (x, i) => {
      if (hash(i, 106) > 0.45) rect(f, x, g - 2, 1, 3, GRASS);
      if (hash(i, 113) > 0.7) rect(f, x, g - 3, 1, 2, "#2a7a1e");
    });
    // Rubble and cracks across the face of the ledge.
    tile(f, 11, 1, 14, (x, i) => {
      const y = g + 6 + Math.round(hash(i, 108) * (deep - 12));
      if (hash(i, 107) > 0.55) rect(f, x, y, 3 + Math.round(hash(i, 114) * 3), 2, ROCK2);
      if (hash(i, 109) > 0.7) rect(f, x + 3, y - 3, 2, 1, ROCK3);
      if (hash(i, 115) > 0.86) {
        rect(f, x + 1, g + 5, 1, 4, ROCK2);
        rect(f, x + 2, g + 9, 1, 3, ROCK2);
      }
    });
  },

  fore(f) {
    // Weapon capsule drifting across, the way they fly in on a rail.
    const period = 620;
    const phase = f.t % period;
    if (phase < 260) {
      const cx = Math.round(f.W - (phase / 260) * (f.W + 40) + 20);
      const cy = Math.round(f.horizon * 0.6 + Math.sin(phase / 22) * 6);
      rect(f, cx - 9, cy - 5, 18, 10, "#e0e4ec");
      rect(f, cx - 9, cy - 5, 18, 2, "#ffffff");
      rect(f, cx - 7, cy - 3, 14, 6, "#d02020");
      hudText(f, "S", cx - 2, cy - 3, "#ffffff");
      rect(f, cx + 9, cy - 2, 3, 4, "#8a929e");
    }

    // Big leaves framing the very front.
    tile(f, 190, 1.5, 60, (x, i) => {
      if (hash(i, 111) < 0.5) return;
      foliage(f, x, f.H, 40, 26, "#0f3a24", "#17512f");
    });
  },
};
