// The arcade engine. Theme-agnostic: it owns the party, the brawl simulation,
// the effects and the HUD; each theme supplies the world and the cast.

import type { Frame } from "./bg";
import { drawText, textWidth } from "./font";
import { drawDog, drawFighter, type Fighter, type Pose } from "./sprites";
import { HERO_NAMES, type Theme } from "./themes/types";

const DOG_NAME = "DELANEY";

type HeroState = "walk" | "punch" | "kick" | "slash" | "cheer";
type FoeState = "walk" | "hurt" | "fly" | "ko";

type Hero = {
  name: string;
  f: Fighter;
  baseX: number;
  lane: number;
  state: HeroState;
  timer: number;
  cool: number;
  phase: number;
  ink: string;
};

type Foe = {
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
};

type Fx = {
  kind: "word" | "star" | "dust" | "bubble";
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
  const compact = opts.compact ?? false;
  const warmFrames = opts.warmup ?? 190;

  // Offscreen buffer used to blit tumbling enemies at an angle.
  const spin = document.createElement("canvas");
  spin.width = 56;
  spin.height = 60;
  const sctx = spin.getContext("2d")!;
  sctx.imageSmoothingEnabled = false;

  let W = 1;
  let H = 1;
  let scale = 3;
  let raf = 0;
  let running = true;

  let themeIdx = 0;
  let theme = themes[0];
  let wipe = 0; // 0 = no transition, counts 1..WIPE_LEN during a game change
  const WIPE_LEN = 60;
  let incoming = "";

  let cam = 0;
  let t = 0;
  let score = 0;
  const hi = 1988500;
  let shake = 0;
  let spawnIn = 24;

  let heroes: Hero[] = [];
  let foes: Foe[] = [];
  let fx: Fx[] = [];

  let dogState: "trot" | "leap" | "bark" = "trot";
  let dogTimer = 0;
  let dogLunge = 0;

  const frame = (): Frame => {
    const groundBottom = H - Math.max(5, Math.round(H * 0.07));
    const strip = Math.max(26, Math.min(50, Math.round(H * 0.24)));
    const groundTop = groundBottom - strip;
    return {
      ctx,
      W,
      H,
      cam,
      t,
      horizon: groundTop - 3,
      groundTop,
      groundBottom,
    };
  };

  function buildParty() {
    const spread = Math.min(1, W / 300);
    const xs = [0.28, 0.4, 0.19, 0.32];
    const lanes = [0.42, 0.72, 0.14, 0.96];
    heroes = HERO_NAMES.map((name, i) => ({
      name,
      f: theme.heroes[i],
      baseX: Math.round(W * (0.13 + (xs[i] - 0.19) * spread) + 26),
      lane: lanes[i],
      state: "walk" as HeroState,
      timer: 0,
      cool: 20 + i * 9,
      phase: i * 7,
      ink: theme.heroes[i].pal.shirt,
    }));
    foes = [];
    fx = [];
    spawnIn = 24;
    // Play forward a little so the street is never empty on the first paint.
    for (let i = 0; i < warmFrames; i++) step(frame());
  }

  function laneY(f: Frame, lane: number) {
    return Math.round(f.groundTop + 11 + lane * (f.groundBottom - f.groundTop - 11));
  }

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

  function burst(x: number, y: number, word: string, color: string) {
    fx.push({ kind: "word", x, y, vx: 0, vy: -0.28, life: 0, max: 30, text: word, color });
    for (let i = 0; i < 7; i++) {
      const a = rand(-Math.PI, 0);
      fx.push({
        kind: "star",
        x,
        y,
        vx: Math.cos(a) * rand(0.7, 2.1),
        vy: Math.sin(a) * rand(0.6, 1.7),
        life: 0,
        max: 22,
        color: i % 2 ? "#ffffff" : color,
      });
    }
    shake = Math.min(4, shake + 2.4);
  }

  function dust(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      fx.push({
        kind: "dust",
        x: x + rand(-4, 4),
        y,
        vx: rand(-0.7, 0.7),
        vy: rand(-0.5, -0.1),
        life: 0,
        max: 18,
        color: "#cfc7dd",
      });
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
    });
  }

  function hitFoe(foe: Foe, power: number) {
    foe.hp -= 1;
    foe.flash = 4;
    const word = choice(theme.hitWords);
    burst(foe.x - 6, foe.y - 22, word, theme.hudInk);
    if (foe.hp > 0) {
      foe.state = "hurt";
      foe.timer = 22;
      foe.x += 7;
      return;
    }
    foe.state = "fly";
    foe.vx = 2.1 + power;
    foe.vy = -2.9 - power * 0.4;
    foe.spin = rand(0.1, 0.2) * (Math.random() > 0.5 ? 1 : -1);
    score += 500;
  }

  function step(f: Frame) {
    t++;
    cam += theme.scroll;
    if (shake > 0) shake = Math.max(0, shake - 0.35);

    // Heroes: walk, then swing when something walks into range.
    for (const h of heroes) {
      if (h.state === "walk") {
        if (h.cool > 0) h.cool--;
        const hx = h.baseX;
        const hy = laneY(f, h.lane);
        if (h.cool === 0) {
          const reach = theme.style === "blade" ? 40 : theme.style === "shoot" ? 165 : 30;
          const target = foes.find(
            (foe) =>
              foe.state === "walk" &&
              Math.abs(foe.y - hy) < 9 &&
              foe.x - hx > 10 &&
              foe.x - hx < reach,
          );
          if (target) {
            h.state =
              theme.style === "blade"
                ? "slash"
                : theme.style === "shoot"
                  ? "punch"
                  : theme.style === "stomp"
                    ? Math.random() > 0.35
                      ? "kick"
                      : "punch"
                    : Math.random() > 0.62
                      ? "kick"
                      : "punch";
            h.timer = 0;
          }
        }
      } else if (h.state === "cheer") {
        h.timer++;
        if (h.timer > 46) h.state = "walk";
      } else {
        h.timer++;
        const impactAt = h.state === "slash" ? 13 : h.state === "kick" ? 8 : 6;
        const len = h.state === "slash" ? 26 : h.state === "kick" ? 22 : 18;
        if (h.timer === impactAt) {
          const hx = h.baseX;
          const hy = laneY(f, h.lane);
          const reach =
            theme.style === "shoot" ? 175 : h.state === "slash" ? 44 : h.state === "kick" ? 34 : 30;
          for (const foe of foes) {
            if (foe.state !== "walk" && foe.state !== "hurt") continue;
            if (Math.abs(foe.y - hy) > 11) continue;
            if (foe.x - hx > 4 && foe.x - hx < reach) {
              hitFoe(foe, h.state === "kick" ? 0.9 : h.state === "slash" ? 1.2 : 0.4);
              break;
            }
          }
        }
        if (h.timer > len) {
          h.state = "walk";
          h.cool = Math.round(rand(14, 40));
        }
      }
    }

    // Delaney: trots along, sometimes launches herself at a shin.
    dogTimer++;
    if (dogState === "trot") {
      const dx = heroes[1].baseX + 30;
      const dy = laneY(f, 0.62);
      const near = foes.find(
        (foe) => foe.state === "walk" && Math.abs(foe.y - dy) < 14 && foe.x - dx > 6 && foe.x - dx < 34,
      );
      if (near && Math.random() > 0.965) {
        dogState = "leap";
        dogTimer = 0;
        dogLunge = 0;
      } else if (Math.random() > 0.995) {
        dogState = "bark";
        dogTimer = 0;
        fx.push({
          kind: "bubble",
          x: dx + 12,
          y: dy - 20,
          vx: 0,
          vy: -0.2,
          life: 0,
          max: 34,
          text: "WOOF!",
          color: "#ffffff",
        });
      }
    } else if (dogState === "leap") {
      dogLunge = Math.min(26, dogLunge + 2.4);
      if (dogTimer === 8) {
        const dx = heroes[1].baseX + 30 + dogLunge;
        const dy = laneY(f, 0.62);
        const foe = foes.find(
          (fo) => (fo.state === "walk" || fo.state === "hurt") && Math.abs(fo.y - dy) < 16 && Math.abs(fo.x - dx) < 24,
        );
        if (foe) hitFoe(foe, 0.7);
      }
      if (dogTimer > 22) {
        dogState = "trot";
        dogLunge = 0;
      }
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
      }
    }
    foes = foes.filter((foe) => (foe.state === "ko" ? foe.timer < 118 : foe.x > -60 && foe.y < H + 80));

    if (--spawnIn <= 0) {
      spawnFoe(f);
      if (Math.random() > 0.72) spawnFoe(f);
      spawnIn = Math.round(rand(62, 136));
    }

    // Effects
    for (const p of fx) {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      if (p.kind === "star") p.vy += 0.13;
      if (p.kind === "dust") p.vy -= 0.01;
    }
    fx = fx.filter((p) => p.life < p.max);

    score += 1;
  }

  /* -------------------------------------------------------------- drawing - */

  function heroPose(h: Hero): { pose: Pose; frame: number } {
    if (h.state === "walk") return { pose: "walk", frame: Math.floor((t + h.phase) / 7) & 3 };
    if (h.state === "cheer") return { pose: "cheer", frame: 0 };
    if (h.state === "slash") return { pose: "slash", frame: h.timer < 8 ? 0 : h.timer < 14 ? 1 : 2 };
    return { pose: h.state === "kick" ? "kick" : "punch", frame: 0 };
  }

  function nameplate(text: string, cx: number, y: number, ink: string) {
    const w = textWidth(text, 1);
    ctx.fillStyle = "#140d20";
    ctx.fillRect(Math.round(cx - w / 2) - 2, y - 2, w + 4, 10);
    ctx.fillStyle = "#2a2140";
    ctx.fillRect(Math.round(cx - w / 2) - 2, y - 2, w + 4, 1);
    drawText(ctx, text, cx, y, ink, { align: "center" });
  }

  function drawCast(f: Frame) {
    type Actor = { y: number; draw: () => void };
    const actors: Actor[] = [];

    for (const h of heroes) {
      const y = laneY(f, h.lane);
      const bobX = h.state === "walk" ? Math.sin((t + h.phase * 9) / 26) * 1.4 : 0;
      const x = h.baseX + bobX;
      const { pose, frame: fr } = heroPose(h);
      actors.push({
        y,
        draw: () => {
          drawFighter(ctx, x, y, h.f, pose, fr, false);
          if (theme.style === "shoot" && h.state === "punch" && h.timer >= 4 && h.timer <= 9) {
            const mx = Math.round(x) + 22;
            const my = y - 18;
            ctx.fillStyle = "#fff3b0";
            ctx.fillRect(mx, my - 1, 4, 3);
            ctx.fillStyle = "#ffb03a";
            ctx.fillRect(mx + 3, my, 3, 1);
            ctx.fillRect(mx + 1, my - 2, 1, 1);
            ctx.fillRect(mx + 1, my + 2, 1, 1);
            ctx.fillStyle = "#fff3b0";
            for (let bx = mx + 7; bx < f.W; bx += 7) ctx.fillRect(bx, my, 4, 1);
          }
          if (h.state === "slash" && h.timer >= 12 && h.timer <= 18) {
            ctx.fillStyle = "#ffffff";
            for (let i = 0; i < 9; i++) {
              const a = -0.9 + i * 0.16;
              ctx.fillRect(Math.round(x + 8 + Math.cos(a) * 22), Math.round(y - 18 + Math.sin(a) * 20), 2, 2);
            }
          }
          nameplate(h.name, Math.round(x), y - 42 - Math.round((1 - h.lane) * 7), h.ink);
        },
      });
    }

    // Delaney
    const dy = laneY(f, 0.62);
    const dx = heroes[1].baseX + 30 + dogLunge;
    actors.push({
      y: dy,
      draw: () => {
        drawDog(
          ctx,
          dx,
          dogState === "leap" ? dy - 7 : dy,
          theme.dog,
          dogState === "leap" ? "leap" : dogState === "bark" ? "bark" : "trot",
          Math.floor(t / 6) & 3,
          false,
        );
        nameplate(DOG_NAME, Math.round(dx) + 5, dy - 23, "#ffd166");
      },
    });

    for (const foe of foes) {
      actors.push({
        y: foe.y,
        draw: () => {
          const tint = foe.flash > 0 ? "#ffffff" : undefined;
          if (foe.state === "fly") {
            sctx.clearRect(0, 0, spin.width, spin.height);
            drawFighter(sctx, 28, 46, foe.f, "hurt", 0, true, tint);
            ctx.save();
            ctx.translate(Math.round(foe.x), Math.round(foe.y - 16));
            ctx.rotate(foe.angle);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(spin, -28, -46 + 16);
            ctx.restore();
            return;
          }
          const pose: Pose = foe.state === "ko" ? "ko" : foe.state === "hurt" ? "hurt" : "walk";
          const blink = foe.state === "ko" && foe.timer > 80 && Math.floor(foe.timer / 4) % 2 === 0;
          if (blink) return;
          drawFighter(ctx, foe.x, foe.y, foe.f, pose, Math.floor(t / 8) & 3, true, tint);
        },
      });
    }

    actors.sort((a, b) => a.y - b.y);
    for (const a of actors) a.draw();
  }

  function drawFx() {
    for (const p of fx) {
      if (p.kind === "star") {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
      } else if (p.kind === "dust") {
        ctx.fillStyle = p.color;
        const s = p.life < 8 ? 2 : 1;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
      } else if (p.kind === "word" && p.text) {
        const s = p.life < 4 ? 1 : 2;
        const w = textWidth(p.text, s);
        ctx.fillStyle = "#1a0f24";
        ctx.fillRect(Math.round(p.x - w / 2) - 2, Math.round(p.y) - 2, w + 4, 7 * s + 4);
        drawText(ctx, p.text, Math.round(p.x), Math.round(p.y), p.color, { scale: s, align: "center" });
      } else if (p.kind === "bubble" && p.text) {
        const w = textWidth(p.text, 1);
        ctx.fillStyle = "#f7f3ff";
        ctx.fillRect(Math.round(p.x - w / 2) - 3, Math.round(p.y) - 3, w + 6, 13);
        ctx.fillRect(Math.round(p.x) - 6, Math.round(p.y) + 10, 3, 3);
        drawText(ctx, p.text, Math.round(p.x), Math.round(p.y), "#1a0f24", { align: "center" });
      }
    }
  }

  function drawHud(f: Frame) {
    const ink = theme.hudInk;
    const sh = theme.hudShadow;
    const pad = compact ? 4 : 6;
    if (Math.floor(t / 22) % 2 === 0) {
      drawText(ctx, "1UP", pad, pad, "#ff6b6b", { shadow: sh });
    }
    drawText(ctx, String(score).padStart(7, "0"), pad, pad + 9, ink, { shadow: sh });
    drawText(ctx, "HI", f.W - pad, pad, "#ff6b6b", { align: "right", shadow: sh });
    drawText(ctx, String(hi).padStart(7, "0"), f.W - pad, pad + 9, ink, { align: "right", shadow: sh });
    // Game + stage sit along the bottom so the page title owns the top.
    drawText(ctx, theme.game, pad, f.H - pad - 7, "#9c93c9", { shadow: sh });
    if (f.W > 210) {
      drawText(ctx, theme.stage, f.W - pad, f.H - pad - 7, ink, { align: "right", shadow: sh });
    }
  }

  function drawScanlines(f: Frame) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#000000";
    for (let y = 0; y < f.H; y += 3) ctx.fillRect(0, y, f.W, 1);
    ctx.globalAlpha = 0.22;
    const edge = Math.max(3, Math.round(f.W * 0.04));
    for (let i = 0; i < edge; i++) {
      ctx.globalAlpha = 0.22 * (1 - i / edge);
      ctx.fillRect(i, 0, 1, f.H);
      ctx.fillRect(f.W - 1 - i, 0, 1, f.H);
    }
    ctx.restore();
  }

  function drawWipe(f: Frame) {
    // Arcade-style curtain: closes, swaps game, opens again.
    const half = WIPE_LEN / 2;
    const p = wipe <= half ? wipe / half : (WIPE_LEN - wipe) / half;
    const h = Math.round((f.H / 2) * p);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, f.W, h);
    ctx.fillRect(0, f.H - h, f.W, h);
    if (p > 0.7) {
      const y = Math.round(f.H / 2) - 12;
      drawText(ctx, "INSERT COIN", Math.round(f.W / 2), y, "#ffe9a8", { align: "center", scale: 1 });
      drawText(ctx, "NOW PLAYING", Math.round(f.W / 2), y + 12, "#8a83b8", { align: "center" });
      drawText(ctx, incoming || theme.game, Math.round(f.W / 2), y + 22, "#4fd1ff", { align: "center" });
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
    theme.fore(f);
    drawFx();
    ctx.restore();
    drawHud(f);
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
        incoming = themes[(themeIdx + 1) % themes.length].game;
        t = 0;
      }
    }
    step(frame());
    render();
    raf = requestAnimationFrame(loop);
  }

  resize();
  if (reduced) {
    render();
  } else {
    raf = requestAnimationFrame(loop);
  }

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
