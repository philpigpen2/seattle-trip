"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Expense, ExpenseData } from "@/lib/types";
import SplitPicker from "@/components/SplitPicker";
import AddExpenseModal from "@/components/AddExpenseModal";

const CATEGORIES = ["Food & Drink", "Transport", "Shopping", "Activities", "Groceries"];

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Drink": "bg-orange-100 text-orange-700",
  "Transport":    "bg-sky-100 text-sky-700",
  "Shopping":     "bg-pink-100 text-pink-700",
  "Activities":   "bg-violet-100 text-violet-700",
  "Groceries":    "bg-green-100 text-green-700",
};

const PERSON_COLORS: Record<string, string> = {
  Phil: "bg-blue-100 text-blue-700",
  Matt: "bg-emerald-100 text-emerald-700",
  Gaz:  "bg-purple-100 text-purple-700",
};

type SortField = "date" | "amount";
type SortDir   = "asc" | "desc";

export default function Home() {
  const [data, setData] = useState<ExpenseData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const load = useCallback(async () => {
    const res = await fetch("/api/expenses", { cache: "no-store" });
    setData(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

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

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-blue-500 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const filtered = (data?.expenses ?? [])
    .filter((e) => {
      const matchSearch =
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        e.date.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "All" || e.category === categoryFilter;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortField === "amount") {
        return sortDir === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortDir === "asc" ? da - db : db - da;
    });

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
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
            {/* Search + category filters */}
            <div className="mb-3 flex gap-3 items-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">{filtered.length} · ${total.toFixed(2)}</span>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {["All", ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    categoryFilter === cat
                      ? cat === "All"
                        ? "bg-gray-800 text-white border-gray-800"
                        : `${CATEGORY_COLORS[cat]} border-transparent`
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th
                        className="text-left px-4 py-3 font-medium text-gray-600 w-28 cursor-pointer select-none hover:text-gray-900"
                        onClick={() => toggleSort("date")}
                      >
                        Date{sortIcon("date")}
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                      <th
                        className="text-right px-4 py-3 font-medium text-gray-600 w-24 cursor-pointer select-none hover:text-gray-900"
                        onClick={() => toggleSort("amount")}
                      >
                        Amount{sortIcon("amount")}
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Split</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600 w-32">Each</th>
                      <th className="px-4 py-3 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{expense.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{expense.description}</span>
                              {expense.receiptUrl && (
                                <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 text-xs">📷</a>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {expense.category && (
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[expense.category] ?? "bg-gray-100 text-gray-600"}`}>
                                  {expense.category}
                                </span>
                              )}
                              {expense.notes && <span className="text-xs text-gray-400">{expense.notes}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">${expense.amount.toFixed(2)}</td>
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
                                <span key={name} className={`px-1.5 py-0.5 rounded text-xs font-medium ${PERSON_COLORS[name] ?? "bg-gray-100 text-gray-700"}`}>
                                  {name} ${(expense.amount / expense.split.length).toFixed(2)}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            title="Delete"
                            className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
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
