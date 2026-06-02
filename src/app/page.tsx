"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Expense, ExpenseData } from "@/lib/types";
import SplitPicker from "@/components/SplitPicker";
import AddExpenseModal from "@/components/AddExpenseModal";

export default function Home() {
  const [data, setData] = useState<ExpenseData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/expenses", { cache: "no-store" });
    setData(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateSplit = async (id: string, split: string[]) => {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, expenses: prev.expenses.map((e) => e.id === id ? { ...e, split } : e) };
    });
    await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ split }),
    });
  };

  const deleteExpense = async (id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, expenses: prev.expenses.filter((e) => e.id !== id) };
    });
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
  };

  const handleAdd = (expense: Expense) => {
    setData((prev) => prev ? { ...prev, expenses: [...prev.expenses, expense] } : prev);
  };

  const handleSeed = async () => {
    setSeeding(true);
    await fetch("/api/seed", { method: "POST" });
    await load();
    setSeeding(false);
  };

  const filtered = data?.expenses.filter((e) =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.date.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  const colors: Record<string, string> = {
    Phil: "bg-blue-100 text-blue-700",
    Matt: "bg-emerald-100 text-emerald-700",
    Gaz: "bg-purple-100 text-purple-700",
  };

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seattle Trip 🌧️</h1>
            <p className="text-sm text-gray-500">May–Jun 2026 · Phil, Matt, Gaz</p>
          </div>
          <div className="flex gap-2">
            <Link href="/summary" className="px-3 py-2 rounded-lg border bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              Summary
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              + Add
            </button>
          </div>
        </div>

        {data.expenses.length === 0 && (
          <div className="bg-white rounded-xl border p-8 text-center">
            <p className="text-gray-500 mb-4">No expenses yet.</p>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {seeding ? "Loading transactions..." : "Load Phil's 50 CC transactions"}
            </button>
          </div>
        )}

        {data.expenses.length > 0 && (
          <>
            <div className="mb-4 flex gap-3 items-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search expenses..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">{filtered.length} items · ${total.toFixed(2)}</span>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 w-28">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600 w-24">Total</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Split between</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600 w-24">Each</th>
                      <th className="px-4 py-3 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50 group">
                        <td className="px-4 py-3 text-gray-500 text-xs">{expense.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{expense.description}</span>
                            {expense.receiptUrl && (
                              <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                                📷
                              </a>
                            )}
                            {expense.notes && <span className="text-xs text-gray-400">{expense.notes}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">${expense.amount.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <SplitPicker
                            participants={data.participants}
                            split={expense.split}
                            onChange={(s) => updateSplit(expense.id, s)}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {expense.split.length > 1 && (
                            <div className="flex flex-wrap gap-1 justify-end">
                              {expense.split.map((name) => (
                                <span key={name} className={`px-1.5 py-0.5 rounded text-xs font-medium ${colors[name] ?? "bg-gray-100 text-gray-700"}`}>
                                  {name} ${(expense.amount / expense.split.length).toFixed(2)}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity text-lg leading-none"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <AddExpenseModal
          participants={data.participants}
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  );
}
