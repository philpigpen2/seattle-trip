import { contra } from "./contra";
import { goldenaxe } from "./goldenaxe";
import { mario } from "./mario";
import { pacman } from "./pacman";
import { street } from "./street";
import { tmnt } from "./tmnt";
import type { Theme } from "./types";

/** Every game in the attract-mode rotation, in order. */
export const THEMES: Theme[] = [street, mario, pacman, goldenaxe, tmnt, contra];

export function themeById(id: string | undefined): Theme[] {
  if (!id) return THEMES;
  const t = THEMES.find((x) => x.id === id);
  return t ? [t] : THEMES;
}

export type { Theme };
