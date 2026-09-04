// Hand-authored pixel sprites, drawn as rectangle lists in a 16x30 local box.
// Local (8, 30) is the anchor: the middle of the feet, standing on the ground.
// Rectangles may spill outside the box (weapons, mohawks) — that is fine.

export type Palette = {
  skin: string;
  skinShade: string;
  hair: string;
  hair2: string;
  shirt: string;
  shirt2: string;
  accent: string;
  belt: string;
  pants: string;
  pants2: string;
  shoes: string;
  shoes2: string;
};

export type HairStyle =
  | "short"
  | "long"
  | "pony"
  | "bob"
  | "mane"
  | "mohawk"
  | "bald"
  | "helm"
  | "hood"
  | "cap"
  | "bandana"
  | "skull";

export type Weapon = "none" | "sword" | "axe" | "staff" | "club" | "gun" | "sai" | "nunchaku";

export type Pose = "walk" | "punch" | "kick" | "slash" | "hurt" | "ko" | "idle" | "cheer";

export type Fighter = {
  pal: Palette;
  hair: HairStyle;
  weapon?: Weapon;
  cape?: string;
  skirt?: boolean;
  big?: boolean;
  moustache?: boolean;
  plume?: string;
  /** Turtle plastron and shell rim. */
  shell?: string;
  band?: string;
};

type Rect = [number, number, number, number, string];

const DARK = "#150d1c";

/* ------------------------------------------------------------------ head - */

