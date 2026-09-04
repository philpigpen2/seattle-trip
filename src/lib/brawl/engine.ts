// The arcade engine. Theme-agnostic: it owns the party, the brawl simulation,
// the projectiles and the effects; each game supplies its world, cast and HUD.

import type { Frame } from "./bg";
import { drawText, textWidth } from "./font";
import { drawCritter, drawDog, drawFighter, type Fighter, type Pose } from "./sprites";
import { HERO_LABELS, HERO_SCALE, type FoeSpec, type Theme } from "./themes/types";

type HeroState = "walk" | "punch" | "kick" | "slash" | "hop" | "hurt" | "cheer";
type FoeState = "walk" | "hurt" | "fly" | "ko" | "flat";

type Hero = {
  label: string;
  f: Fighter;
  baseX: number;
  lane: number;
  state: HeroState;
  timer: number;
  cool: number;
  phase: number;
  ink: string;
  k: number;
  health: number;
  plateDX: number;
};

type Foe = {
  spec: FoeSpec;
  f: Fighter;
  x: number;
  y: number;
  lane: number;
  hp: number;
  speed: number;
  state: FoeState;
  timer: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  flash: number;
  k: number;
};

type Shot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  angle: number;
  kind: "lance" | "bullet";
  life: number;
};

type Fx = {
  kind: "star" | "dust" | "points" | "bone" | "boom" | "coin" | "smoke" | "gleam";
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  text?: string;
  color: string;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const choice = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export type BrawlHandle = { destroy: () => void };

export function mountBrawl(
  canvas: HTMLCanvasElement,
  themes: Theme[],
  opts: { rotateFrames?: number; compact?: boolean; warmup?: number } = {},
): BrawlHandle {
  const ctx2d = canvas.getContext("2d", { alpha: false });
  if (!ctx2d) return { destroy: () => {} };
  const ctx: CanvasRenderingContext2D = ctx2d;
  ctx.imageSmoothingEnabled = false;

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const rotateFrames = opts.rotateFrames ?? 0;
  const warmFrames = opts.warmup ?? 190;

  // Offscreen buffer used to blit tumbling enemies at an angle.
  const spin = document.createElement("canvas");
  spin.width = 64;
  spin.height = 68;
  const sctx = spin.getContext("2d")!;
  sctx.imageSmoothingEnabled = false;

  let W = 1;
  let H = 1;
  let scale = 3;
  let raf = 0;
  let running = true;

  let themeIdx = 0;
  let theme = themes[0];
  let wipe = 0;
  const WIPE_LEN = 76;

  let cam = 0;
  let t = 0;
  let score = 0;
  const hi = 1988500;
  let shake = 0;
  let spawnIn = 24;
  let clock = 400;
  let magic = 5;
  let specialIn = 0;
  let specialPhase = 0;

  let heroes: Hero[] = [];
  let foes: Foe[] = [];
  let shots: Shot[] = [];
  let fx: Fx[] = [];

  let dogState: "trot" | "leap" | "bark" = "trot";
  let dogTimer = 0;
  let dogLunge = 0;

  const frame = (): Frame => {
    const groundBottom = H - Math.max(5, Math.round(H * 0.07));
    const strip = Math.max(26, Math.min(50, Math.round(H * 0.24)));
    const groundTop = groundBottom - strip;
    return { ctx, W, H, cam, t, horizon: groundTop - 3, groundTop, groundBottom };
  };

  function buildParty() {
    const spread = Math.min(1, W / 300);
    const xs = [0.28, 0.4, 0.19, 0.32];
    const lanes = [0.42, 0.72, 0.14, 0.96];
    heroes = HERO_LABELS.map((label, i) => ({
      label,
      f: theme.heroes[i],
      baseX: Math.round(W * (0.13 + (xs[i] - 0.19) * spread) + 26),
      lane: lanes[i],
      state: "walk" as HeroState,
      timer: 0,
      cool: 20 + i * 9,
      phase: i * 7,
      ink: theme.heroes[i].band ?? theme.heroes[i].pal.shirt,
      k: HERO_SCALE[i],
      health: 1,
      plateDX: [-15, 15, -19, 19][i],
    }));
    foes = [];
    shots = [];
    fx = [];
    spawnIn = 24;
    clock = 400;
    magic = 5;
    specialIn = theme.special ? Math.round(theme.special.everyFrames * 0.45) : 0;
    specialPhase = 0;
    for (let i = 0; i < warmFrames; i++) step(frame());
  }

  const laneY = (f: Frame, lane: number) =>
    Math.round(f.groundTop + 11 + lane * (f.groundBottom - f.groundTop - 11));

  function resize() {
    const cw = canvas.clientWidth || 640;
    const ch = canvas.clientHeight || 360;
    scale = Math.max(2, Math.min(7, Math.round(cw / 340)));
    const nw = Math.max(140, Math.ceil(cw / scale));
    const nh = Math.max(110, Math.ceil(ch / scale));
    if (nw === W && nh === H) return;
    W = nw;
    H = nh;
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;
    buildParty();
  }

  /* ------------------------------------------------------------- effects - */

  const koFrames = () => (theme.impact === "puff" ? 46 : theme.impact === "points" ? 26 : 112);

  function stars(x: number, y: number, n: number, color: string, spd = 2) {
    for (let i = 0; i < n; i++) {
      const a = rand(-Math.PI, 0);
      fx.push({
        kind: "star",
        x,
        y,
        vx: Math.cos(a) * rand(0.6, spd),
        vy: Math.sin(a) * rand(0.5, spd * 0.8),
        life: 0,
        max: 22,
        color: i % 2 ? "#ffffff" : color,
      });
    }
  }

  function impactAt(foe: Foe, killed: boolean) {
    const x = foe.x;
    const y = foe.y - 18;
    switch (theme.impact) {
      case "points": {
        if (killed) {
          fx.push({ kind: "points", x, y, vx: 0, vy: -0.5, life: 0, max: 34, text: choice(["100", "200", "400", "800"]), color: "#ffffff" });
          fx.push({ kind: "coin", x: x + 6, y: y - 2, vx: 0.4, vy: -1.9, life: 0, max: 30, color: "#fbb040" });
        }
        break;
      }
      case "gleam": {
        fx.push({ kind: "gleam", x, y, vx: 0, vy: 0, life: 0, max: 9, color: "#fff0b0" });
        stars(x, y, 6, "#f6c85a", 2.4);
        break;
      }
      case "puff": {
        stars(x, y, 5, "#ffffff", 1.8);
        if (killed) {
          for (let i = 0; i < 6; i++) {
            fx.push({ kind: "smoke", x: x + rand(-5, 5), y: y + rand(-6, 6), vx: rand(-0.5, 0.5), vy: rand(-0.7, -0.1), life: 0, max: 26, color: i % 2 ? "#e8e4f4" : "#b9b2e0" });
          }
        }
        break;
      }
      case "boom": {
        if (killed) fx.push({ kind: "boom", x, y, vx: 0, vy: 0, life: 0, max: 18, color: "#ffb03a" });
        stars(x, y, 4, "#fff3b0", 2.2);
        break;
      }
      default: {
        stars(x, y, 7, "#fff3b0", 2.4);
        fx.push({ kind: "gleam", x, y, vx: 0, vy: 0, life: 0, max: 6, color: "#ffffff" });
      }
    }
    shake = Math.min(4.5, shake + (killed ? 2.4 : 1.4));
  }

  function dust(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      fx.push({ kind: "dust", x: x + rand(-4, 4), y, vx: rand(-0.7, 0.7), vy: rand(-0.5, -0.1), life: 0, max: 18, color: "#cfc7dd" });
    }
  }

  /* ----------------------------------------------------------- simulation - */

  function spawnFoe(f: Frame) {
    const pool = theme.foes;
    const total = pool.reduce((s, p) => s + (p.weight ?? 1), 0);
    let r = Math.random() * total;
    let spec = pool[0];
    for (const p of pool) {
      r -= p.weight ?? 1;
      if (r <= 0) {
        spec = p;
        break;
      }
    }
    const lane = rand(0.08, 0.98);
    foes.push({
      spec,
      f: spec.fighter,
      x: W + rand(14, 46),
      y: laneY(f, lane),
      lane,
      hp: spec.hp,
      speed: spec.speed,
      state: "walk",
      timer: 0,
      vx: 0,
      vy: 0,
      angle: 0,
      spin: 0,
      flash: 0,
      k: spec.scale ?? 1,
    });
  }

  function hitFoe(foe: Foe, power: number, stomped = false) {
    foe.hp -= 1;
    foe.flash = 4;
    const killed = foe.hp <= 0;
    impactAt(foe, killed);
    if (!killed) {
      foe.state = "hurt";
      foe.timer = 22;
      foe.x += 7;
      return;
    }
    score += 500;
    if (stomped) {
      foe.state = "flat";
      foe.timer = 0;
      return;
    }
    foe.state = "fly";
    foe.vx = 2.1 + power;
    foe.vy = -2.9 - power * 0.4;
    foe.spin = rand(0.1, 0.2) * (Math.random() > 0.5 ? 1 : -1);
  }

  function fire(h: Hero, f: Frame) {
    const y = laneY(f, h.lane) - Math.round(18 * h.k);
    const x = h.baseX + 20;
    if (theme.style === "throw") {
      shots.push({ x, y, vx: 3, vy: 0, spin: 0, angle: 0, kind: "lance", life: 0 });
      return;
    }
    // Spread gun: five shots in a tight fan.
    for (let i = -2; i <= 2; i++) {
      const a = i * 0.1;
      shots.push({
        x,
        y,
        vx: Math.cos(a) * 4.3,
        vy: Math.sin(a) * 4.3,
        spin: 0,
        angle: 0,
        kind: "bullet",
        life: 0,
      });
    }
  }

  function step(f: Frame) {
    t++;
    cam += theme.scroll;
    if (shake > 0) shake = Math.max(0, shake - 0.35);
    if (t % 24 === 0 && clock > 0) clock--;

    if (theme.special) {
      if (specialPhase > 0) {
        specialPhase--;
        const p = 1 - specialPhase / theme.special.duration;
        if (p > 0.34 && p < 0.4) {
          for (const foe of foes) {
            if (foe.state === "walk" || foe.state === "hurt") {
              foe.hp = 0;
              hitFoe(foe, 1.4);
            }
          }
        }
        if (specialPhase === 0) specialIn = theme.special.everyFrames;
      } else if (--specialIn <= 0 && foes.some((x) => x.state === "walk")) {
        specialPhase = theme.special.duration;
        magic = Math.max(0, magic - 2);
        heroes[0].state = "cheer";
        heroes[0].timer = 0;
      }
    }

    for (const h of heroes) {
      h.health = Math.min(1, h.health + 0.0009);
      if (h.state === "walk") {
        if (h.cool > 0) h.cool--;
        const hy = laneY(f, h.lane);
        if (h.cool === 0) {
          const ranged = theme.style === "shoot" || theme.style === "throw";
          const reach = ranged ? 170 : theme.style === "blade" ? 40 : 32;
          const target = foes.find(
            (foe) =>
              foe.state === "walk" &&
              Math.abs(foe.y - hy) < (ranged ? 13 : 9) &&
              foe.x - h.baseX > 10 &&
              foe.x - h.baseX < reach,
          );
          if (target) {
            h.state =
              theme.style === "blade"
                ? "slash"
                : theme.style === "stomp"
                  ? "hop"
                  : ranged
                    ? "punch"
                    : Math.random() > 0.62
                      ? "kick"
                      : "punch";
            h.timer = 0;
          }
        }
      } else if (h.state === "cheer" || h.state === "hurt") {
        h.timer++;
        if (h.timer > (h.state === "hurt" ? 24 : 46)) h.state = "walk";
      } else {
        h.timer++;
        const ranged = theme.style === "shoot" || theme.style === "throw";
        const impactFrame = h.state === "slash" ? 13 : h.state === "hop" ? 17 : h.state === "kick" ? 8 : 6;
        const len = h.state === "slash" ? 26 : h.state === "hop" ? 30 : h.state === "kick" ? 22 : 18;
        if (h.timer === impactFrame) {
          if (ranged) {
            fire(h, f);
          } else {
            const hy = laneY(f, h.lane);
            const reach = h.state === "slash" ? 44 : h.state === "hop" ? 30 : h.state === "kick" ? 34 : 30;
            for (const foe of foes) {
              if (foe.state !== "walk" && foe.state !== "hurt") continue;
              if (Math.abs(foe.y - hy) > 12) continue;
              if (foe.x - h.baseX > 2 && foe.x - h.baseX < reach) {
                hitFoe(foe, h.state === "kick" ? 0.9 : h.state === "slash" ? 1.2 : 0.4, h.state === "hop");
                break;
              }
            }
          }
        }
        if (h.timer > len) {
          h.state = "walk";
          h.cool = Math.round(rand(12, 36));
        }
      }
    }

    // Delaney
    dogTimer++;
    const dogHomeX = heroes[1].baseX + 30;
    if (dogState === "trot") {
      const dy = laneY(f, 0.62);
      const near = foes.find(
        (foe) => foe.state === "walk" && Math.abs(foe.y - dy) < 14 && foe.x - dogHomeX > 6 && foe.x - dogHomeX < 34,
      );
      if (near && Math.random() > 0.965) {
        dogState = "leap";
        dogTimer = 0;
        dogLunge = 0;
      } else if (Math.random() > 0.996) {
        dogState = "bark";
        dogTimer = 0;
      }
    } else if (dogState === "leap") {
      dogLunge = Math.min(26, dogLunge + 2.4);
      if (dogTimer === 8) {
        const dy = laneY(f, 0.62);
        const dx = dogHomeX + dogLunge;
        const foe = foes.find(
          (fo) => (fo.state === "walk" || fo.state === "hurt") && Math.abs(fo.y - dy) < 16 && Math.abs(fo.x - dx) < 24,
        );
        if (foe) hitFoe(foe, 0.7, theme.style === "stomp");
      }
      if (dogTimer > 22) dogState = "trot";
    } else if (dogTimer > 26) {
      dogState = "trot";
    }
    if (dogState !== "leap" && dogLunge > 0) dogLunge = Math.max(0, dogLunge - 1.2);

    // Enemies
    for (const foe of foes) {
      if (foe.flash > 0) foe.flash--;
      if (foe.state === "walk") {
        foe.x -= foe.speed + theme.scroll;
        foe.y = laneY(f, foe.lane);
        // Reaching the party costs somebody a slice of health.
        const victim = heroes.find(
          (h) => h.state !== "hurt" && Math.abs(laneY(f, h.lane) - foe.y) < 10 && foe.x - h.baseX < 12 && foe.x - h.baseX > -6,
        );
        if (victim) {
          victim.state = "hurt";
          victim.timer = 0;
          victim.health = Math.max(0.18, victim.health - 0.1);
          foe.state = "hurt";
          foe.timer = 26;
          foe.x += 10;
          stars(foe.x - 8, foe.y - 18, 3, "#ff6b6b", 1.6);
          shake = Math.min(4, shake + 1.6);
        }
      } else if (foe.state === "hurt") {
        foe.x -= theme.scroll;
        if (--foe.timer <= 0) foe.state = "walk";
      } else if (foe.state === "fly") {
        foe.x += foe.vx - theme.scroll;
        foe.y += foe.vy;
        foe.vy += 0.17;
        foe.angle += foe.spin;
        const ground = laneY(f, foe.lane);
        if (foe.vy > 0 && foe.y >= ground) {
          foe.y = ground;
          foe.state = "ko";
          foe.timer = 0;
          foe.angle = 0;
          dust(foe.x, ground);
          shake = Math.min(5, shake + 2);
        }
      } else {
        foe.timer++;
        foe.x += foe.vx * 0.35 - theme.scroll;
        foe.vx *= 0.88;
        if (theme.impact === "puff" && foe.state === "ko" && foe.timer === 30) {
          for (let i = 0; i < 7; i++) {
            fx.push({ kind: "smoke", x: foe.x + rand(-6, 6), y: foe.y - rand(2, 14), vx: rand(-0.5, 0.5), vy: rand(-0.8, -0.2), life: 0, max: 24, color: i % 2 ? "#e8e4f4" : "#b9b2e0" });
          }
        }
      }
    }
    const koLen = koFrames();
    foes = foes.filter((foe) =>
      foe.state === "ko" || foe.state === "flat" ? foe.timer < koLen : foe.x > -60 && foe.y < H + 80,
    );

    if (--spawnIn <= 0) {
      spawnFoe(f);
      if (Math.random() > 0.7) spawnFoe(f);
      spawnIn = Math.round(rand(58, 128));
    }

    // Projectiles
    for (const s of shots) {
      s.life++;
      s.x += s.vx - theme.scroll;
      s.y += s.vy;
      for (const foe of foes) {
        if (foe.state !== "walk" && foe.state !== "hurt") continue;
        if (Math.abs(s.x - foe.x) < 9 && Math.abs(s.y - (foe.y - 16 * foe.k)) < 13) {
          hitFoe(foe, 0.8);
          s.life = 999;
          break;
        }
      }
    }
    shots = shots.filter((s) => s.life < (s.kind === "bullet" ? 62 : 120) && s.x < W + 20);

    for (const p of fx) {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      if (p.kind === "star") p.vy += 0.13;
      if (p.kind === "coin") p.vy += 0.14;
      if (p.kind === "smoke") p.vy -= 0.02;
    }
    fx = fx.filter((p) => p.life < p.max);

    score += 1;
  }

  /* -------------------------------------------------------------- drawing - */

  function heroPose(h: Hero): { pose: Pose; frame: number } {
    if (h.state === "walk") return { pose: "walk", frame: Math.floor((t + h.phase) / 7) & 3 };
    if (h.state === "cheer") return { pose: "cheer", frame: 0 };
    if (h.state === "hurt") return { pose: "hurt", frame: 0 };
    if (h.state === "hop") return { pose: "cheer", frame: 0 };
    if (h.state === "slash") return { pose: "slash", frame: h.timer < 8 ? 0 : h.timer < 14 ? 1 : 2 };
    return { pose: h.state === "kick" ? "kick" : "punch", frame: 0 };
  }

  function plate(text: string, cx: number, y: number, ink: string) {
    const w = textWidth(text, 1);
    ctx.fillStyle = "#140d20";
    ctx.fillRect(Math.round(cx - w / 2) - 2, y - 2, w + 4, 10);
    ctx.fillStyle = "#2a2140";
    ctx.fillRect(Math.round(cx - w / 2) - 2, y - 2, w + 4, 1);
    drawText(ctx, text, cx, y, ink, { align: "center" });
  }

  function drawCast(f: Frame) {
    const actors: { y: number; draw: () => void }[] = [];

    for (const h of heroes) {
      const y = laneY(f, h.lane);
      const hop = h.state === "hop" ? -Math.sin((h.timer / 30) * Math.PI) * 20 : 0;
      const lunge = h.state === "hop" ? (h.timer / 30) * 12 : h.state === "hurt" ? -3 : 0;
      const bobX = h.state === "walk" ? Math.sin((t + h.phase * 9) / 26) * 1.4 : 0;
      const x = h.baseX + bobX + lunge;
      const { pose, frame: fr } = heroPose(h);
      actors.push({
        y,
        draw: () => {
          drawFighter(ctx, x, y + hop, h.f, pose, fr, false, undefined, h.k);
          if (theme.style === "shoot" && h.state === "punch" && h.timer >= 4 && h.timer <= 8) {
            const mx = Math.round(x) + Math.round(22 * h.k);
            const my = y - Math.round(18 * h.k);
            ctx.fillStyle = "#fff3b0";
            ctx.fillRect(mx, my - 1, 4, 3);
            ctx.fillStyle = "#ffb03a";
            ctx.fillRect(mx + 3, my, 3, 1);
            ctx.fillRect(mx + 1, my - 2, 1, 1);
            ctx.fillRect(mx + 1, my + 2, 1, 1);
          }
          if (h.state === "slash" && h.timer >= 12 && h.timer <= 18) {
            ctx.fillStyle = "#ffffff";
            for (let i = 0; i < 9; i++) {
              const a = -0.9 + i * 0.16;
              ctx.fillRect(
                Math.round(x + 8 * h.k + Math.cos(a) * 22 * h.k),
                Math.round(y - 18 * h.k + Math.sin(a) * 20 * h.k),
                2,
                2,
              );
            }
          }
          plate(h.label, Math.round(x) + h.plateDX, y - Math.round(40 * h.k) - Math.round((1 - h.lane) * 9), h.ink);
        },
      });
    }

    const dy = laneY(f, 0.62);
    const dx = heroes[1].baseX + 30 + dogLunge;
    actors.push({
      y: dy,
      draw: () =>
        drawDog(
          ctx,
          dx,
          dogState === "leap" ? dy - 7 : dy,
          theme.dog,
          dogState === "leap" ? "leap" : dogState === "bark" ? "bark" : "trot",
          Math.floor(t / 6) & 3,
          false,
        ),
    });

    for (const foe of foes) {
      actors.push({
        y: foe.y,
        draw: () => {
          const down = foe.state === "flat" || foe.state === "ko";
          const tint = foe.flash > 0 && !down ? "#ffffff" : undefined;
          const kind = foe.spec.sprite;
          if (foe.state === "fly") {
            sctx.clearRect(0, 0, spin.width, spin.height);
            if (kind) drawCritter(sctx, 32, 52, kind, foe.f.pal, "hurt", 0, true, tint, foe.k);
            else drawFighter(sctx, 32, 52, foe.f, "hurt", 0, true, tint, foe.k);
            ctx.save();
            ctx.translate(Math.round(foe.x), Math.round(foe.y - 16));
            ctx.rotate(foe.angle);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(spin, -32, -36);
            ctx.restore();
            return;
          }
          const blink = foe.state === "ko" && foe.timer > koFrames() - 34 && Math.floor(foe.timer / 4) % 2 === 0;
          if (blink) return;
          if (kind) {
            const p = foe.state === "flat" || foe.state === "ko" ? "flat" : foe.state === "hurt" ? "hurt" : "walk";
            drawCritter(ctx, foe.x, foe.y, kind, foe.f.pal, p, Math.floor(t / 8) & 3, true, tint, foe.k);
          } else {
            const p: Pose = foe.state === "ko" || foe.state === "flat" ? "ko" : foe.state === "hurt" ? "hurt" : "walk";
            drawFighter(ctx, foe.x, foe.y, foe.f, p, Math.floor(t / 8) & 3, true, tint, foe.k);
          }
        },
      });
    }

    actors.sort((a, b) => a.y - b.y);
    for (const a of actors) a.draw();
  }

  function drawShots() {
    for (const s of shots) {
      if (s.life > 900) continue;
      if (s.kind === "lance") {
        ctx.fillStyle = "#d8dce8";
        ctx.fillRect(Math.round(s.x), Math.round(s.y), 9, 2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(Math.round(s.x) + 9, Math.round(s.y), 3, 1);
        ctx.fillStyle = "#8a5a32";
        ctx.fillRect(Math.round(s.x) - 3, Math.round(s.y), 3, 2);
      } else {
        ctx.fillStyle = "#fff3b0";
        ctx.fillRect(Math.round(s.x), Math.round(s.y), 3, 3);
        ctx.fillStyle = "#ffb03a";
        ctx.fillRect(Math.round(s.x) - 2, Math.round(s.y) + 1, 2, 1);
      }
    }
  }

  function drawFx() {
    for (const p of fx) {
      const px = Math.round(p.x);
      const py = Math.round(p.y);
      switch (p.kind) {
        case "star":
          ctx.fillStyle = p.color;
          ctx.fillRect(px, py, 2, 2);
          break;
        case "dust":
          ctx.fillStyle = p.color;
          ctx.fillRect(px, py, p.life < 8 ? 2 : 1, p.life < 8 ? 2 : 1);
          break;
        case "smoke": {
          const s = 2 + Math.round((p.life / p.max) * 4);
          ctx.fillStyle = p.color;
          ctx.fillRect(px - s / 2, py - s / 2, s, s);
          break;
        }
        case "boom": {
          const r = 3 + Math.round((p.life / p.max) * 13);
          ctx.fillStyle = p.life < p.max * 0.45 ? "#fff3b0" : "#ffb03a";
          ctx.fillRect(px - r, py - Math.round(r * 0.6), r * 2, Math.round(r * 1.2));
          ctx.fillStyle = p.life < p.max * 0.45 ? "#ffb03a" : "#e0521c";
          ctx.fillRect(px - r + 2, py - Math.round(r * 0.6) + 2, r * 2 - 4, Math.round(r * 1.2) - 4);
          break;
        }
        case "gleam": {
          const r = 6 + p.life * 3;
          ctx.fillStyle = p.color;
          ctx.fillRect(px - r, py, r * 2, 1);
          ctx.fillRect(px, py - r, 1, r * 2);
          break;
        }
        case "coin":
          ctx.fillStyle = p.color;
          ctx.fillRect(px, py, [4, 3, 1, 3][Math.floor(p.life / 4) % 4], 6);
          break;
        case "points":
          if (p.text) drawText(ctx, p.text, px, py, p.color, { align: "center" });
          break;
        default:
          ctx.fillStyle = p.color;
          ctx.fillRect(px, py, 2, 2);
      }
    }
  }

  function drawScanlines(f: Frame) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#000000";
    for (let y = 0; y < f.H; y += 3) ctx.fillRect(0, y, f.W, 1);
    const edge = Math.max(3, Math.round(f.W * 0.04));
    for (let i = 0; i < edge; i++) {
      ctx.globalAlpha = 0.22 * (1 - i / edge);
      ctx.fillRect(i, 0, 1, f.H);
      ctx.fillRect(f.W - 1 - i, 0, 1, f.H);
    }
    ctx.restore();
  }

  function drawWipe(f: Frame) {
    const half = WIPE_LEN / 2;
    const p = wipe <= half ? wipe / half : (WIPE_LEN - wipe) / half;
    const h = Math.round((f.H / 2) * p);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, f.W, h);
    ctx.fillRect(0, f.H - h, f.W, h);
    if (p > 0.72) {
      const cy = Math.round(f.H * 0.72);
      const lines = theme.intro;
      const top = cy - Math.round((lines.length * 12) / 2) - 4;
      lines.forEach((line, i) => {
        drawText(ctx, line, Math.round(f.W / 2), top + i * 12, i === 0 ? theme.ink : "#b9b2e0", {
          align: "center",
        });
      });
      theme.introRender?.(f, Math.round(f.W / 2), top + lines.length * 12 + 8);
    }
  }

  function render() {
    const f = frame();
    ctx.save();
    if (shake > 0.4) {
      ctx.translate(Math.round(rand(-shake, shake)), Math.round(rand(-shake * 0.6, shake * 0.6)));
    }
    theme.sky(f);
    theme.far(f);
    theme.mid(f);
    theme.ground(f);
    drawCast(f);
    drawShots();
    theme.fore(f);
    drawFx();
    if (theme.special && specialPhase > 0) {
      theme.special.render(f, 1 - specialPhase / theme.special.duration);
    }
    ctx.restore();
    theme.hud(f, {
      score,
      hi,
      t,
      lives: 3,
      magic,
      timer: clock,
      health: heroes.map((h) => h.health),
      labels: HERO_LABELS,
      inks: heroes.map((h) => h.ink),
    });
    drawScanlines(f);
    if (wipe > 0) drawWipe(f);
  }

  function loop() {
    if (!running) return;
    resize();
    if (rotateFrames > 0 && themes.length > 1) {
      if (wipe > 0) {
        wipe++;
        if (wipe === Math.round(WIPE_LEN / 2)) {
          themeIdx = (themeIdx + 1) % themes.length;
          theme = themes[themeIdx];
          buildParty();
          cam = 0;
        }
        if (wipe > WIPE_LEN) wipe = 0;
      } else if (t > rotateFrames) {
        wipe = 1;
        t = 0;
      }
    }
    step(frame());
    render();
    raf = requestAnimationFrame(loop);
  }

  resize();
  if (reduced) render();
  else raf = requestAnimationFrame(loop);

  const onVis = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else if (running && !reduced) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    }
  };
  document.addEventListener("visibilitychange", onVis);

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);

  return {
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
    },
  };
}
