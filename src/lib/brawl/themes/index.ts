import { contra } from "./contra";
import { ghosts } from "./ghosts";
import { goldenaxe } from "./goldenaxe";
import { mario } from "./mario";
import { street } from "./street";
import type { Theme } from "./types";

/** Every game in the attract-mode rotation, in order. */
export const THEMES: Theme[] = [street, mario, goldenaxe, ghosts, contra];

export function themeById(id: string | undefined): Theme[] {
  if (!id) return THEMES;
  const t = THEMES.find((x) => x.id === id);
  return t ? [t] : THEMES;
}

export type { Theme };
