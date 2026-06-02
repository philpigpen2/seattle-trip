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

  const { participants, expenses } = data;

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

  const balance: Record<string, number> = {};
  for (const p of participants) balance[p] = paid[p] - owes[p];

  // Greedy settle-up
  const settlements: { from: string; to: string; amount: number }[] = [];
  const bal = { ...balance };
  const debtors = participants.filter((p) => bal[p] < -0.01).sort((a, b) => bal[a] - bal[b]);
  const creditors = participants.filter((p) => bal[p] > 0.01).sort((a, b) => bal[b] - bal[a]);
  let di = 0, ci = 0;
  while (di < debtors.length && ci < creditors.length) {
    const amount = Math.min(-bal[debtors[di]], bal[creditors[ci]]);
    if (amount > 0.01) settlements.push({ from: debtors[di], to: creditors[ci], amount: Math.round(amount * 100) / 100 });
    bal[debtors[di]] += amount;
    bal[creditors[ci]] -= amount;
    if (Math.abs(bal[debtors[di]]) < 0.01) di++;
    if (Math.abs(bal[creditors[ci]]) < 0.01) ci++;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-8 block">← Back</Link>

        {settlements.length === 0 ? (
          <p className="text-2xl font-semibold text-gray-700 text-center">Everyone&apos;s square 🎉</p>
        ) : (
          <div className="space-y-4">
            {settlements.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl px-6 py-5 shadow-sm text-center">
                <p className="text-xl font-semibold text-gray-900">
                  {s.from} owes {s.to}
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-1">${s.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