function head(o: Rect[], f: Fighter, dx: number, dy: number) {
  const p = f.pal;
  // Skull / face
  if (f.hair === "skull") {
    o.push([5 + dx, 2 + dy, 6, 6, "#e8e4d0"]);
    o.push([5 + dx, 7 + dy, 6, 1, "#b3ad95"]);
    o.push([8 + dx, 4 + dy, 2, 2, DARK]);
    o.push([6 + dx, 4 + dy, 1, 2, DARK]);
    o.push([8 + dx, 7 + dy, 1, 1, DARK]);
    o.push([10 + dx, 6 + dy, 1, 1, "#b3ad95"]);
    return;
  }
  o.push([5 + dx, 2 + dy, 6, 6, p.skin]);
  o.push([5 + dx, 7 + dy, 6, 1, p.skinShade]);
  o.push([9 + dx, 4 + dy, 1, 2, DARK]); // eye
  o.push([10 + dx, 6 + dy, 1, 1, p.skinShade]); // jaw
  if (f.moustache) {
    o.push([8 + dx, 6 + dy, 4, 2, p.hair]);
    o.push([11 + dx, 5 + dy, 1, 1, p.hair]);
  }

  switch (f.hair) {
    case "short":
      o.push([4 + dx, 0 + dy, 8, 3, p.hair]);
      o.push([4 + dx, 3 + dy, 1, 4, p.hair]);
      o.push([5 + dx, 2 + dy, 5, 1, p.hair2]);
      o.push([11 + dx, 2 + dy, 1, 1, p.hair]);
      break;
    case "long":
      o.push([4 + dx, 0 + dy, 8, 3, p.hair]);
      o.push([3 + dx, 1 + dy, 2, 11, p.hair]);
      o.push([2 + dx, 4 + dy, 1, 6, p.hair2]);
      o.push([11 + dx, 2 + dy, 1, 5, p.hair]);
      o.push([5 + dx, 2 + dy, 4, 1, p.hair2]);
      break;
    case "pony":
      o.push([4 + dx, 0 + dy, 8, 3, p.hair]);
      o.push([4 + dx, 3 + dy, 1, 3, p.hair]);
      o.push([2 + dx, 1 + dy, 2, 2, p.hair]);
      o.push([0 + dx, 2 + dy, 2, 5, p.hair]);
      o.push([1 + dx, 6 + dy, 2, 2, p.hair2]);
      break;
    case "bob":
      o.push([4 + dx, 0 + dy, 8, 3, p.hair]);
      o.push([3 + dx, 1 + dy, 2, 7, p.hair]);
      o.push([11 + dx, 2 + dy, 1, 5, p.hair]);
      o.push([5 + dx, 2 + dy, 3, 1, p.hair2]);
      break;
    case "mane":
      o.push([4 + dx, -1 + dy, 8, 4, p.hair]);
      o.push([2 + dx, 0 + dy, 3, 13, p.hair]);
      o.push([1 + dx, 3 + dy, 2, 8, p.hair2]);
      o.push([11 + dx, 1 + dy, 1, 4, p.hair]);
      break;
    case "mohawk":
      o.push([6 + dx, -4 + dy, 4, 5, p.hair]);
      o.push([7 + dx, -6 + dy, 2, 2, p.hair]);
      o.push([4 + dx, 1 + dy, 8, 2, p.hair2]);
      break;
    case "bald":
      o.push([5 + dx, 1 + dy, 6, 2, p.skin]);
      o.push([5 + dx, 1 + dy, 6, 1, p.skinShade]);
      break;
    case "helm":
      if (f.plume) {
        o.push([5 + dx, -6 + dy, 6, 3, f.plume]);
        o.push([4 + dx, -4 + dy, 3, 4, f.plume]);
      }
      o.push([4 + dx, 0 + dy, 8, 4, p.accent]);
      o.push([4 + dx, 0 + dy, 8, 1, p.shirt2]);
      o.push([4 + dx, 4 + dy, 2, 4, p.accent]);
      o.push([11 + dx, 4 + dy, 1, 3, p.accent]);
      o.push([6 + dx, -3 + dy, 2, 3, p.hair]); // horn
      o.push([10 + dx, -3 + dy, 2, 3, p.hair]);
      break;
    case "cap":
      o.push([4 + dx, 0 + dy, 8, 3, p.hair2]);
      o.push([4 + dx, 0 + dy, 8, 1, p.accent]);
      o.push([10 + dx, 3 + dy, 4, 1, p.hair2]);
      o.push([4 + dx, 3 + dy, 1, 3, p.hair]);
      break;
    case "bandana": {
      const band = f.band ?? p.accent;
      o.push([5 + dx, 1 + dy, 6, 2, p.skin]);
      o.push([4 + dx, 3 + dy, 8, 3, band]);
      o.push([9 + dx, 4 + dy, 2, 1, "#ffffff"]);
      o.push([6 + dx, 4 + dy, 1, 1, "#ffffff"]);
      o.push([1 + dx, 3 + dy, 3, 2, band]);
      o.push([0 + dx, 5 + dy, 2, 3, band]);
      o.push([2 + dx, 6 + dy, 2, 3, band]);
      break;
    }
    case "hood":
      o.push([3 + dx, -1 + dy, 10, 5, p.shirt]);
      o.push([3 + dx, 4 + dy, 2, 7, p.shirt]);
      o.push([11 + dx, 3 + dy, 2, 4, p.shirt2]);
      o.push([5 + dx, 3 + dy, 4, 1, DARK]);
      break;
  }
}

/* ------------------------------------------------------------------ limbs - */

function leg(o: Rect[], x: number, shin: number, pants: string, shoe: string) {
  o.push([x, 19, 3, 5, pants]);
  o.push([x + shin, 24, 3, 3, pants]);
  o.push([x + shin - 1, 27, 4, 2, shoe]);
}

function legsWalk(o: Rect[], f: Fighter, frame: number) {
  const p = f.pal;
  const phase = frame & 3;
  if (phase === 0) {
    leg(o, 5, -2, p.pants2, p.shoes2);
    leg(o, 8, 3, p.pants, p.shoes);
  } else if (phase === 2) {
    leg(o, 5, 3, p.pants2, p.shoes2);
    leg(o, 8, -2, p.pants, p.shoes);
  } else {
    leg(o, 5, 0, p.pants2, p.shoes2);
    leg(o, 8, 0, p.pants, p.shoes);
  }
}

