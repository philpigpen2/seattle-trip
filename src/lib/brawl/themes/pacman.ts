// Pac-Man, Namco 1980. The real 28x31 maze, drawn as wall outlines the way the
// arcade does it, with grid-locked movement, dots, power pellets, four ghosts
// that chase and scatter, and eyes returning to the house.
import type { Frame } from "../bg";
import { drawText } from "../font";
import type { CustomStage, Theme } from "./types";

// # wall  . dot  o power pellet  - ghost-house door  (space) empty
const MAZE = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  "     #.##### ## #####.#     ",
  "     #.##          ##.#     ",
  "     #.## ###--### ##.#     ",
  "######.## #      # ##.######",
  "      .   #      #   .      ",
  "######.## #      # ##.######",
  "     #.## ######## ##.#     ",
  "     #.##          ##.#     ",
  "     #.## ######## ##.#     ",
  "######.## ######## ##.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#.####.#####.##.#####.####.#",
  "#o..##.......  .......##..o#",
  "###.##.##.########.##.##.###",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#.##########.##.##########.#",
  "#..........................#",
  "############################",
];

const COLS = 28;
const ROWS = MAZE.length;

const BLUE = "#2121de";
const DOT = "#ffb897";
const YELLOW = "#ffff00";
const WHITE = "#ffffff";
const FRIGHT = "#2121ff";

// The four ghosts keep their arcade colours; who is wearing them changes with
// the player you pick.
const GHOST_COLOURS = ["#ff0000", "#ffb8ff", "#00ffff", "#ffb852"];

/**
 * Five characters, five slots: whoever you play as becomes Pac-Man and the
 * other four take the ghost colours. Each is told apart by what sits on their
 * head, not by a name.
 */
type Topper = "long" | "cap" | "pony" | "bob" | "ears";
type Member = { topper: Topper; hair: string };
const FAMILY: Member[] = [
  { topper: "long", hair: "#8a3a1e" },
  { topper: "cap", hair: "#2f6df0" },
  { topper: "pony", hair: "#5b3520" },
  { topper: "bob", hair: "#c98a3c" },
  { topper: "ears", hair: "#bd8c4e" },
];

type Dir = 0 | 1 | 2 | 3; // right, down, left, up
const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];

type Actor = {
  col: number;
  row: number;
  /** Offset within the cell, in cells, along the current direction. */
  off: number;
  dir: Dir;
  next: Dir;
  speed: number;
};

type Ghost = Actor & {
  colour: string;
  member: Member;
  mode: "chase" | "scatter" | "fright" | "eyes";
  timer: number;
  scatterCol: number;
  scatterRow: number;
};

type Pop = { x: number; y: number; life: number; text: string };

function isWall(col: number, row: number, doorIsWall: boolean): boolean {
  if (row < 0 || row >= ROWS) return true;
  const c = ((col % COLS) + COLS) % COLS;
  const ch = MAZE[row][c];
  if (ch === "-") return doorIsWall;
  return ch === "#";
}

/**
 * The little bit of hair, cap or ears that says which of them this is. Sized
 * off the head so it works on a ghost dome and on a Pac-Man disc alike.
 */
function topper(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  size: number,
  m: Member,
  facing: Dir,
) {
  const px = (v: number) => Math.max(1, Math.round(v));
  const L = Math.round(left);
  const T = Math.round(top);
  const band = px(size * 0.16);
  const thin = px(size * 0.13);
  ctx.fillStyle = m.hair;
  const put = (x: number, y: number, w: number, h: number) =>
    ctx.fillRect(L + Math.round(x), T + Math.round(y), px(w), px(h));

  switch (m.topper) {
    case "long":
      put(size * 0.12, 0, size * 0.76, band);
      put(size * 0.02, band, thin, size * 0.5);
      put(size * 0.85, band, thin, size * 0.5);
      break;
    case "cap":
      put(size * 0.1, 0, size * 0.8, band * 1.3);
      put(facing === 2 ? -size * 0.16 : size * 0.78, band * 1.1, size * 0.38, thin);
      break;
    case "pony":
      put(size * 0.12, 0, size * 0.76, band);
      put(facing === 2 ? size * 0.84 : -size * 0.1, -size * 0.06, size * 0.26, size * 0.34);
      break;
    case "bob":
      put(size * 0.08, 0, size * 0.84, band);
      put(size * 0.02, band, thin, size * 0.3);
      put(size * 0.85, band, thin, size * 0.3);
      break;
    case "ears":
      // Two upright triangles, the way a chihuahua wears them.
      for (const ex of [size * 0.06, size * 0.68]) {
        const w = size * 0.26;
        const h = size * 0.4;
        const steps = Math.max(2, Math.round(h / 2));
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          put(ex + (w * t) / 2, -h + i * (h / steps), w * (1 - t), h / steps + 1);
        }
      }
      break;
  }
}

