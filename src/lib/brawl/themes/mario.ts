import { rect } from "../bg";
import { hudText } from "../hud";
import { GOLD, WHITE, BLACK } from "./mario-art";
import { createMario } from "./mario-sim";
import type { Theme } from "./types";

export const mario: Theme = {
  id: "mario",
  intro: ["WORLD 1-1"],
  targetH: 240,
  scroll: 0,
  style: "stomp",
  impact: "points",
  ink: WHITE,
  shadow: BLACK,
  custom: createMario,

  hud(f, s) {
    const y = 6;
    const cols = [0.07, 0.35, 0.58, 0.82].map((c) => Math.round(f.W * c));
    hudText(f, "MARIO", cols[0], y, WHITE);
    hudText(f, String(s.score).padStart(6, "0"), cols[0], y + 9, WHITE);

    const step = Math.floor(s.t / 7) % 4;
    const cw = [4, 3, 1, 3][step];
    rect(f, cols[1] + 2 - Math.floor(cw / 2), y + 9, cw, 7, GOLD[0]);
    rect(f, cols[1] + 2 - Math.floor(cw / 2), y + 9, cw, 1, "#fce0a0");
    hudText(f, "X" + String(s.coins).padStart(2, "0"), cols[1] + 8, y + 9, WHITE);

    hudText(f, "WORLD", cols[2], y, WHITE);
    hudText(f, "1-1", cols[2] + 9, y + 9, WHITE);

    hudText(f, "TIME", cols[3], y, WHITE);
    hudText(f, String(Math.max(0, s.timer)).padStart(3, "0"), cols[3] + 5, y + 9, WHITE);
  },

  heroes: [],
  dog: { fur: "#a8603a", fur2: "#8a4a2a", nose: BLACK, collar: "#d82800" },
  foes: [],
  sky() {},
  far() {},
  mid() {},
  ground() {},
  fore() {},
};