function legsBrace(o: Rect[], f: Fighter) {
  const p = f.pal;
  leg(o, 4, -2, p.pants2, p.shoes2);
  leg(o, 9, 2, p.pants, p.shoes);
}

function torso(o: Rect[], f: Fighter, dx: number, dy: number) {
  const p = f.pal;
  o.push([7 + dx, 8 + dy, 2, 1, p.skinShade]); // neck
  o.push([4 + dx, 9 + dy, 8, 9, p.shirt]);
  o.push([4 + dx, 9 + dy, 8, 2, p.shirt2]);
  o.push([11 + dx, 11 + dy, 1, 7, p.shirt2]);
  o.push([5 + dx, 12 + dy, 6, 1, p.accent]);
  o.push([4 + dx, 18 + dy, 8, 2, p.belt]);
  o.push([7 + dx, 18 + dy, 2, 2, p.accent]);
  if (f.shell) {
    o.push([3 + dx, 9 + dy, 1, 10, p.shirt2]);
    o.push([5 + dx, 10 + dy, 7, 8, f.shell]);
    o.push([5 + dx, 10 + dy, 7, 1, "#ffffff"]);
    o.push([6 + dx, 13 + dy, 5, 1, p.belt]);
    o.push([6 + dx, 16 + dy, 5, 1, p.belt]);
  }
  if (f.skirt) {
    o.push([3 + dx, 19 + dy, 10, 3, p.shirt]);
    o.push([3 + dx, 21 + dy, 10, 1, p.shirt2]);
  }
}

function armBack(o: Rect[], f: Fighter, dx: number, dy: number) {
  const p = f.pal;
  o.push([2 + dx, 10 + dy, 2, 4, p.shirt2]);
  o.push([2 + dx, 14 + dy, 2, 3, p.skinShade]);
  o.push([2 + dx, 17 + dy, 2, 2, p.skin]);
}

function armFront(o: Rect[], f: Fighter, dx: number, dy: number) {
  const p = f.pal;
  o.push([11 + dx, 10 + dy, 2, 4, p.shirt]);
  o.push([11 + dx, 14 + dy, 2, 3, p.skin]);
  o.push([11 + dx, 17 + dy, 2, 2, p.skin]);
}

/* ---------------------------------------------------------------- weapons - */

type Grip = "rest" | "raise" | "mid" | "down" | "guard";

