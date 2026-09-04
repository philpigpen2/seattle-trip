// Stage 4 — THE STREETS. Konami's TMNT: a New York block on fire, purple Foot
// Soldiers, four shells and four different weapons.
import { bandSky, hash, lightCone, rect, stars, tile, type Frame } from "../bg";
import { bar, hudText } from "../hud";
import type { Fighter, Palette } from "../sprites";
import type { Theme } from "./types";

const INK = "#ffd166";
const SHADOW = "#0a1030";
const BRICK = "#6b3a30";
const BRICK2 = "#8a4c3c";

function shellPal(band: string): Palette {
  return {
    skin: "#7ec850", skinShade: "#57993a",
    hair: band, hair2: band,
    shirt: "#6bbd3a", shirt2: "#4f9129", accent: band,
    belt: "#8a5a32", pants: "#6bbd3a", pants2: "#4f9129",
    shoes: "#8a5a32", shoes2: "#63401f",
  };
}

function turtle(band: string, weapon: Fighter["weapon"]): Fighter {
  return { hair: "bandana", band, weapon, shell: "#e8c88a", pal: shellPal(band) };
}

/** Flames licking out of a window, redrawn every frame. */
function fire(f: Frame, x: number, y: number, w: number, h: number, seed: number) {
  for (let k = 0; k < h; k += 3) {
    const wob = Math.sin((f.t + k * 3 + seed * 17) / 6) * 2;
    const ww = Math.max(2, Math.round(w - (k / h) * w * 0.8 + wob));
    const c = k < h * 0.3 ? "#fff0b0" : k < h * 0.65 ? "#ffa22a" : "#e0521c";
    rect(f, x - ww / 2 + wob, y - k, ww, 3, c);
  }
}

