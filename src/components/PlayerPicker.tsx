"use client";

/**
 * Who you are playing as. Told apart by hair, a cap or a pair of ears — the
 * same toppers the characters wear in the game.
 */
type Face = { rows: string[]; key: Record<string, string> };

const FACES: Face[] = [
  // Long hair
  {
    rows: [
      ".HHHHHH.",
      "HHHHHHHH",
      "HHSSSSHH",
      "HSSSSSSH",
      "HSKSSKSH",
      "HSSSSSSH",
      "HSSSSSSH",
      "H.SSSS.H",
    ],
    key: { H: "#8a3a1e", S: "#f0b892", K: "#1a1020" },
  },
  // Cap
  {
    rows: [
      "..HHHH..",
      ".HHHHHH.",
      "HHHHHHHH",
      "HHHHHHHH",
      ".SSSSSS.",
      ".SKSSKS.",
      ".SSSSSS.",
      "..SSSS..",
    ],
    key: { H: "#2f6df0", S: "#f0b892", K: "#1a1020" },
  },
  // Ponytail
  {
    rows: [
      "..HHHH..",
      ".HHHHHH.",
      "HHHHHHHP",
      ".SSSSSPP",
      ".SKSSKSP",
      ".SSSSSS.",
      ".SSSSSS.",
      "..SSSS..",
    ],
    key: { H: "#6b4423", P: "#8a5c30", S: "#f6c9a4", K: "#1a1020" },
  },
  // Bob
  {
    rows: [
      "..HHHH..",
      ".HHHHHH.",
      "HHHHHHHH",
      "HHSSSSHH",
      "HSKSSKSH",
      "HSSSSSSH",
      ".SSSSSS.",
      "..SSSS..",
    ],
    key: { H: "#f0d488", S: "#f6c9a4", K: "#1a1020" },
  },
  // The dog
  {
    rows: [
      "E......E",
      "EE....EE",
      "EEEEEEEE",
      ".FFFFFF.",
      ".FKFFKF.",
      ".FFFFFF.",
      "..FFFFNN",
      "...FFF..",
    ],
    key: { E: "#8a4a2a", F: "#a8603a", K: "#1a1020", N: "#2a1a14" },
  },
];

const LABELS = ["Player one", "Player two", "Player three", "Player four", "The dog"];

function Face({ i }: { i: number }) {
  const f = FACES[i];
  return (
    <svg viewBox="0 0 8 8" width="20" height="20" shapeRendering="crispEdges" aria-hidden="true">
      {f.rows.flatMap((row, y) =>
        Array.from(row).map((ch, x) =>
          ch === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={f.key[ch]} />,
        ),
      )}
    </svg>
  );
}

export default function PlayerPicker({
  player,
  onPick,
}: {
  player: number;
  onPick: (i: number) => void;
}) {
  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-sm bg-[#0a0b23]/85 p-1.5 ring-2 ring-[#2a2a5c]">
      <span className="font-arcade px-1 text-[7px] leading-none text-[#8a83b8]">YOU</span>
      {FACES.map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(i)}
          aria-label={LABELS[i]}
          aria-pressed={player === i}
          title={LABELS[i]}
          className={`flex h-8 w-8 items-center justify-center transition-all ${
            player === i ? "bg-[#ffd166]" : "bg-transparent opacity-55 hover:opacity-100"
          }`}
        >
          <Face i={i} />
        </button>
      ))}
    </div>
  );
}
