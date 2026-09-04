"use client";

/**
 * Cabinet-style game select. The games are shown as pixel icons rather than
 * names — the point is that you recognise them.
 */

type Icon = { rows: string[]; key: Record<string, string> };

const ICONS: Record<string, Icon> = {
  // A fist.
  street: {
    rows: [
      "..FFFF..",
      ".FFFFFF.",
      "FFFFFFFF",
      "FFFFFFFF",
      "FFHFFHFF",
      ".FFFFFF.",
      ".SSSSSS.",
      "..SSSS..",
    ],
    key: { F: "#f0b892", H: "#c98a68", S: "#2f6df0" },
  },
  // A question block.
  mario: {
    rows: [
      "KKKKKKKK",
      "KOOOOOOK",
      "KOWWWOOK",
      "KOOOWOOK",
      "KOOWOOOK",
      "KOOWOOOK",
      "KOOOOOOK",
      "KKKKKKKK",
    ],
    key: { K: "#1b1008", O: "#fac000", W: "#ffffff" },
  },
  // The man himself.
  pacman: {
    rows: [
      "..YYYY..",
      ".YYYYYY.",
      "YYYY....",
      "YYY.....",
      "YYY.....",
      "YYYY....",
      ".YYYYYY.",
      "..YYYY..",
    ],
    key: { Y: "#ffff00" },
  },
  // A magic pot.
  goldenaxe: {
    rows: [
      "...BB...",
      "..BWWB..",
      "..BBBB..",
      ".BBBBBB.",
      ".BLBBBB.",
      ".BLBBBB.",
      ".BBBBBB.",
      "..BBBB..",
    ],
    key: { B: "#3fa0e6", L: "#9adcff", W: "#8a6a3a" },
  },
  // A masked face.
  tmnt: {
    rows: [
      ".GGGGGG.",
      "GGGGGGGG",
      "BBBBBBBB",
      "BWWBBWWB",
      "BBBBBBBB",
      "GGGGGGGG",
      "GGGGGGGG",
      ".GG..GG.",
    ],
    key: { G: "#6bbd3a", B: "#3f7ad6", W: "#ffffff" },
  },
  // A weapon capsule.
  contra: {
    rows: [
      "........",
      ".WWWWWW.",
      "WWRRRRWW",
      "WRRWRRRW",
      "WRRRWRRW",
      "WWRRRRWW",
      ".WWWWWW.",
      "........",
    ],
    key: { W: "#e0e4ec", R: "#d02020" },
  },
};

/** Shown to screen readers and on hover — the same words as the intro card. */
const NAMES: Record<string, string> = {
  street: "The Street",
  mario: "World 1-1",
  pacman: "The Maze",
  goldenaxe: "The Path",
  tmnt: "The Streets",
  contra: "The Jungle",
};

export const GAME_IDS = ["street", "mario", "pacman", "goldenaxe", "tmnt", "contra"];

function PixelIcon({ id }: { id: string }) {
  const icon = ICONS[id];
  if (!icon) return null;
  return (
    <svg viewBox="0 0 8 8" width="20" height="20" shapeRendering="crispEdges" aria-hidden="true">
      {icon.rows.flatMap((row, y) =>
        Array.from(row).map((ch, x) =>
          ch === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={icon.key[ch]} />,
        ),
      )}
    </svg>
  );
}

export default function GameSelector({
  pinned,
  current,
  onPick,
}: {
  pinned: string | null;
  current: string | null;
  onPick: (id: string | null) => void;
}) {
  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-sm bg-[#0a0b23]/85 p-1.5 ring-2 ring-[#2a2a5c]">
      <button
        type="button"
        onClick={() => onPick(null)}
        aria-pressed={pinned === null}
        title="Play all in turn"
        className={`font-arcade px-2 py-2 text-[8px] leading-none transition-colors ${
          pinned === null ? "bg-[#ffd166] text-[#12122e]" : "text-[#8a83b8] hover:text-[#ffd166]"
        }`}
      >
        AUTO
      </button>
      {GAME_IDS.map((id) => {
        const isPinned = pinned === id;
        const isPlaying = pinned === null && current === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            aria-label={NAMES[id]}
            aria-pressed={isPinned}
            title={NAMES[id]}
            className={`flex h-8 w-8 items-center justify-center transition-all ${
              isPinned
                ? "bg-[#ffd166]"
                : isPlaying
                  ? "bg-[#2a2a5c]"
                  : "bg-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <PixelIcon id={id} />
          </button>
        );
      })}
    </div>
  );
}