export function createPacman(): CustomStage {
  let dots: boolean[][] = [];
  let pellets: boolean[][] = [];
  let W = 0;
  let H = 0;
  let cell = 8;
  let ox = 0;
  let oy = 0;
  let t = 0;
  let points = 0;
  let lives = 3;
  let frightTimer = 0;
  let chain = 0;
  let dying = 0;
  let pops: Pop[] = [];
  let fruit = 0;
  let playerIndex = 1;
  /**
   * Steering by hand. Once somebody takes over they keep him: the attract mode
   * never drives him again, and he only moves while a direction is held, so he
   * stops the moment they do.
   */
  let taken = false;
  let moving = false;
  let wanted: Dir | null = null;
  let held: Dir | null = null;

  let pac: Actor = { col: 13, row: 23, off: 0.5, dir: 2, next: 2, speed: 0.09 };
  let ghosts: Ghost[] = [];

  function resetDots() {
    dots = MAZE.map((line) => Array.from(line, (ch) => ch === "."));
    pellets = MAZE.map((line) => Array.from(line, (ch) => ch === "o"));
  }

  function resetActors() {
    pac = { col: 13, row: 23, off: 0.5, dir: 2, next: 2, speed: 0.085 };
    // Everyone who is not the player takes a ghost colour, in order.
    const others = FAMILY.filter((_, i) => i !== playerIndex);
    ghosts = GHOST_COLOURS.map((colour, i) => ({
      member: others[i],
      col: [13, 11, 13, 15][i],
      row: [11, 14, 14, 14][i],
      off: 0.5,
      dir: (i === 0 ? 2 : 3) as Dir,
      next: (i === 0 ? 2 : 3) as Dir,
      speed: 0.072 + i * 0.003,
      colour,
      mode: "scatter",
      timer: 90 + i * 40,
      scatterCol: [25, 2, 27, 0][i],
      scatterRow: [0, 0, 30, 30][i],
    }));
    frightTimer = 0;
    chain = 0;
  }

  function remainingDots() {
    let n = 0;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (dots[r][c] || pellets[r][c]) n++;
    return n;
  }

  /** First step of the shortest path to the nearest uneaten dot. */
  function pacTarget(): Dir {
    const seen = new Set<number>();
    const queue: { col: number; row: number; first: Dir }[] = [];
    for (let d = 0 as Dir; d < 4; d = (d + 1) as Dir) {
      if (d === ((pac.dir + 2) % 4) && remainingDots() > 2) continue;
      const nc = ((pac.col + DX[d]) % COLS + COLS) % COLS;
      const nr = pac.row + DY[d];
      if (isWall(nc, nr, true)) continue;
      // Never turn directly into a ghost that is right there.
      const blocked = ghosts.some(
        (g) => g.mode !== "fright" && g.mode !== "eyes" && g.col === nc && g.row === nr,
      );
      if (blocked) continue;
      queue.push({ col: nc, row: nr, first: d });
      seen.add(nr * COLS + nc);
    }
    for (let head = 0; head < queue.length && head < 900; head++) {
      const node = queue[head];
      if (dots[node.row]?.[node.col] || pellets[node.row]?.[node.col]) {
        // Do not walk straight into a ghost to get it.
        const danger = ghosts.some(
          (g) =>
            g.mode !== "fright" &&
            g.mode !== "eyes" &&
            Math.abs(g.col - node.col) + Math.abs(g.row - node.row) < 3,
        );
        if (!danger) return node.first;
      }
      for (let d = 0 as Dir; d < 4; d = (d + 1) as Dir) {
        const nc = ((node.col + DX[d]) % COLS + COLS) % COLS;
        const nr = node.row + DY[d];
        if (isWall(nc, nr, true)) continue;
        const key = nr * COLS + nc;
        if (seen.has(key)) continue;
        seen.add(key);
        queue.push({ col: nc, row: nr, first: node.first });
      }
    }
    return pac.dir;
  }

  /** Ghosts pick the legal turn that gets them closest to their target. */
  function ghostChoice(g: Ghost, tc: number, tr: number): Dir {
    let best: Dir = g.dir;
    let bestD = Infinity;
    const inHouse = g.row >= 13 && g.row <= 15 && g.col >= 10 && g.col <= 17;
    // Inside the house the only job is to reach the door and leave, and the
    // no-reversing rule is suspended so nobody can get wedged in a corner.
    if (inHouse && g.mode !== "eyes") {
      tc = 13;
      tr = 10;
    }
    for (let d = 0 as Dir; d < 4; d = (d + 1) as Dir) {
      if (!inHouse && d === ((g.dir + 2) % 4)) continue;
      const nc = ((g.col + DX[d]) % COLS + COLS) % COLS;
      const nr = g.row + DY[d];
      if (isWall(nc, nr, !(g.mode === "eyes" || inHouse))) continue;
      const dist = (nc - tc) ** 2 + (nr - tr) ** 2;
      const jitter = g.mode === "fright" ? Math.random() * 400 : 0;
      if (dist + jitter < bestD) {
        bestD = dist + jitter;
        best = d;
      }
    }
    return best;
  }

  function advance(a: Actor, doorIsWall: boolean, choose: () => Dir) {
    a.off += a.speed;
    while (a.off >= 1) {
      a.off -= 1;
      a.col = ((a.col + DX[a.dir]) % COLS + COLS) % COLS;
      a.row += DY[a.dir];
      a.dir = choose();
      // Do not walk into a wall if the choice was impossible.
      const nc = ((a.col + DX[a.dir]) % COLS + COLS) % COLS;
      if (isWall(nc, a.row + DY[a.dir], doorIsWall)) {
        for (let d = 0 as Dir; d < 4; d = (d + 1) as Dir) {
          const c2 = ((a.col + DX[d]) % COLS + COLS) % COLS;
          if (!isWall(c2, a.row + DY[d], doorIsWall)) {
            a.dir = d;
            break;
          }
        }
      }
    }
  }

  function pixel(a: Actor) {
    const c = ((a.col + DX[a.dir] * a.off) % COLS + COLS) % COLS;
    const r = a.row + DY[a.dir] * a.off;
    return { x: ox + (c + 0.5) * cell, y: oy + (r + 0.5) * cell };
  }

  return {
    reset(w, h) {
      W = w;
      H = h;
      // The cabinet ran on a vertical monitor. The page title owns the top of
      // the screen, so the maze sits under it and the margins either side
      // carry the readout.
      const reserve = Math.round(H * 0.3);
      cell = Math.max(4, Math.min(Math.floor((H - reserve - 10) / ROWS), Math.floor(W / COLS)));
      ox = Math.round((W - COLS * cell) / 2);
      oy = Math.max(reserve, H - ROWS * cell - 6);
      resetDots();
      resetActors();
      t = 0;
      points = 0;
      lives = 3;
      dying = 0;
      pops = [];
      fruit = 0;
    },

    score: () => points,

    setPlayer(index: number) {
      playerIndex = Math.max(0, Math.min(FAMILY.length - 1, index));
      wanted = null;
      held = null;
      moving = false;
      resetActors();
    },

    input(dir: Dir) {
      taken = true;
      moving = true;
      wanted = dir;
    },

    release() {
      moving = false;
      // Come to rest on a cell rather than half way between two.
      if (pac.off > 0.5) {
        pac.col = ((pac.col + DX[pac.dir]) % COLS + COLS) % COLS;
        pac.row += DY[pac.dir];
      }
      pac.off = 0;
    },

    step() {
      t++;
      if (dying > 0) {
        dying--;
        if (dying === 0) {
          resetActors();
          lives = lives > 1 ? lives - 1 : 3;
        }
        return;
      }

      const open = (d: Dir) =>
        !isWall(((pac.col + DX[d]) % COLS + COLS) % COLS, pac.row + DY[d], true);

      if (!taken) {
        advance(pac, true, pacTarget);
      } else if (moving) {
        // Standing on a cell, a new direction can be taken straight away;
        // mid-corridor it waits for the next corner.
        if (wanted !== null && pac.off < pac.speed && open(wanted)) {
          held = wanted;
          wanted = null;
          pac.dir = held;
        }
        const dir = held ?? pac.dir;
        // Up against a wall he simply stands there until a way is asked for.
        if (open(dir)) {
          pac.dir = dir;
          advance(pac, true, () => {
            if (wanted !== null && open(wanted)) {
              held = wanted;
              wanted = null;
            }
            if (held !== null && open(held)) return held;
            return pac.dir;
          });
        }
      }

      // Eat whatever is under him.
      if (dots[pac.row]?.[pac.col]) {
        dots[pac.row][pac.col] = false;
        points += 10;
      }
      if (pellets[pac.row]?.[pac.col]) {
        pellets[pac.row][pac.col] = false;
        points += 50;
        frightTimer = 420;
        chain = 0;
        for (const g of ghosts) if (g.mode !== "eyes") g.mode = "fright";
      }
      if (remainingDots() === 0) {
        resetDots();
        resetActors();
      }

      if (frightTimer > 0 && --frightTimer === 0) {
        for (const g of ghosts) if (g.mode === "fright") g.mode = "chase";
      }
      if (fruit > 0) fruit--;
      else if (Math.random() > 0.997) fruit = 420;

      for (let i = 0; i < ghosts.length; i++) {
        const g = ghosts[i];
        if (g.mode !== "fright" && g.mode !== "eyes") {
          if (--g.timer <= 0) {
            g.mode = g.mode === "chase" ? "scatter" : "chase";
            g.timer = g.mode === "chase" ? 1200 : 420;
          }
        }
        let tc = pac.col;
        let tr = pac.row;
        if (g.mode === "scatter") {
          tc = g.scatterCol;
          tr = g.scatterRow;
        } else if (g.mode === "eyes") {
          tc = 13;
          tr = 14;
        } else if (g.mode === "chase") {
          // Blinky follows, Pinky cuts ahead, Inky mirrors, Clyde keeps away.
          if (i === 1) {
            tc = pac.col + DX[pac.dir] * 4;
            tr = pac.row + DY[pac.dir] * 4;
          } else if (i === 2) {
            tc = pac.col + DX[pac.dir] * 2 + (pac.col - ghosts[0].col);
            tr = pac.row + DY[pac.dir] * 2 + (pac.row - ghosts[0].row);
          } else if (i === 3) {
            const far = (pac.col - g.col) ** 2 + (pac.row - g.row) ** 2 > 64;
            tc = far ? pac.col : g.scatterCol;
            tr = far ? pac.row : g.scatterRow;
          }
        }
        const speed = g.mode === "fright" ? g.speed * 0.55 : g.mode === "eyes" ? g.speed * 2 : g.speed;
        const saved = g.speed;
        g.speed = speed;
        const inside = g.row >= 13 && g.row <= 15 && g.col >= 10 && g.col <= 17;
        advance(g, !(inside || g.mode === "eyes"), () => ghostChoice(g, tc, tr));
        g.speed = saved;

        if (g.mode === "eyes" && g.col === 13 && Math.abs(g.row - 14) < 1) {
          g.mode = "chase";
          g.timer = 600;
        }

        // Collision with Pac-Man.
        if (g.col === pac.col && g.row === pac.row) {
          if (g.mode === "fright") {
            chain = Math.min(3, chain + 1);
            const value = 200 * 2 ** (chain - 1);
            points += value;
            g.mode = "eyes";
            const p = pixel(g);
            pops.push({ x: p.x, y: p.y, life: 48, text: String(value) });
          } else if (g.mode !== "eyes") {
            dying = 90;
          }
        }
      }

      pops = pops.filter((p) => --p.life > 0);
    },

    draw(f: Frame) {
      const ctx = f.ctx;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, f.W, f.H);
      const s = Math.max(1, Math.round(cell / 8));

      // Maze: outline every edge where a wall meets something that is not wall.
      ctx.fillStyle = BLUE;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (MAZE[r][c] === "-") {
            ctx.fillStyle = "#ffb8ff";
            ctx.fillRect(ox + c * cell, oy + r * cell + Math.floor(cell / 2), cell, s);
            ctx.fillStyle = BLUE;
            continue;
          }
          if (MAZE[r][c] !== "#") continue;
          const x = ox + c * cell;
          const y = oy + r * cell;
          if (!isWall(c, r - 1, false)) ctx.fillRect(x, y, cell, s);
          if (!isWall(c, r + 1, false)) ctx.fillRect(x, y + cell - s, cell, s);
          if (!isWall(c - 1, r, false) && c > 0) ctx.fillRect(x, y, s, cell);
          if (!isWall(c + 1, r, false) && c < COLS - 1) ctx.fillRect(x + cell - s, y, s, cell);
        }
      }

      // Dots and power pellets.
      ctx.fillStyle = DOT;
      const d = Math.max(1, Math.round(cell / 5));
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (dots[r][c]) {
            ctx.fillRect(ox + c * cell + (cell - d) / 2, oy + r * cell + (cell - d) / 2, d, d);
          } else if (pellets[r][c] && Math.floor(t / 10) % 2 === 0) {
            const p = Math.max(3, Math.round(cell * 0.6));
            ctx.fillRect(ox + c * cell + (cell - p) / 2, oy + r * cell + (cell - p) / 2, p, p);
          }
        }
      }

      // Fruit under the ghost house.
      if (fruit > 0) {
        const fx = ox + 13.5 * cell;
        const fy = oy + 17.5 * cell;
        ctx.fillStyle = "#e83030";
        ctx.fillRect(fx - cell * 0.5, fy, cell * 0.5, cell * 0.5);
        ctx.fillRect(fx, fy + cell * 0.15, cell * 0.5, cell * 0.5);
        ctx.fillStyle = "#38a038";
        ctx.fillRect(fx - cell * 0.1, fy - cell * 0.4, cell * 0.2, cell * 0.4);
      }

      // Pac-Man: a disc with a wedge cut out, facing the way he is going.
      if (dying === 0 || Math.floor(dying / 4) % 2 === 0) {
        const p = pixel(pac);
        const r = cell * 0.8;
        const chomp = !taken || moving;
        const open = dying > 0 ? 1 : chomp ? Math.abs(Math.sin(t / 5)) * 0.85 : 0.32;
        const face = (pac.dir * Math.PI) / 2;
        ctx.fillStyle = YELLOW;
        for (let dy = -r; dy <= r; dy++) {
          const hw = Math.sqrt(Math.max(0, r * r - dy * dy));
          for (let dx = -hw; dx <= hw; dx++) {
            let a = Math.atan2(dy, dx) - face;
            while (a > Math.PI) a -= Math.PI * 2;
            while (a < -Math.PI) a += Math.PI * 2;
            if (Math.abs(a) < open * 0.7) continue;
            ctx.fillRect(Math.round(p.x + dx), Math.round(p.y + dy), 1, 1);
          }
        }
        topper(ctx, p.x - r, p.y - r, r * 2, FAMILY[playerIndex], pac.dir);
      }

      // Ghosts.
      for (const g of ghosts) {
        const p = pixel(g);
        const r = cell * 0.8;
        const flash = g.mode === "fright" && frightTimer < 120 && Math.floor(t / 8) % 2 === 0;
        const body = g.mode === "eyes" ? null : g.mode === "fright" ? (flash ? WHITE : FRIGHT) : g.colour;
        const left = Math.round(p.x - r);
        const top = Math.round(p.y - r);
        const size = Math.round(r * 2);
        if (body) {
          ctx.fillStyle = body;
          // Dome.
          for (let dy = 0; dy < size * 0.55; dy++) {
            const hw = Math.round(Math.sqrt(Math.max(0, (size / 2) ** 2 - (size / 2 - dy) ** 2)));
            ctx.fillRect(left + size / 2 - hw, top + dy, hw * 2, 1);
          }
          ctx.fillRect(left, top + size * 0.5, size, size * 0.35);
          // Skirt.
          const legs = 4;
          const lw = size / legs;
          for (let i = 0; i < legs; i++) {
            const up = (i + Math.floor(t / 8)) % 2 === 0;
            ctx.fillRect(left + i * lw, top + size * 0.85, lw, up ? size * 0.15 : size * 0.07);
          }
        }
        if (body) topper(ctx, left, top, size, g.member, g.dir);
        // Eyes.
        const ex = DX[g.dir] * r * 0.2;
        const ey = DY[g.dir] * r * 0.2;
        const er = Math.max(2, Math.round(r * 0.45));
        if (g.mode === "fright" && !flash) {
          ctx.fillStyle = WHITE;
          ctx.fillRect(left + size * 0.25, top + size * 0.35, er * 0.6, er * 0.6);
          ctx.fillRect(left + size * 0.6, top + size * 0.35, er * 0.6, er * 0.6);
          ctx.fillRect(left + size * 0.2, top + size * 0.62, size * 0.6, Math.max(1, er * 0.3));
        } else {
          ctx.fillStyle = WHITE;
          ctx.fillRect(Math.round(p.x - r * 0.55 + ex), Math.round(p.y - r * 0.35 + ey), er, er * 1.2);
          ctx.fillRect(Math.round(p.x + r * 0.08 + ex), Math.round(p.y - r * 0.35 + ey), er, er * 1.2);
          ctx.fillStyle = "#2121de";
          ctx.fillRect(Math.round(p.x - r * 0.45 + ex * 2), Math.round(p.y - r * 0.2 + ey * 2), er * 0.6, er * 0.6);
          ctx.fillRect(Math.round(p.x + r * 0.18 + ex * 2), Math.round(p.y - r * 0.2 + ey * 2), er * 0.6, er * 0.6);
        }
      }

      for (const p of pops) {
        drawText(ctx, p.text, Math.round(p.x), Math.round(p.y) - 3, "#00ffff", { align: "center" });
      }

      // Readout: in the left margin when the screen is wide, above the maze
      // when it is not.
      const margin = ox - 4;
      if (margin >= 58) {
        const lx = 6;
        let ly = Math.round(oy + cell * 2);
        if (Math.floor(t / 16) % 2 === 0) drawText(ctx, "1UP", lx, ly, WHITE);
        drawText(ctx, String(points).padStart(5, "0"), lx, ly + 9, WHITE);
        ly += 26;
        drawText(ctx, "HIGH", lx, ly, WHITE);
        drawText(ctx, "SCORE", lx, ly + 9, WHITE);
        drawText(ctx, "1988500", lx, ly + 18, WHITE);
        ly += 36;
        drawText(ctx, "LIVES", lx, ly, WHITE);
        for (let i = 0; i < lives; i++) {
          const px = lx + i * (cell + 3);
          const py = ly + 10;
          ctx.fillStyle = YELLOW;
          ctx.fillRect(px + 1, py, cell - 2, cell);
          ctx.fillRect(px, py + 1, cell, cell - 2);
          ctx.fillStyle = "#000000";
          ctx.fillRect(px + cell * 0.5, py + cell * 0.15, cell * 0.5, cell * 0.3);
          ctx.fillRect(px + cell * 0.5, py + cell * 0.55, cell * 0.5, cell * 0.3);
        }
      } else {
        const top = Math.max(2, oy - 14);
        if (Math.floor(t / 16) % 2 === 0) drawText(ctx, "1UP", ox + 4, top, WHITE);
        drawText(ctx, String(points).padStart(5, "0"), ox + 4, top + 8, WHITE);
        drawText(ctx, "1988500", ox + COLS * cell - 4, top + 8, WHITE, { align: "right" });
        for (let i = 0; i < lives; i++) {
          const px = ox + 4 + i * (cell + 3);
          const py = oy + ROWS * cell + 2;
          ctx.fillStyle = YELLOW;
          ctx.fillRect(px + 1, py, cell - 2, cell);
          ctx.fillRect(px, py + 1, cell, cell - 2);
        }
      }
    },
  };
}

export const pacman: Theme = {
  id: "pacman",
  intro: ["READY!"],
  targetH: 300,
  scroll: 0,
  style: "brawl",
  impact: "points",
  ink: YELLOW,
  shadow: "#000000",
  custom: createPacman,
  hud() {},
  heroes: [],
  dog: { fur: YELLOW, fur2: "#d8b400", nose: "#000000", collar: "#e83030" },
  foes: [],
  sky() {},
  far() {},
  mid() {},
  ground() {},
  fore() {},
};
