// Stage 4 — THE GRAVEYARD. Ghosts 'n Goblins: armour, zombies, a cold moon.
import { bandSky, hash, moon, rect, stars, tile } from "../bg";
import type { Theme } from "./types";

const ARMOUR = { light: "#c3ccdc", mid: "#8e99ad", dark: "#5b6478" };

export const ghosts: Theme = {
  id: "ghosts",
  game: "GHOSTS N GOBLINS",
  stage: "STAGE 1 - THE GRAVEYARD",
  scroll: 0.48,
  style: "blade",
  hitWords: ["SHINK!", "CLANK!", "SPLAT!", "CRUNCH!", "THUNK!"],
  hudInk: "#cfe4ff",
  hudShadow: "#0a1420",

  heroes: [
    {
      hair: "long", weapon: "sword", cape: "#7a2038",
      pal: {
        skin: "#f0b892", skinShade: "#c98a68",
        hair: "#8a3a1e", hair2: "#b1522c",
        shirt: ARMOUR.light, shirt2: ARMOUR.mid, accent: "#e0b040",
        belt: "#4a3550", pants: "#5c3a6b", pants2: "#452a52",
        shoes: ARMOUR.dark, shoes2: "#3f4759",
      },
    },
    {
      hair: "helm", weapon: "sword", cape: "#2f4a8c",
      pal: {
        skin: "#f0b892", skinShade: "#c98a68",
        hair: "#e0b040", hair2: "#b88c28",
        shirt: ARMOUR.light, shirt2: ARMOUR.mid, accent: "#3f6ac0",
        belt: "#3f4759", pants: ARMOUR.mid, pants2: ARMOUR.dark,
        shoes: "#4a3550", shoes2: "#33253a",
      },
    },
    {
      hair: "pony", weapon: "staff",
      pal: {
        skin: "#f6c9a4", skinShade: "#d09a75",
        hair: "#5b3520", hair2: "#7d4b2d",
        shirt: "#3f6ac0", shirt2: "#2d4d92", accent: "#cfe4ff",
        belt: "#33253a", pants: ARMOUR.mid, pants2: ARMOUR.dark,
        shoes: "#33253a", shoes2: "#241a29",
      },
    },
    {
      hair: "bob", weapon: "axe", skirt: true,
      pal: {
        skin: "#f6c9a4", skinShade: "#d09a75",
        hair: "#c98a3c", hair2: "#e5ad5c",
        shirt: "#5aa06a", shirt2: "#3f7a4e", accent: "#e0b040",
        belt: "#33253a", pants: "#4a3550", pants2: "#33253a",
        shoes: "#3f4759", shoes2: "#2c323f",
      },
    },
  ],

  dog: { fur: "#d8d2c0", fur2: "#aba491", nose: "#2a1a14", collar: "#7a2038" },

  foes: [
    {
      // Zombie
      hp: 1, speed: 0.62, weight: 4,
      fighter: {
        hair: "short",
        pal: {
          skin: "#7fa06a", skinShade: "#5c7a4a",
          hair: "#3a3a2a", hair2: "#4d4d36",
          shirt: "#6b5a3c", shirt2: "#4e412a", accent: "#3a3a2a",
          belt: "#3a2f20", pants: "#4a4436", pants2: "#332f24",
          shoes: "#2a2418", shoes2: "#1d1a10",
        },
      },
    },
    {
      // Skeleton
      hp: 1, speed: 0.9, weight: 3,
      fighter: {
        hair: "skull", weapon: "sword",
        pal: {
          skin: "#e8e4d0", skinShade: "#b3ad95",
          hair: "#e8e4d0", hair2: "#b3ad95",
          shirt: "#d8d2be", shirt2: "#aaa491", accent: "#8e99ad",
          belt: "#5b6478", pants: "#d8d2be", pants2: "#aaa491",
          shoes: "#5b6478", shoes2: "#3f4759",
        },
      },
    },
    {
      // Hooded ghoul
      hp: 1, speed: 0.78, weight: 2,
      fighter: {
        hair: "hood", weapon: "club",
        pal: {
          skin: "#7fa06a", skinShade: "#5c7a4a",
          hair: "#2a2233", hair2: "#3d3450",
          shirt: "#3b2f4a", shirt2: "#2a2136", accent: "#7a2038",
          belt: "#241a29", pants: "#33253a", pants2: "#241a29",
          shoes: "#1d1420", shoes2: "#140d18",
        },
      },
    },
    {
      // Red devil
      hp: 2, speed: 0.58, weight: 1,
      fighter: {
        hair: "helm", big: true,
        pal: {
          skin: "#c04030", skinShade: "#8e2a1e",
          hair: "#f0d060", hair2: "#c0a038",
          shirt: "#8e2a1e", shirt2: "#6b1d14", accent: "#e0b040",
          belt: "#2a1420", pants: "#6b1d14", pants2: "#4c130d",
          shoes: "#2a1420", shoes2: "#1a0c14",
        },
      },
    },
  ],

  sky(f) {
    bandSky(f, ["#050a14", "#08111f", "#0c1c2e", "#122942", "#1a3a55"]);
    stars(f, 46, "#b9d4f0");
    moon(f, Math.round(f.W * 0.24), Math.round(f.horizon * 0.24), 13, "#e8f0ff", "#c2cfe4");
    // Bats crossing the moon.
    for (let i = 0; i < 3; i++) {
      const x = Math.round((f.W * 1.3 - (f.t * (0.3 + i * 0.09)) % (f.W * 1.7)) + i * 20);
      if (x < -6 || x > f.W) continue;
      const y = Math.round(f.horizon * 0.2 + Math.sin((f.t + i * 70) / 22) * 5 + i * 7);
      const up = Math.floor(f.t / 6 + i) % 2 === 0;
      rect(f, x + 2, y, 2, 2, "#0a0a12");
      rect(f, x, y - (up ? 1 : 0), 2, 1, "#0a0a12");
      rect(f, x + 4, y - (up ? 1 : 0), 2, 1, "#0a0a12");
    }
  },

  far(f) {
    // Bare trees on the far bank.
    tile(f, 34, 0.14, 40, (x, i) => {
      if (hash(i, 91) < 0.4) return;
      const base = f.horizon;
      const h = Math.max(18, Math.round(base * (0.2 + hash(i, 92) * 0.2)));
      rect(f, x + 3, base - h, 2, h, "#0d1524");
      rect(f, x, base - h + 5, 4, 1, "#0d1524");
      rect(f, x + 4, base - h + 3, 5, 1, "#0d1524");
      rect(f, x + 1, base - h + 10, 3, 1, "#0d1524");
      rect(f, x + 4, base - h + 12, 4, 1, "#0d1524");
    });
  },

  mid(f) {
    const base = f.horizon;
    // Chapel ruin.
    tile(f, 176, 0.3, 80, (x, i) => {
      if (hash(i, 93) < 0.5) return;
      const h = Math.max(30, Math.round(base * 0.34));
      rect(f, x, base - h, 30, h, "#1d2436");
      rect(f, x, base - h, 30, 2, "#2c3550");
      rect(f, x + 11, base - h - 12, 8, 12, "#1d2436");
      rect(f, x + 13, base - h - 18, 4, 7, "#1d2436");
      rect(f, x + 11, base - h - 16, 8, 2, "#1d2436");
      rect(f, x + 5, base - 14, 6, 14, "#080c14");
      rect(f, x + 19, base - 14, 6, 14, "#080c14");
      rect(f, x + 13, base - h + 8, 4, 6, "#3a4a6b");
    });

    // Iron railings with gravestones behind them.
    tile(f, 11, 0.62, 20, (x, i) => {
      rect(f, x, base - 14, 1, 14, "#141a28");
      rect(f, x, base - 15, 1, 1, "#232c42");
      if (i % 4 === 0) rect(f, x, base - 12, 11, 1, "#141a28");
      if (hash(i, 94) > 0.72) {
        rect(f, x + 3, base - 9, 5, 9, "#2e3446");
        rect(f, x + 4, base - 11, 3, 2, "#2e3446");
      }
    });
  },

  ground(f) {
    const top = f.groundTop;
    rect(f, 0, f.horizon, f.W, top - f.horizon + 4, "#243020");
    rect(f, 0, top + 2, f.W, f.H - top, "#31402a");
    rect(f, 0, top + 2, f.W, 2, "#3f5236");

    // Grave mounds and crosses in the walkable band.
    tile(f, 47, 1, 30, (x, i) => {
      const y = top + 8 + Math.round(hash(i, 95) * (f.groundBottom - top - 10));
      const r = hash(i, 96);
      if (r > 0.66) {
        rect(f, x, y - 11, 7, 11, "#6b7280");
        rect(f, x + 1, y - 13, 5, 2, "#6b7280");
        rect(f, x + 2, y - 9, 3, 1, "#4c515c");
        rect(f, x + 2, y - 7, 3, 1, "#4c515c");
      } else if (r > 0.42) {
        rect(f, x + 2, y - 12, 2, 12, "#7a818f");
        rect(f, x, y - 9, 6, 2, "#7a818f");
      }
    });

    // Mud and tufts.
    tile(f, 6, 1, 12, (x, i) => {
      if (hash(i, 97) > 0.68) rect(f, x, top + 5 + Math.round(hash(i, 98) * 20), 2, 1, "#3f5236");
    });

    // Marsh water along the front.
    rect(f, 0, f.groundBottom + 1, f.W, f.H - f.groundBottom, "#16283a");
    for (let y = f.groundBottom + 3; y < f.H; y += 4) {
      const off = Math.round(Math.sin((f.t + y * 9) / 26) * 3);
      tile(f, 15, 1.2, 16, (x) => rect(f, x + off, y, 7, 1, "#22405c"));
    }
  },

  fore(f) {
    // Gnarled foreground trees.
    tile(f, 126, 1.3, 50, (x, i) => {
      const y = f.groundBottom + 3;
      const h = 52 + Math.round(hash(i, 99) * 14);
      rect(f, x, y - h, 5, h, "#120c14");
      rect(f, x + 1, y - h, 1, h, "#1e1420");
      rect(f, x - 6, y - h + 8, 7, 2, "#120c14");
      rect(f, x - 9, y - h + 4, 4, 5, "#120c14");
      rect(f, x + 5, y - h + 14, 8, 2, "#120c14");
      rect(f, x + 12, y - h + 8, 3, 7, "#120c14");
      rect(f, x - 3, y - 2, 11, 2, "#120c14");
    });

    // Mist drifting across the ground.
    f.ctx.save();
    f.ctx.globalAlpha = 0.13;
    f.ctx.fillStyle = "#cfe4ff";
    for (let k = 0; k < 3; k++) {
      const y = f.groundBottom - 4 - k * 5;
      const off = Math.round((f.t * (0.25 + k * 0.12)) % (f.W + 60)) - 60;
      f.ctx.fillRect(off, y, 46, 2);
      f.ctx.fillRect(off + 70, y, 30, 2);
      f.ctx.fillRect(off - 90, y, 38, 2);
    }
    f.ctx.restore();
  },
};
