"use client";

import { useEffect, useRef } from "react";
import { mountBrawl, type BrawlHandle } from "@/lib/brawl/engine";
import { themeById } from "@/lib/brawl/themes";

type Props = {
  /** Pin a single game, or leave undefined to rotate through all of them. */
  theme?: string;
  /** Seconds each game holds the screen before the next one starts. */
  rotateSeconds?: number;
  compact?: boolean;
  /** Which character the viewer is playing as. */
  player?: number;
  /** Fires when the running game changes, so the selector can follow along. */
  onTheme?: (id: string) => void;
  /** Receives a function for feeding directions in from an on-screen pad. */
  onReady?: (controls: {
    input: (dir: 0 | 1 | 2 | 3) => void;
    release: () => void;
    action: () => void;
  }) => void;
  className?: string;
};

export default function ArcadeStage({
  theme,
  rotateSeconds = 30,
  compact,
  player = 1,
  onTheme,
  onReady,
  className,
}: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const handle = useRef<BrawlHandle | null>(null);
  const onThemeRef = useRef(onTheme);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onThemeRef.current = onTheme;
    onReadyRef.current = onReady;
  }, [onTheme, onReady]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const themes = themeById(theme);
    const h = mountBrawl(canvas, themes, {
      rotateFrames: themes.length > 1 ? rotateSeconds * 60 : 0,
      compact,
      warmup: 150,
      player,
      onTheme: (id) => onThemeRef.current?.(id),
    });
    handle.current = h;
    onReadyRef.current?.({
      input: (dir) => h.input(dir),
      release: () => h.release(),
      action: () => h.action(),
    });
    return () => {
      handle.current = null;
      h.destroy();
    };
    // `player` is applied through the handle below rather than by remounting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, rotateSeconds, compact]);

  useEffect(() => {
    handle.current?.setPlayer(player);
  }, [player]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ imageRendering: "pixelated", display: "block", width: "100%", height: "100%", touchAction: "none" }}
    />
  );
}
