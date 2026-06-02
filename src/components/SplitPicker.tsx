"use client";

interface Props {
  participants: string[];
  split: string[];
  onChange: (split: string[]) => void;
}

export default function SplitPicker({ participants, split, onChange }: Props) {
  const toggle = (name: string) => {
    const next = split.includes(name) ? split.filter((n) => n !== name) : [...split, name];
    if (next.length > 0) onChange(next);
  };

  const colors: Record<string, string> = {
    Phil: "bg-blue-500 text-white border-blue-500",
    Matt: "bg-emerald-500 text-white border-emerald-500",
    Gaz: "bg-purple-500 text-white border-purple-500",
  };
  const inactive = "bg-white text-gray-500 border-gray-300 hover:border-gray-400";

  return (
    <div className="flex gap-1">
      {participants.map((name) => (
        <button
          key={name}
          onClick={() => toggle(name)}
          className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${
            split.includes(name) ? (colors[name] ?? "bg-gray-500 text-white border-gray-500") : inactive
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