function weapon(o: Rect[], f: Fighter, grip: Grip, dx = 0, dy = 0) {
  const w = f.weapon ?? "none";
  if (w === "none") return;
  const steel = "#d8dce8";
  const steel2 = "#8b93a8";
  const gold = "#e8b23c";
  const wood = "#8a5a32";

  const put = (x: number, y: number, ww: number, hh: number, c: string) =>
    o.push([x + dx, y + dy, ww, hh, c]);

  if (w === "sword") {
    if (grip === "rest") {
      put(12, 15, 2, 3, wood);
      put(11, 14, 4, 1, gold);
      put(12, 2, 2, 12, steel);
      put(13, 2, 1, 12, steel2);
      put(12, 1, 2, 1, steel);
    } else if (grip === "raise") {
      put(10, 3, 2, 3, wood);
      put(9, 2, 4, 1, gold);
      put(10, -10, 2, 12, steel);
      put(11, -10, 1, 12, steel2);
    } else if (grip === "mid") {
      put(13, 6, 3, 2, wood);
      put(13, 5, 2, 4, gold);
      put(15, 0, 3, 3, steel);
      put(17, -2, 3, 3, steel);
      put(19, -4, 3, 3, steel);
      put(21, -6, 2, 2, steel2);
    } else {
      put(13, 12, 3, 2, wood);
      put(15, 11, 2, 4, gold);
      put(17, 12, 8, 2, steel);
      put(17, 13, 8, 1, steel2);
      put(25, 12, 2, 2, steel);
    }
    return;
  }

  if (w === "axe") {
    if (grip === "rest") {
      put(12, 4, 2, 14, wood);
      put(9, 2, 6, 5, steel);
      put(9, 2, 6, 2, steel2);
      put(8, 3, 1, 3, steel);
    } else if (grip === "raise") {
      put(10, -2, 2, 14, wood);
      put(7, -7, 7, 6, steel);
      put(7, -7, 7, 2, steel2);
    } else if (grip === "mid") {
      put(13, 6, 8, 2, wood);
      put(19, 1, 6, 6, steel);
      put(19, 1, 6, 2, steel2);
    } else {
      put(13, 13, 8, 2, wood);
      put(19, 11, 6, 6, steel);
      put(19, 11, 6, 2, steel2);
    }
    return;
  }

  if (w === "staff") {
    if (grip === "raise" || grip === "mid") {
      put(11, -8, 2, 24, wood);
      put(10, -11, 4, 4, gold);
      put(11, -12, 2, 1, "#fff3b0");
    } else {
      put(12, 0, 2, 20, wood);
      put(11, -3, 4, 4, gold);
      put(12, -4, 2, 1, "#fff3b0");
    }
    return;
  }

  if (w === "gun") {
    const gun = "#3a4250";
    const gun2 = "#5d6878";
    if (grip === "down" || grip === "mid") {
      put(12, 11, 4, 4, "#6b4526");
      put(15, 11, 7, 3, gun);
      put(15, 11, 7, 1, gun2);
      put(22, 12, 5, 1, gun);
      put(16, 14, 2, 2, gun);
    } else {
      put(11, 15, 3, 4, "#6b4526");
      put(12, 6, 2, 10, gun);
      put(13, 6, 1, 10, gun2);
      put(11, 12, 4, 2, gun);
    }
    return;
  }

  if (w === "sai") {
    const steel = "#d8dce8";
    const steel2 = "#8b93a8";
    if (grip === "down" || grip === "mid") {
      put(13, 12, 3, 2, "#2a2233");
      put(16, 12, 8, 2, steel);
      put(16, 13, 8, 1, steel2);
      put(17, 10, 1, 3, steel2);
      put(17, 14, 1, 3, steel2);
    } else {
      put(12, 14, 2, 3, "#2a2233");
      put(12, 6, 2, 8, steel);
      put(13, 6, 1, 8, steel2);
      put(10, 8, 1, 3, steel2);
      put(14, 8, 1, 3, steel2);
    }
    return;
  }

  if (w === "nunchaku") {
    const wood2 = "#5c3a1c";
    if (grip === "down" || grip === "mid") {
      put(13, 12, 6, 2, wood2);
      put(19, 13, 2, 1, "#9aa0ac");
      put(21, 9, 2, 6, wood2);
    } else if (grip === "raise") {
      put(11, 2, 2, 6, wood2);
      put(12, 8, 1, 2, "#9aa0ac");
      put(9, 9, 5, 2, wood2);
    } else {
      put(12, 10, 2, 6, wood2);
      put(13, 16, 1, 2, "#9aa0ac");
      put(11, 18, 4, 2, wood2);
    }
    return;
  }

  if (w === "club") {
    if (grip === "raise") {
      put(10, -4, 2, 14, wood);
      put(8, -9, 6, 6, "#6b4526");
      put(9, -10, 4, 1, "#6b4526");
    } else if (grip === "down") {
      put(13, 12, 7, 2, wood);
      put(19, 9, 6, 7, "#6b4526");
    } else {
      put(12, 6, 2, 12, wood);
      put(10, 1, 6, 6, "#6b4526");
    }
  }
}

/* -------------------------------------------------------------- assembler - */

