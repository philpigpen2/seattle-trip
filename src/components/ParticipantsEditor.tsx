"use client";

import { useState } from "react";

interface Props {
  participants: string[];
  onChange: (participants: string[]) => void;
}

export default function ParticipantsEditor({ participants, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [names, setNames] = useState<string[]>(participants);
  const [saving, setSaving] = useState(false);

  const open = () => { setNames([...participants]); setEditing(true); };
  const close = () => setEditing(false);

  const save = async () => {
    const valid = names.map((n) => n.trim()).filter(Boolean);
    if (valid.length === 0) return;
    setSaving(true);
    await fetch("/api/participants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participants: valid }),
    });
    onChange(valid);
    setSaving(false);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button onClick={open} className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
        Edit people
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {names.map((name, i) => (
        <div key={i} className="flex items-center gap-1">
          <input
            value={name}
            onChange={(e) => {
              const next = [...names];
              next[i] = e.target.value;
              setNames(next);
            }}
            className="border rounded px-2 py-1 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {names.length > 1 && (
            <button onClick={() => setNames(names.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500 text-sm">×</button>
          )}
        </div>
      ))}
      <button
        onClick={() => setNames([...names, ""])}
        className="text-xs text-blue-500 hover:text-blue-700 font-medium"
      >
        + Add
      </button>
      <button onClick={save} disabled={saving} className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50">
        {saving ? "Saving..." : "Save"}
      </button>
      <button onClick={close} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
    </div>
  );
}
