"use client";

import { useState } from "react";
import { Expense } from "@/lib/types";

interface Props {
  participants: string[];
  onAdd: (expense: Expense) => void;
  onClose: () => void;
}

// Local YYYY-MM-DD (avoids UTC off-by-one from toISOString)
function todayLocal() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

// "2026-06-04" -> "Jun 4, 2026", built from local parts so the day never shifts
function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AddExpenseModal({ participants, onAdd, onClose }: Props) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayLocal());
  const [paidBy, setPaidBy] = useState(participants[0] ?? "");
  const [split, setSplit] = useState<string[]>(participants);
  const [saving, setSaving] = useState(false);

  const toggleSplit = (name: string) => {
    const next = split.includes(name) ? split.filter((n) => n !== name) : [...split, name];
    if (next.length > 0) setSplit(next);
  };

  const handleSubmit = async () => {
    if (!description || !amount) return;
    setSaving(true);
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, amount: parseFloat(amount), date: formatDisplayDate(date), paidBy, split }),
    });
    const expense = await res.json();
    onAdd(expense);
    setSaving(false);
    onClose();
  };

  const COLORS: Record<string, string> = {
    Phil: "bg-blue-500 border-blue-500 text-white",
    Matt: "bg-emerald-500 border-emerald-500 text-white",
    Gaz:  "bg-purple-500 border-purple-500 text-white",
  };
  const inactive = "bg-white border-gray-400 text-gray-700 hover:border-gray-600";

  const canSubmit = description.trim() && amount && !saving;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Add Expense</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">What was it?</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dinner at Pike Place"
              autoFocus
              className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Who paid?</label>
            <div className="flex gap-2">
              {participants.map((name) => (
                <button
                  key={name}
                  onClick={() => setPaidBy(name)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
                    paidBy === name ? (COLORS[name] ?? "bg-gray-600 border-gray-600 text-white") : inactive
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Split between</label>
            <div className="flex gap-2">
              {participants.map((name) => (
                <button
                  key={name}
                  onClick={() => toggleSplit(name)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
                    split.includes(name) ? (COLORS[name] ?? "bg-gray-600 border-gray-600 text-white") : inactive
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