export const tmnt: Theme = {
  id: "tmnt",
  targetW: 288,
  intro: ["STAGE 1", "THE STREETS"],
  scroll: 0.58,
  style: "blade",
  impact: "puff",
  ink: INK,
  shadow: SHADOW,

  // Four status panels along the bottom, one per player, exactly where the
  // arcade cabinet put them.
  hud(f, s) {
    const pad = 4;
    hudText(f, String(s.score).padStart(6, "0"), pad, pad, INK, { shadow: SHADOW });
    hudText(f, "HI", f.W - pad, pad, "#ff6b6b", { align: "right", shadow: SHADOW });
    hudText(f, String(s.hi).padStart(6, "0"), f.W - pad, pad + 9, INK, { align: "right", shadow: SHADOW });

    const gap = 3;
    const pw = Math.min(48, Math.floor((f.W - pad * 2 - gap * 3) / 4));
    if (pw < 26) return;
    const py = f.H - 15;
    for (let i = 0; i < 4; i++) {
      const px = pad + i * (pw + gap);
      rect(f, px, py, pw, 13, "#101833");
      rect(f, px, py, pw, 1, "#2b3a6b");
      // Little masked head.
      rect(f, px + 2, py + 3, 7, 7, "#6bbd3a");
      rect(f, px + 2, py + 5, 7, 2, s.inks[i]);
      rect(f, px + 5, py + 5, 1, 1, "#ffffff");
      rect(f, px + 8, py + 5, 1, 1, "#ffffff");
      hudText(f, s.labels[i], px + 11, py + 2, s.inks[i]);
      bar(f, px + 11, py + 9, pw - 14, 3, s.health[i], "#3fd06a", "#a8f0c0", "#1b2b1d");
    }
  },

  heroes: [
    turtle("#a05cd6", "staff"),
    turtle("#3f7ad6", "sword"),
    turtle("#e0842a", "nunchaku"),
    turtle("#d63f4a", "sai"),
  ],

  dog: { fur: "#e0b170", fur2: "#bd8c4e", nose: "#2a1a14", collar: "#3fd06a" },

  foes: [
    {
      // Foot Soldier
      hp: 1, speed: 0.92, weight: 5,
      fighter: {
        hair: "hood",
        pal: {
          skin: "#8a8a9a", skinShade: "#63636f",
          hair: "#3a2470", hair2: "#4a2f8a",
          shirt: "#6b3fc0", shirt2: "#4a2b8a", accent: "#2a1a4a",
          belt: "#2a1a4a", pants: "#5a34a8", pants2: "#3f2478",
          shoes: "#2a1a4a", shoes2: "#1c1030",
        },
      },
    },
    {
      // Foot Soldier with a staff
      hp: 1, speed: 0.85, weight: 3,
      fighter: {
        hair: "hood", weapon: "staff",
        pal: {
          skin: "#8a8a9a", skinShade: "#63636f",
          hair: "#2a2a44", hair2: "#3a3a5c",
          shirt: "#4a4a70", shirt2: "#343455", accent: "#2a1a4a",
          belt: "#1c1030", pants: "#3a3a5c", pants2: "#282840",
          shoes: "#1c1030", shoes2: "#120a20",
        },
      },
    },
    {
      // Foot Soldier with a sword
      hp: 1, speed: 1.0, weight: 2,
      fighter: {
        hair: "hood", weapon: "sword",
        pal: {
          skin: "#8a8a9a", skinShade: "#63636f",
          hair: "#6b3fc0", hair2: "#8a5ce0",
          shirt: "#8a5ce0", shirt2: "#6b3fc0", accent: "#2a1a4a",
          belt: "#2a1a4a", pants: "#5a34a8", pants2: "#3f2478",
          shoes: "#2a1a4a", shoes2: "#1c1030",
        },
      },
    },
    {
      // The heavy
      hp: 2, speed: 0.58, weight: 1, scale: 1.2,
      fighter: {
        hair: "mohawk", big: true, weapon: "club",
        pal: {
          skin: "#9aa0a8", skinShade: "#6f757d",
          hair: "#e0842a", hair2: "#b3651c",
          shirt: "#3f6b3a", shirt2: "#2c4d29", accent: "#e0842a",
          belt: "#2a1a14", pants: "#4a4a58", pants2: "#35353f",
          shoes: "#2a1a14", shoes2: "#1a100c",
        },
      },
    },
  ],

  sky(f) {
    bandSky(f, ["#060a24", "#0b1038", "#141c52", "#1e2a66", "#2e3a72"]);
    stars(f, 40, "#c8d4ff");
    // The glow off the fire washes the sky orange on one side.
    const ctx = f.ctx;
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#ff7a2a";
    ctx.fillRect(Math.round(f.W * 0.45), 0, Math.round(f.W * 0.55), f.horizon);
    ctx.restore();
  },

  far(f) {
    const base = f.horizon;
    tile(f, 21, 0.12, 40, (x, i) => {
      const h = Math.max(24, Math.round(base * (0.28 + hash(i, 121) * 0.34)));
      rect(f, x, base - h, 15, h, "#101838");
      rect(f, x, base - h, 15, 1, "#1c2850");
      for (let wy = base - h + 4; wy < base - 4; wy += 5) {
        for (let wx = x + 2; wx < x + 13; wx += 4) {
          if (hash(wx * 7 + wy * 13, 122) > 0.6) rect(f, wx, wy, 2, 2, "#7d88c8");
        }
      }
      // Water tower on the roof.
      if (hash(i, 123) > 0.82) {
        rect(f, x + 4, base - h - 7, 7, 5, "#22284a");
        rect(f, x + 3, base - h - 9, 9, 2, "#2c3358");
        rect(f, x + 5, base - h - 2, 1, 2, "#22284a");
        rect(f, x + 9, base - h - 2, 1, 2, "#22284a");
      }
    });
  },

  mid(f) {
    const base = f.horizon;
    tile(f, 52, 0.34, 60, (x, i) => {
      const burning = hash(i, 124) > 0.72;
      const h = Math.max(44, Math.round(base * (0.5 + hash(i, 125) * 0.3)));
      const w = 42;
      rect(f, x, base - h, w, h, burning ? "#5c2f26" : BRICK);
      rect(f, x, base - h, w, 2, BRICK2);
      for (let y = base - h + 3; y < base; y += 4) rect(f, x, y, w, 1, "#4d2a22");

      for (let wy = base - h + 7; wy < base - 12; wy += 11) {
        for (let wx = x + 4; wx < x + w - 7; wx += 11) {
          const lit = hash(wx * 3 + wy * 5 + i, 126) > 0.45;
          rect(f, wx, wy, 7, 8, lit ? "#ffd166" : "#1b1230");
          rect(f, wx, wy, 7, 1, lit ? "#fff0bd" : "#2a2140");
          rect(f, wx + 3, wy, 1, 8, "#3a2b2b");
          if (burning && wy < base - h + 30) {
            fire(f, wx + 3, wy + 7, 8, 16, wx + i);
          }
        }
      }

      // Fire escape zig-zag.
      const fx = x + w - 12;
      for (let fy = base - h + 14; fy < base - 6; fy += 11) {
        rect(f, fx, fy, 11, 1, "#241a30");
        rect(f, fx, fy + 1, 1, 10, "#241a30");
        rect(f, fx + 10, fy + 1, 1, 10, "#241a30");
        rect(f, fx + 2, fy + 3, 7, 1, "#241a30");
      }

      if (burning) {
        // Smoke rolling off the roof.
        const ctx = f.ctx;
        ctx.save();
        ctx.globalAlpha = 0.35;
        for (let k = 0; k < 6; k++) {
          const sy = base - h - 4 - k * 6 - ((f.t / 3 + i * 9) % 6);
          const sw = 8 + k * 4;
          ctx.fillStyle = k % 2 ? "#3a3550" : "#4a4566";
          ctx.fillRect(Math.round(x + 12 + Math.sin((f.t + k * 30) / 40) * 4 - sw / 2), Math.round(sy), sw, 5);
        }
        ctx.restore();
        fire(f, x + 10, base - h + 2, 12, 14, i);
      }
    });

    // Shop fronts at street level, one of them a pizza place.
    tile(f, 44, 0.66, 40, (x, i) => {
      const h = Math.max(18, Math.round(f.horizon * 0.15));
      rect(f, x, f.horizon - h, 42, h, "#33203a");
      rect(f, x, f.horizon - h, 42, 1, "#4a3350");
      rect(f, x + 4, f.horizon - h + 5, 14, h - 5, "#1a1226");
      rect(f, x + 24, f.horizon - h + 4, 14, 9, "#120c1c");
      const pizza = hash(i, 127) > 0.55;
      rect(f, x + 25, f.horizon - h + 5, 12, 7, pizza ? "#e0392b" : "#2f8ad0");
      if (pizza) {
        rect(f, x + 27, f.horizon - h + 7, 8, 3, "#ffd166");
        rect(f, x + 29, f.horizon - h + 8, 1, 1, "#e0392b");
        rect(f, x + 32, f.horizon - h + 8, 1, 1, "#e0392b");
      }
    });
  },

  ground(f) {
    const top = f.groundTop;
    const bot = f.groundBottom;
    rect(f, 0, f.horizon, f.W, 2, "#7a7290");
    rect(f, 0, f.horizon + 2, f.W, top - f.horizon - 2, "#3b3549");
    rect(f, 0, top, f.W, bot - top, "#57506a");
    rect(f, 0, top, f.W, 1, "#6d6484");
    tile(f, 26, 1, 20, (x) => {
      f.ctx.fillStyle = "#514a63";
      f.ctx.fillRect(Math.round(x), top + 1, 1, bot - top - 1);
    });
    for (let y = top + 11; y < bot; y += 12) rect(f, 0, y, f.W, 1, "#524b66");

    // Manhole covers.
    tile(f, 96, 1, 30, (x, i) => {
      if (hash(i, 128) < 0.5) return;
      const y = top + 12 + Math.round(hash(i, 129) * (bot - top - 18));
      rect(f, x, y, 15, 6, "#3f3a4e");
      rect(f, x + 1, y + 1, 13, 4, "#4d4761");
      rect(f, x + 4, y + 2, 7, 1, "#3f3a4e");
      rect(f, x + 4, y + 4, 7, 1, "#3f3a4e");
    });

    rect(f, 0, bot, f.W, 2, "#332e42");
    rect(f, 0, bot + 2, f.W, f.H - bot, "#262233");
    tile(f, 28, 1.15, 20, (x) => rect(f, x, bot + 7, 13, 2, "#c8b040"));

    // Hydrants, pizza boxes and news-stand clutter.
    tile(f, 59, 1.03, 30, (x, i) => {
      const y = top + 4 + Math.floor(hash(i, 130) * 8);
      const r = hash(i, 131);
      if (r > 0.7) {
        rect(f, x + 1, y - 10, 5, 10, "#c0392b");
        rect(f, x, y - 7, 7, 2, "#c0392b");
        rect(f, x + 2, y - 12, 3, 2, "#e05a4c");
      } else if (r > 0.52) {
        rect(f, x, y - 4, 11, 4, "#d8c8a0");
        rect(f, x, y - 5, 11, 1, "#efe0bc");
        rect(f, x + 3, y - 3, 5, 1, "#c03a2b");
      }
    });

  },

  fore(f) {
    const bot = f.groundBottom;

    // Street lamps, warm against the blue.
    tile(f, 112, 1.26, 40, (x, i) => {
      const y = bot + 2;
      const h = 48 + Math.round(hash(i, 132) * 8);
      lightCone(f, x + 1, y - h + 6, h + 4, 34, "#ffd98a");
      rect(f, x, y - h, 3, h, "#1b1626");
      rect(f, x + 1, y - h, 1, h, "#2e2740");
      rect(f, x - 4, y - h - 4, 11, 4, "#1b1626");
      rect(f, x - 3, y - h - 3, 9, 2, "#ffe9a8");
      rect(f, x - 2, y, 7, 2, "#1b1626");
    });
  },
};
