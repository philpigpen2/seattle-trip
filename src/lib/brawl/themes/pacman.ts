// Stage 6 — THE MAZE. Pac-Man: black ground, blue walls, a corridor of dots
// that disappears behind the party, and four ghosts coming the other way.
import { hash, rect, tile, type Frame } from "../bg";
import { hudText } from "../hud";
import type { Palette } from "../sprites";
import type { Theme } from "./types";

const BLUE = "#2121de";
const BLUE2 = "#4a4aff";
const DOT = "#ffb897";
const INK = "#ffffff";
const SHADOW = "#000000";

function ghostPal(body: string): Palette {
  return {
    skin: "#ffffff", skinShade: "#c8c8d8",
    hair: body, hair2: body,
    shirt: body, shirt2: body, accent: "#ffffff",
    belt: body, pants: body, pants2: body,
    shoes: body, shoes2: body,
  };
}

function player(shirt: string, shirt2: string, accent: string): Palette {
  return {
    skin: "#f0b892", skinShade: "#c98a68",
    hair: "#3a2a20", hair2: "#5a4231",
    shirt, shirt2, accent,
    belt: "#1a1a2e", pants: "#22224a", pants2: "#16162f",
    shoes: "#ffd800", shoes2: "#c8a800",
  };
}

/** A length of maze wall: blue outline, hollow middle, rounded ends. */
function wall(f: Frame, x: number, y: number, w: number, h: number) {
  rect(f, x, y, w, h, BLUE);
  rect(f, x + 1, y + 1, w - 2, h - 2, "#000000");
  rect(f, x, y, w, 1, BLUE2);
  rect(f, x, y, 1, 1, "#000000");
  rect(f, x + w - 1, y, 1, 1, "#000000");
  rect(f, x, y + h - 1, 1, 1, "#000000");
  rect(f, x + w - 1, y + h - 1, 1, 1, "#000000");
}

export const pacman: Theme = {
  id: "pacman",
  intro: ["READY!"],
  scroll: 0.6,
  style: "brawl",
  impact: "points",
  ink: "#ffd800",
  shadow: SHADOW,

  // 1UP / HIGH SCORE / 2UP across the top, lives and fruit along the bottom.
  hud(f, s) {
    const y = 4;
    hudText(f, "1UP", Math.round(f.W * 0.1), y, INK, { align: "center" });
    if (Math.floor(s.t / 18) % 2 === 0) {
      hudText(f, String(s.score).padStart(5, "0"), Math.round(f.W * 0.1), y + 9, INK, { align: "center" });
    }
    hudText(f, "HIGH SCORE", Math.round(f.W / 2), y, INK, { align: "center" });
    hudText(f, String(s.hi).padStart(6, "0"), Math.round(f.W / 2), y + 9, INK, { align: "center" });
    hudText(f, "2UP", Math.round(f.W * 0.9), y, INK, { align: "center" });
    hudText(f, "00000", Math.round(f.W * 0.9), y + 9, INK, { align: "center" });

    // Spare lives, drawn as the man himself.
    for (let i = 0; i < 3; i++) {
      const x = 4 + i * 11;
      const by = f.H - 11;
      rect(f, x + 1, by, 6, 8, "#ffd800");
      rect(f, x, by + 1, 8, 6, "#ffd800");
      rect(f, x + 4, by + 2, 4, 2, "#000000");
      rect(f, x + 5, by + 4, 3, 2, "#000000");
    }
    // Cherry.
    const cx = f.W - 14;
    const cy = f.H - 11;
    rect(f, cx, cy + 3, 4, 4, "#e83030");
    rect(f, cx + 4, cy + 4, 4, 4, "#e83030");
    rect(f, cx, cy + 4, 1, 2, "#ff8080");
    rect(f, cx + 3, cy, 2, 3, "#38a038");
    rect(f, cx + 5, cy - 1, 3, 1, "#38a038");
  },

  heroes: [
    { hair: "long", pal: player("#ffd800", "#c8a800", "#e83030") },
    { hair: "short", pal: player("#ffd800", "#c8a800", "#2121de") },
    { hair: "pony", pal: player("#ffe45c", "#d8bc2c", "#38a038") },
    { hair: "bob", skirt: true, pal: player("#ffe45c", "#d8bc2c", "#ffb8ff") },
  ],

  dog: { fur: "#ffd800", fur2: "#d8b400", nose: "#000000", collar: "#e83030" },

  foes: [
    { hp: 1, speed: 0.95, weight: 3, sprite: "ghost", fighter: { hair: "bald", pal: ghostPal("#ff0000") } },
    { hp: 1, speed: 0.9, weight: 3, sprite: "ghost", fighter: { hair: "bald", pal: ghostPal("#ffb8ff") } },
    { hp: 1, speed: 0.88, weight: 3, sprite: "ghost", fighter: { hair: "bald", pal: ghostPal("#00ffff") } },
    { hp: 1, speed: 0.8, weight: 3, sprite: "ghost", fighter: { hair: "bald", pal: ghostPal("#ffb852") } },
  ],

  sky(f) {
    rect(f, 0, 0, f.W, f.H, "#000000");
  },

  far(f) {
    // The rest of the maze, seen behind the corridor.
    const base = f.horizon;
    tile(f, 27, 0.25, 40, (x, i) => {
      const h = Math.max(10, Math.round(base * (0.16 + hash(i, 141) * 0.2)));
      const y = base - h - Math.round(hash(i, 142) * base * 0.42);
      wall(f, x, y, 19, h);
      if (hash(i, 143) > 0.62) wall(f, x + 4, y - 11, 11, 8);
    });
    // Distant dots.
    tile(f, 9, 0.25, 12, (x, i) => {
      const y = Math.round(base * (0.2 + hash(i, 144) * 0.6));
      if (hash(i, 145) > 0.55) rect(f, x, y, 1, 1, "#6b4a3a");
    });
  },

  mid(f) {
    // The wall running along the top of the corridor.
    const y = f.horizon - 11;
    tile(f, 44, 0.85, 40, (x, i) => {
      wall(f, x, y, 40, 11);
      if (hash(i, 146) > 0.7) wall(f, x + 12, y - 13, 16, 11);
    });
  },

  ground(f) {
    const top = f.groundTop;
    const bot = f.groundBottom;
    rect(f, 0, f.horizon, f.W, f.H - f.horizon, "#000000");

    // The dots the party is walking through. Everything behind them is eaten.
    const eaten = Math.round(f.W * 0.42);
    for (let row = 0; row < 3; row++) {
      const y = top + 8 + row * Math.round((bot - top - 8) / 3);
      tile(f, 10, 1, 14, (x, i) => {
        if (x < eaten) return;
        const power = (i & 15) === 0 && row === 1;
        if (power) {
          if (Math.floor(f.t / 9) % 2 === 0) rect(f, x - 1, y - 1, 5, 5, DOT);
        } else {
          rect(f, x, y, 2, 2, DOT);
        }
      });
    }
  },

  fore(f) {
    // The wall closing the corridor along the bottom of the screen.
    const y = f.groundBottom + 2;
    tile(f, 44, 1.1, 40, (x, i) => {
      wall(f, x, y, 40, Math.max(6, f.H - y - 1));
      if (hash(i, 147) > 0.72) wall(f, x + 14, y - 9, 14, 8);
    });
  },
};
