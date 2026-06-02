"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExpenseData } from "@/lib/types";

export default function Summary() {
  const [data, setData] = useState<ExpenseData | null>(null);

  useEffect(() => {
    fetch("/api/expenses", { cache: "no-store" }).then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  const colors: Record<string, { card: string; badge: string; dot: string }> = {
    Phil: { card: "border-blue-200 bg-blue-50", badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
    Matt: { card: "border-emerald-200 bg-emerald-50", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
    Gaz: { card: "border-purple-200 bg-purple-50", badge: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  };

  const totals: Record<string, number> = {};
  const items: Record<string, { description: string; amount: number; share: number }[]> = {};

  for (const p of data.participants) {
    totals[p] = 0;
    items[p] = [];
  }

  for (const expense of data.expenses) {
    const share = expense.amount / expense.split.length;
    for (const name of expense.split) {
      if (totals[name] !== undefined) {
        totals[name] += share;
        items[name].push({ description: expense.description, amount: expense.amount, share });
      }
    }
  }

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  const nonPhil = data.participants.filter((p) => p !== "Phil");
  const totalOwedToPhil = nonPhil.reduce((sum, p) => sum + totals[p], 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Summary</h1>
            <p className="text-sm text-gray-500">Who owes what</p>
          </div>
          <Link href="/" className="px-3 py-2 rounded-lg border bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            ← Back
          </Link>
        </div>

        <div className="bg-white rounded-xl border p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Total trip spend</span>
            <span className="text-xl font-bold text-gray-900">${grandTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Owed to Phil</span>
            <span className="text-xl font-bold text-blue-600">${totalOwedToPhil.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-4">
          {data.participants.map((person) => {
            const c = colors[person] ?? { card: "border-gray-200 bg-gray-50", badge: "bg-gray-100 text-gray-700", dot: "bg-gray-400" };
            return (
              <div key={person} className={`rounded-xl border-2 overflow-hidden ${c.card}`}>
                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${c.dot}`} />
                    <span className="font-semibold text-gray-900 text-lg">{person}</span>
                    {person !== "Phil" && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>owes Phil</span>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-gray-900">${totals[person].toFixed(2)}</span>
                </div>
                <div className="border-t bg-white divide-y max-h-64 overflow-y-auto">
                  {items[person].slice(0, 20).map((item, i) => (
                    <div key={i} className="px-5 py-2 flex justify-between text-sm">
                      <span className="text-gray-700">{item.description}</span>
                      <div className="text-right">
                        <span className="text-gray-900 font-medium">${item.share.toFixed(2)}</span>
                        {item.share !== item.amount && (
                          <span className="text-gray-400 text-xs ml-1">(of ${item.amount.toFixed(2)})</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {items[person].length > 20 && (
                    <div className="px-5 py-2 text-xs text-gray-400">+ {items[person].length - 20} more items</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
