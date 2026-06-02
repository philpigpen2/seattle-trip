"use client";

import { useState, useRef } from "react";
import { Expense } from "@/lib/types";
import SplitPicker from "./SplitPicker";

interface Props {
  participants: string[];
  onAdd: (expense: Expense) => void;
  onClose: () => void;
}

type Mode = "quick" | "detailed" | "receipt";

export default function AddExpenseModal({ participants, onAdd, onClose }: Props) {
  const [mode, setMode] = useState<Mode>("quick");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [split, setSplit] = useState<string[]>(participants);
  const [extracting, setExtracting] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setReceiptPreview(objectUrl);
    setExtracting(true);

    // Convert to base64 for both OCR and storage
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;
    setReceiptUrl(dataUrl);

    // Auto-extract details via GPT-4o-mini vision
    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: dataUrl }),
      });
      const extracted = await res.json();
      if (extracted.description && !description) setDescription(extracted.description);
      if (extracted.amount && !amount) setAmount(String(extracted.amount));
      if (extracted.date && !date) setDate(extracted.date);
    } catch {
      // OCR failed silently — user fills in manually
    }
    setExtracting(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async () => {
    if (!description || !amount) return;
    setSaving(true);
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, amount: parseFloat(amount), date, notes, split, receiptUrl }),
    });
    const expense = await res.json();
    onAdd(expense);
    setSaving(false);
    onClose();
  };

  const busy = saving || extracting;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">Add Expense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="flex border-b">
          {(["quick", "detailed", "receipt"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === m ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {m === "receipt" ? "📷 Scan Receipt" : m === "quick" ? "⚡ Quick" : "📝 Detailed"}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {mode === "receipt" && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => !extracting && fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                extracting ? "border-blue-300 bg-blue-50 cursor-wait" : "border-gray-300 cursor-pointer hover:border-blue-400"
              }`}
            >
              {extracting ? (
                <div className="text-blue-500">
                  <div className="text-3xl mb-2 animate-pulse">🔍</div>
                  <p className="text-sm font-medium">Reading receipt...</p>
                  <p className="text-xs text-blue-400 mt-1">Extracting details automatically</p>
                </div>
              ) : receiptPreview ? (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={receiptPreview} alt="Receipt" className="max-h-40 mx-auto rounded mb-2" />
                  <p className="text-xs text-gray-400">Tap to replace</p>
                </div>
              ) : (
                <div className="text-gray-400">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-sm font-medium text-gray-600">Drop a receipt or tap to pick one</p>
                  <p className="text-xs mt-1">Details will be filled in automatically</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was it?"
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

          {(mode === "detailed" || mode === "receipt") && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. May 30 2026"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any context..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Who&apos;s splitting this?</label>
            <SplitPicker participants={participants} split={split} onChange={setSplit} />
          </div>
        </div>

        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy || !description || !amount}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : extracting ? "Reading receipt..." : "Add Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}
