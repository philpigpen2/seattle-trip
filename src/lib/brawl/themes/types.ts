import type { Frame } from "../bg";
import type { Dog, Fighter } from "../sprites";

export type FoeSpec = {
  fighter: Fighter;
  hp: number;
  speed: number;
  weight?: number;
};

export type Theme = {
  id: string;
  game: string;
  stage: string;
  scroll: number;
  style: "brawl" | "blade" | "stomp" | "shoot";
  hitWords: string[];
  hudInk: string;
  hudShadow: string;
  heroes: Fighter[];
  dog: Dog;
  foes: FoeSpec[];
  sky(f: Frame): void;
  far(f: Frame): void;
  mid(f: Frame): void;
  ground(f: Frame): void;
  fore(f: Frame): void;
};

export const HERO_NAMES = ["BETHANY", "PHIL", "EVELYN", "CHARLOTTE"] as const;