function buildRects(f: Fighter, pose: Pose, frame: number): Rect[] {
  const o: Rect[] = [];
  const p = f.pal;

  if (pose === "ko") {
    // Flat out on their back with one boot still in the air.
    o.push([1, 27, 21, 2, "#241d31"]); // shadow
    o.push([8, 16, 4, 3, p.skin]); // flung arm
    o.push([7, 14, 2, 2, p.skin]);
    o.push([0, 20, 5, 4, p.hair]);
    o.push([1, 21, 6, 6, f.hair === "skull" ? "#e8e4d0" : p.skin]);
    o.push([3, 23, 1, 1, DARK]);
    o.push([5, 23, 1, 1, DARK]);
    o.push([1, 26, 6, 1, p.skinShade]);
    o.push([7, 21, 8, 6, p.shirt]);
    o.push([7, 21, 8, 2, p.shirt2]);
    o.push([15, 21, 2, 6, p.belt]);
    o.push([17, 24, 6, 3, p.pants2]); // leg flat on the ground
    o.push([22, 24, 3, 3, p.shoes2]);
    o.push([17, 20, 4, 3, p.pants]); // leg in the air
    o.push([20, 16, 3, 5, p.pants]);
    o.push([19, 13, 4, 3, p.shoes]);
    o.push([9, 27, 5, 2, p.skin]);
    return o;
  }

  if (pose === "hurt") {
    head(o, f, -2, -1);
    torso(o, f, -1, 0);
    armBack(o, f, -2, -3);
    o.push([1, 6, 2, 3, p.skin]);
    armFront(o, f, -1, -4);
    o.push([10, 4, 2, 3, p.skin]);
    leg(o, 4, -3, p.pants2, p.shoes2);
    leg(o, 8, 1, p.pants, p.shoes);
    return o;
  }

  if (pose === "punch") {
    head(o, f, 1, 0);
    armBack(o, f, -1, 2);
    torso(o, f, 1, 0);
    legsBrace(o, f);
    // Extended lead arm.
    o.push([12, 11, 3, 3, p.shirt]);
    o.push([15, 12, 3, 2, p.skin]);
    o.push([18, 10, 4, 4, p.skin]);
    o.push([18, 10, 4, 1, p.skinShade]);
    if (f.weapon === "gun") weapon(o, f, "down", 6, 1);
    return o;
  }

  if (pose === "kick") {
    head(o, f, -1, 0);
    torso(o, f, -1, 1);
    armBack(o, f, -3, -1);
    armFront(o, f, -1, -3);
    // Support leg + extended kick.
    leg(o, 4, 0, p.pants2, p.shoes2);
    o.push([8, 19, 5, 3, p.pants]);
    o.push([13, 18, 5, 3, p.pants]);
    o.push([18, 17, 4, 3, p.shoes]);
    return o;
  }

  if (pose === "slash") {
    const grip: Grip = frame === 0 ? "raise" : frame === 1 ? "mid" : "down";
    const lean = frame === 2 ? 1 : frame === 1 ? 0 : -1;
    if (grip === "raise") weapon(o, f, grip);
    head(o, f, lean, 0);
    armBack(o, f, lean - 1, 0);
    torso(o, f, lean, 0);
    legsBrace(o, f);
    if (grip !== "raise") weapon(o, f, grip);
    o.push([11 + lean, 10, 2, 4, p.shirt]);
    o.push([11 + lean, 14, 2, 3, p.skin]);
    return o;
  }

  if (pose === "cheer") {
    head(o, f, 0, 0);
    torso(o, f, 0, 0);
    o.push([2, 6, 2, 5, p.shirt2]);
    o.push([2, 4, 2, 2, p.skin]);
    o.push([12, 6, 2, 5, p.shirt]);
    o.push([12, 4, 2, 2, p.skin]);
    leg(o, 5, 0, p.pants2, p.shoes2);
    leg(o, 8, 0, p.pants, p.shoes);
    weapon(o, f, "rest");
    return o;
  }

  // idle + walk
  const phase = pose === "walk" ? frame & 3 : 1;
  const swing = phase === 0 ? 1 : phase === 2 ? -1 : 0;
  head(o, f, 0, 0);
  armBack(o, f, swing, 0);
  torso(o, f, 0, 0);
  if (pose === "walk") legsWalk(o, f, frame);
  else {
    leg(o, 5, 0, p.pants2, p.shoes2);
    leg(o, 8, 0, p.pants, p.shoes);
  }
  armFront(o, f, -swing, 0);
  weapon(o, f, "rest");
  return o;
}

