import type { Frame } from "../bg";
import type { CritterKind, Dog, Fighter } from "../sprites";

export type FoeSpec = {
  fighter: Fighter;
  hp: number;
  speed: number;
  weight?: number;
  /** Omit for a person; set for a non-humanoid enemy. */
  sprite?: CritterKind;
  scale?: number;
};

export type HudState = {
  score: number;
  hi: number;
  t: number;
  lives: number;
  magic: number;
  timer: number;
  coins: number;
  /** 0..1 per hero, in cast order. */
  health: number[];
  labels: readonly string[];
  inks: string[];
};

/** How a defeated enemy comes apart — each game has its own signature. */
export type Impact = "spark" | "points" | "gleam" | "puff" | "boom";

/** A game that runs its own simulation instead of the walking brawl. */
export type CustomStage = {
  reset(w: number, h: number): void;
  step(): void;
  draw(f: Frame): void;
  score(): number;
  /** Coins picked up, for the games that count them. */
  coins?(): number;
  /** Which family member the viewer is playing as, 0-3. */
  setPlayer?(index: number): void;
  /** A direction the viewer is holding: 0 right, 1 down, 2 left, 3 up. */
  input?(dir: 0 | 1 | 2 | 3): void;
  /** The viewer let go — whoever they are driving should come to a stop. */
  release?(): void;
};

export type Theme = {
  id: string;
  /** Lines shown on the black card between games. */
  intro: string[];
  /** "depth" = beat-em-up plane, "flat" = side-on platformer on one ground line. */
  staging?: "depth" | "flat";
  /** Flat stages: pixels of ground drawn below the walk line. */
  floor?: number;
  /**
   * Internal width to aim for, which sets how chunky the pixels are.
   * 8-bit hardware was narrow (NES 256, Pac-Man 224); the 16-bit boards were
   * wider (Sega System 16 and Konami's TMNT board are 320 and 288).
   */
  targetW?: number;
  /** Height to aim for instead, for the games that ran on a vertical monitor. */
  targetH?: number;
  scroll: number;
  style: "brawl" | "blade" | "stomp" | "shoot" | "throw";
  impact: Impact;
  ink: string;
  shadow: string;
  heroes: Fighter[];
  dog: Dog;
  foes: FoeSpec[];
  hud(f: Frame, s: HudState): void;
  /** Replaces the brawl entirely — used by the maze game. */
  custom?: () => CustomStage;
  introRender?(f: Frame, cx: number, cy: number): void;
  special?: {
    everyFrames: number;
    duration: number;
    /** p runs 0..1 across the move. */
    render(f: Frame, p: number): void;
  };
  sky(f: Frame): void;
  far(f: Frame): void;
  mid(f: Frame): void;
  ground(f: Frame): void;
  fore(f: Frame): void;
};

/** Two grown-ups and two children. Order: Bethany, Phil, Evelyn, Charlotte. */
export const HERO_SCALE = [1, 1, 0.76, 0.66] as const;
