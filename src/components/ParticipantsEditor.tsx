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
    <div className="bg-white border rounded-xl p-4 flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-gray-700 mr-1">People:</span>
      {names.map((name, i) => (
        <div key={i} className="flex items-center gap-1.5 bg-gray-50 border rounded-lg px-2 py-1">
          <input
            value={name}
            onChange={(e) => {
              const next = [...names];
              next[i] = e.target.value;
              setNames(next);
            }}
            className="text-sm text-gray-900 bg-transparent w-24 focus:outline-none placeholder-gray-400"
            placeholder="Name"
          />
          {names.length > 1 && (
            <button
              onClick={() => setNames(names.filter((_, j) => j !== i))}
              className="text-gray-400 hover:text-red-500 text-base leading-none ml-1"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => setNames([...names, ""])}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        + Add person
      </button>
      <div className="flex gap-2 ml-auto">
        <button onClick={close} className="px-3 py-1.5 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
