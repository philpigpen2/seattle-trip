"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SignInButton } from "@clerk/nextjs";
import ArcadeStage from "./ArcadeStage";
import DPad from "./DPad";
import GameSelector, { GAME_IDS } from "./GameSelector";
import PlayerPicker from "./PlayerPicker";

/** Games you can take control of. The rest play themselves for now. */
const PLAYABLE = new Set(["pacman", "mario", "street", "goldenaxe", "tmnt", "contra"]);
/** Games with an attack button rather than a jump. */
const BRAWLERS = new Set(["street", "goldenaxe", "tmnt", "contra"]);

export default function Landing({ game }: { game?: string }) {
  const [pinned, setPinned] = useState<string | null>(
    game && GAME_IDS.includes(game) ? game : null,
  );
  const [current, setCurrent] = useState<string | null>(null);
  const [player, setPlayer] = useState(1);
  const [uiAwake, setUiAwake] = useState(true);
  const controls = useRef<{
    input: (dir: 0 | 1 | 2 | 3) => void;
    release: () => void;
    action: () => void;
  } | null>(null);

  const pick = useCallback((id: string | null) => {
    setPinned(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("game", id);
    else url.searchParams.delete("game");
    window.history.replaceState(null, "", url);
  }, []);

  // The pad feeds the same input the keyboard and swipes use.
  const sendDir = useCallback((dir: 0 | 1 | 2 | 3) => controls.current?.input(dir), []);
  const sendRelease = useCallback(() => controls.current?.release(), []);
  const sendAction = useCallback(() => controls.current?.action(), []);
  const handleReady = useCallback(
    (c: { input: (dir: 0 | 1 | 2 | 3) => void; release: () => void; action: () => void }) => {
      controls.current = c;
    },
    [],
  );

  const playing = pinned !== null && PLAYABLE.has(pinned);
  const brawling = pinned !== null && BRAWLERS.has(pinned);
  // Slim marquee whenever the game owns the screen: the maze always does, and
  // any game somebody has settled down to play does too.
  const full = current === "pacman" || playing;

  // Controls dim away so the game has the screen, and wake on any activity.
  useEffect(() => {
    let timer = 0;
    const wake = () => {
      setUiAwake(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setUiAwake(false), 3200);
    };
    wake();
    window.addEventListener("pointermove", wake, { passive: true });
    window.addEventListener("pointerdown", wake, { passive: true });
    window.addEventListener("keydown", wake, { passive: true });
    window.addEventListener("touchstart", wake, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("touchstart", wake);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    // Stop the arrow keys scrolling the page while somebody is playing.
    const stop = (e: KeyboardEvent) => {
      if (e.key.startsWith("Arrow")) e.preventDefault();
    };
    window.addEventListener("keydown", stop, { passive: false });
    return () => window.removeEventListener("keydown", stop);
  }, [playing]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0a0b23]">
      <div className="absolute inset-0">
        <ArcadeStage
          theme={pinned ?? undefined}
          player={player}
          onTheme={setCurrent}
          onReady={handleReady}
        />
      </div>

      {full ? (
        // A full-screen game gets a slim marquee instead of a centred block.
        <div className="pointer-events-none relative z-10 flex w-full items-center justify-between gap-3 px-4 pt-3">
          <div className="flex items-baseline gap-4">
            <h1 className="font-arcade text-[clamp(11px,2.2vw,20px)] leading-none text-[#ffe9a8] [text-shadow:2px_2px_0_#c0392b]">
              PHIL LANEY
            </h1>
            {playing && (
              <span
                className={`font-arcade hidden text-[clamp(6px,1.1vw,9px)] leading-none text-[#b9b2e0] transition-opacity duration-500 sm:inline ${
                  uiAwake ? "opacity-100" : "opacity-0"
                }`}
              >
                {brawling ? "ARROWS TO MOVE - SPACE OR A TO HIT" : "ARROWS OR WASD TO PLAY"}
              </span>
            )}
          </div>
          <SignInButton mode="modal" forceRedirectUrl="/" signUpForceRedirectUrl="/">
            <button
              type="button"
              className="font-arcade pointer-events-auto cursor-pointer bg-[#12122e] px-3 py-2 text-[clamp(7px,1.4vw,11px)] text-[#ffd166] ring-2 ring-[#ffd166] transition-colors hover:bg-[#ffd166] hover:text-[#12122e]"
            >
              <span className="arcade-blink">&#9654;</span> PRESS START
            </button>
          </SignInButton>
        </div>
      ) : (
        <div className="pointer-events-none relative z-10 flex min-h-screen w-full flex-col items-center overflow-hidden px-3 pt-[clamp(120px,19vh,196px)] text-center">
          <h1 className="font-arcade leading-[1.35] text-[clamp(16px,5.6vw,64px)] text-[#ffe9a8] [text-shadow:3px_3px_0_#c0392b,6px_6px_0_#2a0f22]">
            PHIL LANEY
          </h1>

          <p className="font-arcade mt-5 text-[clamp(7px,1.7vw,12px)] leading-[2] text-[#8fe3ff] [text-shadow:2px_2px_0_#101033]">
            PERSONAL APPS &amp; PROJECTS
          </p>

          <SignInButton mode="modal" forceRedirectUrl="/" signUpForceRedirectUrl="/">
            <button
              type="button"
              className="font-arcade pointer-events-auto mt-9 inline-block cursor-pointer bg-[#12122e] px-6 py-4 text-[clamp(9px,2vw,15px)] text-[#ffd166] transition-colors hover:bg-[#ffd166] hover:text-[#12122e] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#8fe3ff]"
              style={{ boxShadow: "0 0 0 4px #0a0b23, 0 0 0 8px #ffd166, 0 10px 0 4px #00000055" }}
            >
              <span className="arcade-blink">&#9654;</span> PRESS START
            </button>
          </SignInButton>

          <p className="font-arcade mt-5 text-[clamp(6px,1.4vw,9px)] leading-[2.2] text-[#b9b2e0] [text-shadow:2px_2px_0_#101033]">
            SIGN IN TO CONTINUE
          </p>
        </div>
      )}

      {/* Cabinet controls, over the game. */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 p-3 transition-opacity duration-500 ${
          uiAwake ? "opacity-100" : "opacity-25"
        }`}
      >
        {playing && (
          <div className="pointer-events-auto">
            <PlayerPicker player={player} onPick={setPlayer} />
          </div>
        )}
        <GameSelector pinned={pinned} current={current} onPick={pick} />
      </div>

      {playing && (
        <div
          className={`absolute bottom-3 right-3 z-20 transition-opacity duration-500 sm:bottom-6 sm:right-6 ${
            uiAwake ? "opacity-100" : "opacity-40"
          }`}
        >
          <DPad
            onDir={sendDir}
            onRelease={sendRelease}
            onAction={pinned && BRAWLERS.has(pinned) ? sendAction : undefined}
          />
        </div>
      )}
    </main>
  );
}
