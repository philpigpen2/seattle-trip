"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExpenseData } from "@/lib/types";

const COLORS: Record<string, string> = {
  Phil: "bg-blue-500",
  Matt: "bg-emerald-500",
  Gaz:  "bg-purple-500",
};
const TEXT: Record<string, string> = {
  Phil: "text-blue-700",
  Matt: "text-emerald-700",
  Gaz:  "text-purple-700",
};
const CARD: Record<string, string> = {
  Phil: "border-blue-100 bg-blue-50",
  Matt: "border-emerald-100 bg-emerald-50",
  Gaz:  "border-purple-100 bg-purple-50",
};

export default function Summary() {
  const [data, setData] = useState<ExpenseData | null>(null);

  useEffect(() => {
    fetch("/api/expenses", { cache: "no-store" }).then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  const { participants, expenses } = data;

  // Calculate how much each person paid and how much they owe
  const paid: Record<string, number> = {};
  const owes: Record<string, number> = {};
  for (const p of participants) { paid[p] = 0; owes[p] = 0; }

  for (const e of expenses) {
    const payer = e.paidBy ?? participants[0];
    if (paid[payer] !== undefined) paid[payer] += e.amount;
    const share = e.amount / e.split.length;
    for (const name of e.split) {
      if (owes[name] !== undefined) owes[name] += share;
    }
  }

  // Net balance: positive = this person is owed money, negative = they owe money
  const balance: Record<string, number> = {};
  for (const p of participants) balance[p] = paid[p] - owes[p];

  // Settle up: greedy algorithm to find minimum transfers
  const settlements: { from: string; to: string; amount: number }[] = [];
  const bal = { ...balance };
  const debtors = participants.filter((p) => bal[p] < -0.01).sort((a, b) => bal[a] - bal[b]);
  const creditors = participants.filter((p) => bal[p] > 0.01).sort((a, b) => bal[b] - bal[a]);
  const d = [...debtors], c = [...creditors];
  let di = 0, ci = 0;
  while (di < d.length && ci < c.length) {
    const amount = Math.min(-bal[d[di]], bal[c[ci]]);
    if (amount > 0.01) settlements.push({ from: d[di], to: c[ci], amount: Math.round(amount * 100) / 100 });
    bal[d[di]] += amount;
    bal[c[ci]] -= amount;
    if (Math.abs(bal[d[di]]) < 0.01) di++;
    if (Math.abs(bal[c[ci]]) < 0.01) ci++;
  }

  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Summary</h1>
            <p className="text-sm text-gray-500">Who owes whom</p>
          </div>
          <Link href="/" className="px-3 py-2 rounded-lg border bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">← Back</Link>
        </div>

        {/* Settle up */}
        <div className="bg-white rounded-xl border p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Settle Up</h2>
          {settlements.length === 0 ? (
            <p className="text-gray-500 text-sm">Everyone&apos;s square! 🎉</p>
          ) : (
            <div className="space-y-2">
              {settlements.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-white text-xs font-medium ${COLORS[s.from] ?? "bg-gray-500"}`}>{s.from}</span>
                  <span className="text-gray-400">owes</span>
                  <span className={`px-2 py-0.5 rounded-full text-white text-xs font-medium ${COLORS[s.to] ?? "bg-gray-500"}`}>{s.to}</span>
                  <span className="font-bold text-gray-900 ml-auto">${s.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Per-person breakdown */}
        <div className="space-y-4 mb-6">
          {participants.map((name) => (
            <div key={name} className={`rounded-xl border-2 overflow-hidden ${CARD[name] ?? "border-gray-100 bg-gray-50"}`}>
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${COLORS[name] ?? "bg-gray-400"}`} />
                  <span className="font-semibold text-gray-900">{name}</span>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${balance[name] >= 0 ? "text-gray-900" : "text-red-600"}`}>
                    {balance[name] >= 0 ? `+$${balance[name].toFixed(2)}` : `-$${Math.abs(balance[name]).toFixed(2)}`}
                  </div>
                  <div className="text-xs text-gray-500">{balance[name] >= 0 ? "is owed" : "owes"}</div>
                </div>
              </div>
              <div className="border-t bg-white px-5 py-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Paid</div>
                  <div className={`font-medium ${TEXT[name] ?? "text-gray-700"}`}>${paid[name].toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Share of expenses</div>
                  <div className="font-medium text-gray-700">${owes[name].toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-gray-400">
          Total trip spend: <span className="font-medium text-gray-600">${totalSpend.toFixed(2)}</span>
        </div>
      </div>
    </main>
  );
}
