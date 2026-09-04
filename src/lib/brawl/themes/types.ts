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
  /** 0..1 per hero, in cast order. */
  health: number[];
  labels: readonly string[];
  inks: string[];
};

/** How a defeated enemy comes apart — each game has its own signature. */
export type Impact = "spark" | "points" | "gleam" | "puff" | "boom";

export type Theme = {
  id: string;
  /** Lines shown on the black card between games. */
  intro: string[];
  scroll: number;
  style: "brawl" | "blade" | "stomp" | "shoot" | "throw";
  impact: Impact;
  ink: string;
  shadow: string;
  heroes: Fighter[];
  dog: Dog;
  foes: FoeSpec[];
  hud(f: Frame, s: HudState): void;
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

/** Birth years stand in for names. Order: Bethany, Phil, Evelyn, Charlotte. */
export const HERO_LABELS = ["1981", "1981", "2015", "2017"] as const;
/** Two grown-ups and two children. */
export const HERO_SCALE = [1, 1, 0.76, 0.66] as const;
