// Stage 1 — THE STREET. Double Dragon II: a city block after dark.
import { bandSky, hash, lightCone, moon, rect, stars, tile } from "../bg";
import { bar, hudText, lives } from "../hud";
import type { Theme } from "./types";

const INK = "#ffe9a8";
const SHADOW = "#2a0f22";

const NEON = ["#ff5c7a", "#4fd1ff", "#ffd166", "#7cf29a", "#c78bff"];
const SIGNS = ["BAR", "PIZZA", "24H", "MOTEL", "TATTOO", "NOODLE", "SODA", "ARCADE"];

export const street: Theme = {
  id: "street",
  intro: ["MISSION 1", "THE STREET"],
  scroll: 0.55,
  style: "brawl",
  impact: "spark",
  ink: INK,
  shadow: SHADOW,

  // The arcade original showed a life bar and a spare-lives count, nothing else.
  hud(f, s) {
    const pad = 5;
    if (Math.floor(s.t / 22) % 2 === 0) hudText(f, "1UP", pad, pad, "#ff6b6b", { shadow: SHADOW });
    hudText(f, String(s.score).padStart(6, "0"), pad, pad + 9, INK, { shadow: SHADOW });
    bar(f, pad + 1, pad + 19, 44, 4, s.health[1], "#e6483d", "#ff9a86", "#3a1420");
    lives(f, pad + 1, pad + 29, 3, "#4fd1ff");
    hudText(f, "HI", f.W - pad, pad, "#ff6b6b", { align: "right", shadow: SHADOW });
    hudText(f, String(s.hi).padStart(6, "0"), f.W - pad, pad + 9, INK, { align: "right", shadow: SHADOW });
    if (f.W > 210) {
      bar(f, f.W - pad - 44, pad + 19, 44, 4, s.health[0], "#4fd1ff", "#a8ecff", "#12304a");
    }
  },

  heroes: [
    {
      // Bethany
      hair: "long",
      pal: {
        skin: "#f0b892", skinShade: "#c98a68",
        hair: "#8a3a1e", hair2: "#b1522c",
        shirt: "#12b0a0", shirt2: "#0b8377", accent: "#ffe066",
        belt: "#2a2233", pants: "#2d3350", pants2: "#222840",
        shoes: "#f4f1ea", shoes2: "#cfc9bd",
      },
    },
    {
      // Phil
      hair: "short",
      pal: {
        skin: "#f0b892", skinShade: "#c98a68",
        hair: "#3a2a20", hair2: "#5a4231",
        shirt: "#2f6df0", shirt2: "#2350bb", accent: "#f4f1ea",
        belt: "#241d2c", pants: "#4a4a58", pants2: "#3a3a46",
        shoes: "#e6483d", shoes2: "#b6362e",
      },
    },
    {
      // Evelyn
      hair: "pony",
      pal: {
        skin: "#f6c9a4", skinShade: "#d09a75",
        hair: "#5b3520", hair2: "#7d4b2d",
        shirt: "#9b5cf0", shirt2: "#7a41c4", accent: "#ffd166",
        belt: "#2a2233", pants: "#22304d", pants2: "#1a253c",
        shoes: "#ffd166", shoes2: "#d3a63f",
      },
    },
    {
      // Charlotte
      hair: "bob",
      skirt: true,
      pal: {
        skin: "#f6c9a4", skinShade: "#d09a75",
        hair: "#c98a3c", hair2: "#e5ad5c",
        shirt: "#ff5c8a", shirt2: "#d63f6c", accent: "#ffffff",
        belt: "#2a2233", pants: "#3a5fb0", pants2: "#2d4a8c",
        shoes: "#f4f1ea", shoes2: "#cfc9bd",
      },
    },
  ],

  dog: { fur: "#e0b170", fur2: "#bd8c4e", nose: "#2a1a14", collar: "#e6483d" },

  foes: [
    {
      hp: 1, speed: 0.85, weight: 3,
      fighter: {
        hair: "mohawk",
        pal: {
          skin: "#d99a72", skinShade: "#b0714f",
          hair: "#b04ad6", hair2: "#7f2ea0",
          shirt: "#3fa64a", shirt2: "#2f7d37", accent: "#1d1a2b",
          belt: "#1d1a2b", pants: "#3f4bb0", pants2: "#2f3888",
          shoes: "#2a2233", shoes2: "#1d1a2b",
        },
      },
    },
    {
      hp: 1, speed: 0.95, weight: 3,
      fighter: {
        hair: "bald",
        pal: {
          skin: "#c98a5e", skinShade: "#a06740",
          hair: "#c98a5e", hair2: "#a06740",
          shirt: "#e07b39", shirt2: "#b45c26", accent: "#2a2233",
          belt: "#2a2233", pants: "#5a4b7a", pants2: "#463a60",
          shoes: "#2a2233", shoes2: "#1d1a2b",
        },
      },
    },
    {
      hp: 1, speed: 0.8, weight: 2,
      fighter: {
        hair: "cap",
        pal: {
          skin: "#e8b48c", skinShade: "#bd8763",
          hair: "#2a2233", hair2: "#3d3450",
          shirt: "#c0392b", shirt2: "#94291e", accent: "#ffd166",
          belt: "#1d1a2b", pants: "#2f3a52", pants2: "#232c40",
          shoes: "#3a2a20", shoes2: "#2a1e17",
        },
      },
    },
    {
      hp: 1, speed: 1.0, weight: 2,
      fighter: {
        hair: "pony",
        pal: {
          skin: "#f0b892", skinShade: "#c98a68",
          hair: "#e8b23c", hair2: "#c08f26",
          shirt: "#d6336c", shirt2: "#a52350", accent: "#ffffff",
          belt: "#1d1a2b", pants: "#2a2233", pants2: "#1d1a2b",
          shoes: "#d6336c", shoes2: "#a52350",
        },
      },
    },
    {
      // The big one — takes two hits.
      hp: 2, speed: 0.6, weight: 1, scale: 1.18,
      fighter: {
        hair: "bald", big: true,
        pal: {
          skin: "#c47a4a", skinShade: "#9c5b33",
          hair: "#c47a4a", hair2: "#9c5b33",
          shirt: "#8e44ad", shirt2: "#6d3186", accent: "#ffd166",
          belt: "#1d1a2b", pants: "#2a2233", pants2: "#1d1a2b",
          shoes: "#5a3a22", shoes2: "#432b18",
        },
      },
    },
  ],

  sky(f) {
    bandSky(f, ["#0a0b23", "#151538", "#26184a", "#3d1f52", "#5c2a55", "#8a3f52"]);
    stars(f, 70, "#e9e6ff");
    moon(f, Math.round(f.W * 0.78 - (f.cam * 0.02) % (f.W * 3)) + f.W, Math.round(f.horizon * 0.22), 7, "#fdf6d0", "#ddd2a8");
  },

  far(f) {
    const base = f.horizon;
    tile(f, 19, 0.12, 40, (x, i) => {
      const h = Math.max(22, Math.round(base * (0.24 + hash(i, 3) * 0.34)));
      const w = 13 + Math.floor(hash(i, 4) * 9);
      rect(f, x, base - h, w, h, "#151233");
      rect(f, x, base - h, w, 1, "#241d47");
      for (let wy = base - h + 4; wy < base - 4; wy += 5) {
        for (let wx = x + 2; wx < x + w - 2; wx += 4) {
          if (hash(wx * 7 + wy * 13, 5) > 0.55) {
            rect(f, wx, wy, 2, 2, hash(wx + wy, 6) > 0.5 ? "#f2c14e" : "#6f6bb5");
          }
        }
      }
      if (hash(i, 7) > 0.88) {
        rect(f, x + Math.floor(w / 2), base - h - 8, 1, 8, "#151233");
        if (Math.floor(f.t / 30) % 2 === 0) rect(f, x + Math.floor(w / 2), base - h - 9, 1, 1, "#ff4d4d");
      }
    });
  },

  mid(f) {
    const base = f.horizon;
    tile(f, 44, 0.34, 60, (x, i) => {
      const h = Math.max(38, Math.round(base * (0.42 + hash(i, 11) * 0.32)));
      const w = 34 + Math.floor(hash(i, 12) * 10);
      const brick = hash(i, 13) > 0.5 ? "#3b2740" : "#452b39";
      rect(f, x, base - h, w, h, brick);
      rect(f, x, base - h, w, 2, "#553751");
      rect(f, x + 1, base - h + 2, w - 2, 1, "#2b1c2f");

      // Windows
      for (let wy = base - h + 6; wy < base - 12; wy += 9) {
        for (let wx = x + 3; wx < x + w - 5; wx += 8) {
          const lit = hash(wx * 3 + wy * 5 + i, 14) > 0.42;
          rect(f, wx, wy, 5, 6, lit ? "#ffd166" : "#1d1630");
          rect(f, wx, wy, 5, 1, lit ? "#fff0bd" : "#2a2140");
          if (lit && hash(wx + wy, 15) > 0.8) rect(f, wx + 1, wy + 2, 3, 4, "#2a2140");
        }
      }

      // Fire escape
      if (hash(i, 16) > 0.55) {
        const fx = x + w - 10;
        for (let fy = base - h + 12; fy < base - 6; fy += 10) {
          rect(f, fx, fy, 9, 1, "#20182e");
          rect(f, fx, fy + 1, 1, 9, "#20182e");
          rect(f, fx + 8, fy + 1, 1, 9, "#20182e");
        }
      }

      // Neon sign
      if (hash(i, 17) > 0.45) {
        const sign = SIGNS[Math.floor(hash(i, 18) * SIGNS.length)];
        const col = NEON[Math.floor(hash(i, 19) * NEON.length)];
        const sw = sign.length * 4 + 4;
        const sy = base - h + 10 + Math.floor(hash(i, 20) * 10);
        const flicker = hash(i, 21) > 0.8 && Math.floor(f.t / 7) % 9 === 0;
        rect(f, x + 3, sy, sw, 9, "#160f22");
        if (!flicker) {
          rect(f, x + 3, sy, sw, 1, col);
          rect(f, x + 3, sy + 8, sw, 1, col);
          for (let ci = 0; ci < sign.length; ci++) {
            rect(f, x + 5 + ci * 4, sy + 3, 2, 3, col);
          }
        }
      }
    });
  },

  ground(f) {
    const top = f.groundTop;
    const bot = f.groundBottom;

    // Shop fronts and shutters at street level.
    tile(f, 38, 0.72, 40, (x, i) => {
      const h = Math.max(20, Math.round(f.horizon * 0.16));
      rect(f, x, f.horizon - h, 36, h, hash(i, 31) > 0.5 ? "#33203a" : "#2c2136");
      rect(f, x, f.horizon - h, 36, 1, "#4a3350");
      if (hash(i, 32) > 0.55) {
        rect(f, x + 4, f.horizon - h + 5, 12, h - 5, "#1a1226");
        for (let sy = f.horizon - h + 6; sy < f.horizon - 1; sy += 3) rect(f, x + 4, sy, 12, 1, "#2c2136");
      } else {
        rect(f, x + 5, f.horizon - h + 4, 10, h - 4, "#4b2f2a");
        rect(f, x + 5, f.horizon - h + 4, 10, 1, "#6b463c");
        rect(f, x + 13, f.horizon - h + 12, 1, 2, "#ffd166");
      }
      if (hash(i, 33) > 0.7) {
        rect(f, x + 20, f.horizon - h + 8, 13, 8, "#1f1730");
        rect(f, x + 21, f.horizon - h + 9, 11, 6, hash(i, 34) > 0.5 ? "#3c8ad6" : "#d64f7a");
      }
      // Graffiti tag
      if (hash(i, 35) > 0.72) {
        const c = NEON[Math.floor(hash(i, 36) * NEON.length)];
        const gy = f.horizon - 11;
        rect(f, x + 20, gy + 2, 2, 5, c);
        rect(f, x + 22, gy + 1, 2, 2, c);
        rect(f, x + 24, gy, 2, 7, c);
        rect(f, x + 26, gy + 3, 3, 2, c);
        rect(f, x + 29, gy + 1, 2, 5, c);
        rect(f, x + 19, gy + 8, 12, 1, c);
      }
    });

    // Chain-link fence over the lower wall — the signature Double Dragon alley.
    tile(f, 4, 0.72, 8, (x, i) => {
      const fy = f.horizon - 17;
      f.ctx.fillStyle = "#5f5a72";
      for (let y = fy; y < f.horizon - 1; y += 4) {
        f.ctx.fillRect(Math.round(x), y + ((i & 1) ? 2 : 0), 1, 2);
        f.ctx.fillRect(Math.round(x) + 2, y + ((i & 1) ? 0 : 2), 1, 2);
      }
    });
    tile(f, 46, 0.72, 30, (x) => {
      rect(f, x, f.horizon - 19, 2, 19, "#3b3549");
      rect(f, x, f.horizon - 19, 2, 1, "#6b6480");
    });
    rect(f, 0, f.horizon - 19, f.W, 2, "#4a4358");

    // Kerb + pavement
    rect(f, 0, f.horizon, f.W, 2, "#6b6480");
    rect(f, 0, f.horizon + 2, f.W, top - f.horizon - 2, "#3b3549");
    rect(f, 0, top, f.W, bot - top, "#4a4358");
    rect(f, 0, top, f.W, 1, "#5d5570");

    // Paving seams scroll with the ground.
    tile(f, 16, 1, 20, (x) => {
      f.ctx.fillStyle = "#413b4e";
      f.ctx.fillRect(Math.round(x), top + 1, 1, bot - top - 1);
    });
    for (let y = top + 8; y < bot; y += 9) rect(f, 0, y, f.W, 1, "#443e52");

    // Gutter + road at the very bottom.
    rect(f, 0, bot, f.W, 2, "#2f2a3d");
    rect(f, 0, bot + 2, f.W, f.H - bot, "#241f31");
    tile(f, 26, 1.15, 20, (x) => rect(f, x, bot + 6, 12, 2, "#4d4560"));

    // Litter and puddles on the walkway.
    tile(f, 31, 1.05, 24, (x, i) => {
      const y = top + 6 + Math.floor(hash(i, 41) * (bot - top - 10));
      const kind = hash(i, 42);
      if (kind > 0.72) {
        rect(f, x, y, 5, 2, "#3a3448");
        rect(f, x + 1, y - 1, 3, 1, "#4a4358");
      } else if (kind > 0.6) {
        rect(f, x, y, 7, 2, "#2f3a52");
        rect(f, x + 1, y, 5, 1, "#4a6ea8");
      }
    });

    // Oil drums and dumpsters against the wall.
    tile(f, 89, 1.0, 40, (x, i) => {
      const y = top + 3 + Math.floor(hash(i, 47) * 5);
      if (hash(i, 48) > 0.55) {
        rect(f, x, y - 15, 11, 15, "#8a3f2a");
        rect(f, x, y - 15, 11, 1, "#b3573c");
        rect(f, x, y - 11, 11, 1, "#5f2a1c");
        rect(f, x, y - 5, 11, 1, "#5f2a1c");
        rect(f, x + 3, y - 13, 5, 4, "#d8d2be");
      } else {
        rect(f, x - 2, y - 12, 20, 12, "#2f6b4a");
        rect(f, x - 3, y - 14, 22, 3, "#3f8a5f");
        rect(f, x + 2, y - 9, 3, 6, "#255539");
        rect(f, x + 11, y - 9, 3, 6, "#255539");
      }
    });

    // Trash cans and hydrants against the wall.
    tile(f, 67, 1.0, 30, (x, i) => {
      const y = top + 2 + Math.floor(hash(i, 43) * 6);
      if (hash(i, 44) > 0.62) {
        rect(f, x, y - 11, 9, 11, "#4a5561");
        rect(f, x, y - 11, 9, 1, "#6d7a88");
        rect(f, x - 1, y - 13, 11, 2, "#5b6774");
        rect(f, x + 2, y - 8, 1, 7, "#39424c");
        rect(f, x + 6, y - 8, 1, 7, "#39424c");
      } else if (hash(i, 45) > 0.5) {
        rect(f, x + 1, y - 9, 5, 9, "#c0392b");
        rect(f, x, y - 6, 7, 2, "#c0392b");
        rect(f, x + 2, y - 11, 3, 2, "#e05a4c");
      }
    });

  },

  fore(f) {
    const bot = f.groundBottom;

    // Lampposts in front of everything, casting light down the pavement.
    tile(f, 104, 1.28, 40, (x, i) => {
      const y = bot + 2;
      const h = 46 + Math.floor(hash(i, 46) * 8);
      lightCone(f, x + 1, y - h + 6, h + 4, 34, "#ffd98a");
      rect(f, x, y - h, 3, h, "#1b1626");
      rect(f, x + 1, y - h, 1, h, "#2e2740");
      rect(f, x - 4, y - h - 4, 11, 4, "#1b1626");
      rect(f, x - 3, y - h - 3, 9, 2, "#ffe9a8");
      rect(f, x - 2, y, 7, 2, "#1b1626");
    });
  },
};