/* ------------------------------------------------------------------ paint - */

/**
 * Paints a rect list. `k` scales the whole figure by resampling rectangle
 * edges rather than pixels, so a child-sized fighter still has 1px detail
 * and no seams.
 */
function paint(
  ctx: CanvasRenderingContext2D,
  rects: Rect[],
  bx: number,
  by: number,
  flip: boolean,
  tint: string | undefined,
  k: number,
  anchorX: number,
  anchorY: number,
) {
  const ax = Math.round(anchorX * k);
  const ay = Math.round(anchorY * k);
  for (const [lx, ly, lw, lh, c] of rects) {
    const x0 = Math.round(lx * k);
    const x1 = Math.round((lx + lw) * k);
    const y0 = Math.round(ly * k);
    const y1 = Math.round((ly + lh) * k);
    const w = Math.max(1, x1 - x0);
    const h = Math.max(1, y1 - y0);
    const sx = flip ? bx + ax - x0 - w : bx - ax + x0;
    ctx.fillStyle = tint ?? c;
    ctx.fillRect(sx, by - ay + y0, w, h);
  }
}

export function drawFighter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  f: Fighter,
  pose: Pose,
  frame: number,
  flip: boolean,
  tint?: string,
  k = 1,
): void {
  const bx = Math.round(x);
  const by = Math.round(y);

  if (f.cape && pose !== "ko") {
    const sway = (frame & 1) === 1 ? 1 : 0;
    paint(
      ctx,
      [
        [1 - sway, 9, 4, 12, f.cape],
        [0 - sway, 12, 2, 7, f.cape],
        [4, 8, 8, 2, f.cape],
      ],
      bx,
      by,
      flip,
      tint,
      k,
      8,
      30,
    );
  }

  paint(ctx, buildRects(f, pose, frame), bx, by, flip, tint, k, 8, 30);
}

/* -------------------------------------------------------------------- dog - */

export type DogPose = "trot" | "leap" | "bark" | "sit";

export type Dog = {
  fur: string;
  fur2: string;
  nose: string;
  collar: string;
  hat?: string;
};

