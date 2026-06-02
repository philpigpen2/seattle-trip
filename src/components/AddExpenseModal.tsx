"use client";

import { useState } from "react";
import { Expense } from "@/lib/types";

interface Props {
  participants: string[];
  onAdd: (expense: Expense) => void;
  onClose: () => void;
}

export default function AddExpenseModal({ participants, onAdd, onClose }: Props) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
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
      body: JSON.stringify({ description, amount: parseFloat(amount), paidBy, split }),
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
  const inactive = "bg-white border-gray-300 text-gray-500 hover:border-gray-400";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">Add Expense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What was it?</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dinner at Pike Place"
              autoFocus
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Who paid?</label>
            <div className="flex gap-2">
              {participants.map((name) => (
                <button
                  key={name}
                  onClick={() => setPaidBy(name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    paidBy === name ? (COLORS[name] ?? "bg-gray-500 border-gray-500 text-white") : inactive
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Split between</label>
            <div className="flex gap-2">
              {participants.map((name) => (
                <button
                  key={name}
                  onClick={() => toggleSplit(name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    split.includes(name) ? (COLORS[name] ?? "bg-gray-500 border-gray-500 text-white") : inactive
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !description || !amount}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : !description ? "Enter a description" : !amount ? "Enter an amount" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
