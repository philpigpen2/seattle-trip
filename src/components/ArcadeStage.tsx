"use client";

import { useEffect, useRef } from "react";
import { mountBrawl } from "@/lib/brawl/engine";
import { themeById } from "@/lib/brawl/themes";

type Props = {
  /** Pin a single game, or leave undefined to rotate through all of them. */
  theme?: string;
  /** Seconds each game holds the screen before the next one starts. */
  rotateSeconds?: number;
  compact?: boolean;
  className?: string;
};

export default function ArcadeStage({ theme, rotateSeconds = 30, compact, className }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const themes = themeById(theme);
    const handle = mountBrawl(canvas, themes, {
      rotateFrames: themes.length > 1 ? rotateSeconds * 60 : 0,
      compact,
      warmup: 150,
    });
    return () => handle.destroy();
  }, [theme, rotateSeconds, compact]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ imageRendering: "pixelated", display: "block", width: "100%", height: "100%" }}
    />
  );
}