/** Delaney. Anchor is (7, 11) — middle of her paws. */
export function drawDog(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  d: Dog,
  pose: DogPose,
  frame: number,
  flip: boolean,
  k = 1,
): void {
  const o: Rect[] = [];
  const bob = pose === "trot" && (frame & 1) === 1 ? 1 : 0;
  const lift = pose === "leap" ? 2 : 0;

  // Chihuahua crossed with a dachshund: long and low, on very short legs,
  // with ears far too big for her.
  o.push([2, 4 + bob, 11, 4, d.fur]);
  o.push([2, 4 + bob, 11, 1, d.fur2]);
  o.push([11, 5 + bob, 3, 3, d.fur]);

  // Tail, up and curling.
  const wag = frame & 1 ? 1 : 0;
  o.push([0, 3 + bob - wag, 2, 2, d.fur]);
  o.push([0, 1 + bob - wag, 1, 2, d.fur2]);
  o.push([1, 0 + bob - wag, 1, 1, d.fur2]);

  // Head, long snout, big upright ears.
  const hy = bob - lift;
  o.push([11, 1 + hy, 5, 4, d.fur]);
  o.push([12, 0 + hy, 3, 1, d.fur]);
  o.push([15, 3 + hy, 3, 2, d.fur2]);
  o.push([18, 3 + hy, 1, 1, d.nose]);
  o.push([14, 2 + hy, 1, 1, "#1a1020"]);
  o.push([10, -3 + hy, 2, 5, d.fur2]);
  o.push([10, -4 + hy, 1, 2, d.fur2]);
  o.push([13, -4 + hy, 2, 5, d.fur]);
  o.push([14, -5 + hy, 1, 2, d.fur]);
  if (pose === "bark") {
    o.push([16, 5 + hy, 2, 1, "#ffffff"]);
  }
  if (d.hat) {
    o.push([11, -2 + hy, 5, 2, d.hat]);
    o.push([12, -3 + hy, 2, 1, d.hat]);
  }

  o.push([10, 4 + bob, 1, 4, d.collar]);

  // Four very short legs.
  if (pose === "leap") {
    o.push([11, 8 + bob, 4, 2, d.fur]);
    o.push([1, 7 + bob, 4, 2, d.fur2]);
  } else if (pose === "sit") {
    o.push([11, 8, 2, 3, d.fur]);
    o.push([2, 6, 4, 5, d.fur2]);
  } else {
    const a = frame & 1 ? 1 : -1;
    o.push([11 + a, 8 + bob, 2, 3 - bob, d.fur]);
    o.push([8 - a, 8 + bob, 2, 3 - bob, d.fur2]);
    o.push([4 + a, 8 + bob, 2, 3 - bob, d.fur]);
    o.push([2 - a, 8 + bob, 2, 3 - bob, d.fur2]);
  }

  paint(ctx, o.filter(([, , w, h]) => w > 0 && h > 0), Math.round(x), Math.round(y), flip, undefined, k, 8, 11);
}


/* --------------------------------------------------------------- critters - */

export type CritterKind = "goomba" | "koopa" | "ghost";
export type CritterPose = "walk" | "hurt" | "flat" | "ko";

/**
 * Enemies that are not people. Anchored at the middle of the feet, like a
 * fighter, so the engine can place them the same way.
 */
export function drawCritter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  kind: CritterKind,
  p: Palette,
  pose: CritterPose,
  frame: number,
  flip: boolean,
  tint?: string,
  k = 1,
): void {
  const o: Rect[] = [];
  const dark = "#1b1008";
  const anchorX = 8;
  let anchorY = 30;

  if (kind === "ghost") {
    // Dome, wavy skirt, and the eyes that follow you.
    anchorY = 15;
    const body = pose === "hurt" || pose === "flat" || pose === "ko" ? "#2121ff" : p.shirt;
    const scared = body === "#2121ff";
    o.push([4, 0, 8, 2, body]);
    o.push([2, 2, 12, 3, body]);
    o.push([1, 5, 14, 7, body]);
    const w = frame & 1 ? 0 : 2;
    for (let i = 0; i < 4; i++) {
      o.push([1 + i * 4, 12, 2, 3 - ((i + w) % 2), body]);
      o.push([3 + i * 4, 12, 2, 1 + ((i + w) % 2), body]);
    }
    if (scared) {
      o.push([3, 5, 2, 2, "#ffffff"]);
      o.push([9, 5, 2, 2, "#ffffff"]);
      o.push([3, 9, 10, 1, "#ffffff"]);
      o.push([4, 8, 2, 1, "#ffffff"]);
      o.push([8, 8, 2, 1, "#ffffff"]);
    } else {
      o.push([2, 4, 4, 5, "#ffffff"]);
      o.push([8, 4, 4, 5, "#ffffff"]);
      o.push([2, 6, 2, 3, "#2121de"]);
      o.push([8, 6, 2, 3, "#2121de"]);
    }
  } else if (kind === "goomba") {
    // 16x16: domed cap, tan face, angry brows, two feet that swap.
    anchorY = 16;
    if (pose === "flat" || pose === "ko") {
      o.push([0, 12, 16, 4, p.shirt]);
      o.push([1, 12, 14, 1, p.shirt2]);
      o.push([3, 13, 3, 2, p.skin]);
      o.push([10, 13, 3, 2, p.skin]);
      o.push([4, 13, 1, 1, "#000000"]);
      o.push([11, 13, 1, 1, "#000000"]);
    } else {
      const sq = pose === "hurt" ? 1 : 0;
      o.push([5, 0 + sq, 6, 1, p.shirt2]);
      o.push([3, 1 + sq, 10, 1, p.shirt]);
      o.push([2, 2 + sq, 12, 2, p.shirt]);
      o.push([1, 4 + sq, 14, 5 - sq, p.shirt]);
      o.push([0, 6 + sq, 1, 3, p.shirt]);
      o.push([15, 6 + sq, 1, 3, p.shirt]);
      o.push([1, 9, 14, 4, p.skin]);
      o.push([0, 10, 1, 2, p.skin]);
      o.push([15, 10, 1, 2, p.skin]);
      // Eyes sit across the line where the cap meets the face.
      o.push([3, 6 + sq, 3, 4, "#ffffff"]);
      o.push([10, 6 + sq, 3, 4, "#ffffff"]);
      o.push([5, 7 + sq, 1, 3, "#000000"]);
      o.push([10, 7 + sq, 1, 3, "#000000"]);
      // Heavy brows, angled towards the middle.
      o.push([2, 5 + sq, 4, 1, "#000000"]);
      o.push([4, 6 + sq, 2, 1, "#000000"]);
      o.push([10, 5 + sq, 4, 1, "#000000"]);
      o.push([10, 6 + sq, 2, 1, "#000000"]);
      // Feet.
      const step = frame & 1;
      o.push([step ? 0 : 1, 13, 6, 3, p.pants]);
      o.push([step ? 10 : 9, 13, 6, 3, p.pants2]);
    }
  } else {
    // Koopa: shell on the back, beak forward, orange feet.
    anchorY = 26;
    if (pose === "flat" || pose === "ko") {
      o.push([2, 19, 12, 7, p.shirt]);
      o.push([3, 19, 10, 2, p.shirt2]);
      o.push([5, 22, 2, 2, p.shirt2]);
      o.push([9, 22, 2, 2, p.shirt2]);
      o.push([13, 21, 4, 5, p.skin]);
      o.push([16, 23, 1, 1, p.skinShade]);
      o.push([0, 21, 3, 4, p.skin]);
      o.push([3, 25, 3, 1, p.pants]);
      o.push([9, 25, 3, 1, p.pants]);
    } else {
      const bob = frame & 1 ? 1 : 0;
      o.push([2, 8 + bob, 11, 13, p.shirt]);
      o.push([3, 9 + bob, 9, 2, p.shirt2]);
      o.push([3, 13 + bob, 3, 3, p.shirt2]);
      o.push([8, 16 + bob, 3, 3, p.shirt2]);
      o.push([11, 10 + bob, 5, 11, p.accent]); // belly plate
      o.push([9, 1 + bob, 6, 7, p.skin]);
      o.push([14, 4 + bob, 3, 3, p.skinShade]);
      o.push([12, 3 + bob, 1, 2, dark]);
      o.push([9, 0 + bob, 4, 1, p.skinShade]);
      o.push([7, 11 + bob, 3, 3, p.skin]);
      const step = frame & 1 ? 2 : -1;
      o.push([4 + step, 21 + bob, 5, 4, p.pants]);
      o.push([9 - step, 21 + bob, 5, 4, p.pants2]);
    }
  }

  paint(ctx, o.filter(([, , w, h]) => w > 0 && h > 0), Math.round(x), Math.round(y), flip, tint, k, anchorX, anchorY);
}
