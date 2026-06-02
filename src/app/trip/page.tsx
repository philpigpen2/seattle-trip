"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Expense, ExpenseData } from "@/lib/types";
import AddExpenseModal from "@/components/AddExpenseModal";
import ParticipantsEditor from "@/components/ParticipantsEditor";
import InviteModal from "@/components/InviteModal";
import OnboardingModal from "@/components/OnboardingModal";

const PERSON_COLORS: Record<string, { header: string; active: string; activeCell: string; inactiveCell: string; paid: string }> = {
  Phil: { header: "text-blue-600",    active: "font-semibold text-blue-700", activeCell: "bg-blue-50",    inactiveCell: "text-blue-300 hover:text-blue-500 hover:bg-blue-50",    paid: "bg-blue-100 text-blue-700" },
  Matt: { header: "text-emerald-600", active: "font-semibold text-emerald-700", activeCell: "bg-emerald-50", inactiveCell: "text-emerald-300 hover:text-emerald-500 hover:bg-emerald-50", paid: "bg-emerald-100 text-emerald-700" },
  Gaz:  { header: "text-purple-600",  active: "font-semibold text-purple-700",  activeCell: "bg-purple-50",  inactiveCell: "text-purple-300 hover:text-purple-500 hover:bg-purple-50",  paid: "bg-purple-100 text-purple-700" },
};
const defaultStyle = { header: "text-gray-600", active: "font-semibold text-gray-700", activeCell: "bg-gray-50", inactiveCell: "text-gray-300 hover:text-gray-500 hover:bg-gray-50", paid: "bg-gray-100 text-gray-700" };

type SortField = "date" | "amount";
type SortDir   = "asc" | "desc";

function calcSettlements(participants: string[], expenses: Expense[]) {
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

  const settlements: { from: string; to: string; amount: number }[] = [];
  const bal = { ...balance };
  const debtors   = [...participants].filter((p) => bal[p] < -0.01).sort((a, b) => bal[a] - bal[b]);
  const creditors = [...participants].filter((p) => bal[p] > 0.01).sort((a, b) => bal[b] - bal[a]);
  let di = 0, ci = 0;
  while (di < debtors.length && ci < creditors.length) {
    const amount = Math.min(-bal[debtors[di]], bal[creditors[ci]]);
    if (amount > 0.01) settlements.push({ from: debtors[di], to: creditors[ci], amount: Math.round(amount * 100) / 100 });
    bal[debtors[di]] += amount;
    bal[creditors[ci]] -= amount;
    if (Math.abs(bal[debtors[di]]) < 0.01) di++;
    if (Math.abs(bal[creditors[ci]]) < 0.01) ci++;
  }
  return settlements;
}

export default function Home() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const isAdmin = user?.publicMetadata?.role === "admin";
  const hasRole = !!user?.publicMetadata?.role;

  const [data, setData] = useState<ExpenseData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("onboarding_complete");
  });

  const completeOnboarding = () => {
    localStorage.setItem("onboarding_complete", "1");
    setShowOnboarding(false);
  };
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const bootstrap = async () => {
    setBootstrapping(true);
    await fetch("/api/bootstrap", { method: "POST" });
    await user?.reload();
    setBootstrapping(false);
  };

  const load = useCallback(async () => {
    const res = await fetch("/api/expenses", { cache: "no-store" });
    setData(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const togglePerson = (expense: Expense, name: string) => {
    const next = expense.split.includes(name)
      ? expense.split.filter((n) => n !== name)
      : [...expense.split, name];
    if (next.length === 0) return;
    patchExpense(expense.id, { split: next });
  };

  const cyclePaidBy = (expense: Expense, participants: string[]) => {
    const idx = participants.indexOf(expense.paidBy ?? participants[0]);
    patchExpense(expense.id, { paidBy: participants[(idx + 1) % participants.length] });
  };

  const patchExpense = async (id: string, patch: Partial<Expense>) => {
    setData((prev) => prev ? { ...prev, expenses: prev.expenses.map((e) => e.id === id ? { ...e, ...patch } : e) } : prev);
    await fetch(`/api/expenses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    setTimeout(load, 1200);
  };

  const deleteExpense = async (id: string) => {
    setData((prev) => prev ? { ...prev, expenses: prev.expenses.filter((e) => e.id !== id) } : prev);
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    setTimeout(load, 1200);
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

  const sortIcon = (field: SortField) =>
    sortField !== field
      ? <span className="text-gray-300 ml-1">↕</span>
      : <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;

  const filtered = (data?.expenses ?? [])
    .filter((e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.date.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "amount") return sortDir === "asc" ? a.amount - b.amount : b.amount - a.amount;
      const da = new Date(a.date).getTime(), db = new Date(b.date).getTime();
      return sortDir === "asc" ? da - db : db - da;
    });

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  if (!data) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  const participants = data.participants;
  const settlements = calcSettlements(participants, data.expenses);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seattle Trip 🏔️⛅☀️</h1>
            <p className="text-sm text-gray-500">May–Jun 2026</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={() => setShowInvite(true)} className="px-3 py-2 rounded-lg border bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                People
              </button>
            )}
            {!hasRole && (
              <button onClick={bootstrap} disabled={bootstrapping} className="px-3 py-2 rounded-lg border bg-amber-50 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50">
                {bootstrapping ? "Setting up..." : "Set up as admin"}
              </button>
            )}
            <button onClick={() => setShowModal(true)} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
              + Add
            </button>
            <button onClick={() => signOut({ redirectUrl: "/" })} className="px-3 py-2 rounded-lg border bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              Sign out
            </button>
          </div>
        </div>

        {/* Settle-up strip */}
        {data.expenses.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-3">
            {settlements.length === 0 ? (
              <div className="bg-white border rounded-xl px-5 py-3 text-sm font-medium text-gray-500">Everyone&apos;s square 🎉</div>
            ) : settlements.map((s, i) => (
              <div key={i} className="bg-white border rounded-xl px-5 py-3">
                <span className="text-sm text-gray-500">{s.from} owes {s.to} </span>
                <span className="text-lg font-bold text-gray-900">${s.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Participants */}
        <div className="mb-5 flex items-center gap-4">
          <ParticipantsEditor
            participants={participants}
            onChange={(p) => setData((prev) => prev ? { ...prev, participants: p } : prev)}
          />
          <button
            onClick={() => { localStorage.removeItem("onboarding_complete"); setShowOnboarding(true); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            How to use
          </button>
        </div>

        {data.expenses.length === 0 && (
          <div className="bg-white rounded-xl border p-8 text-center">
            <p className="text-gray-500 mb-4">No expenses yet.</p>
            <button onClick={handleSeed} disabled={seeding} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {seeding ? "Loading..." : "Load Phil's 50 CC transactions"}
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
                placeholder="Search..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">{filtered.length} · ${total.toFixed(2)}</span>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 w-28 cursor-pointer select-none hover:text-gray-900" onClick={() => toggleSort("date")}>
                        Date{sortIcon("date")}
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 w-24">Paid by</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600 w-24 cursor-pointer select-none hover:text-gray-900" onClick={() => toggleSort("amount")}>
                        Total{sortIcon("amount")}
                      </th>
                      {participants.map((name) => (
                        <th key={name} className={`text-center px-4 py-3 font-semibold w-24 ${(PERSON_COLORS[name] ?? defaultStyle).header}`}>
                          {name}
                        </th>
                      ))}
                      <th className="px-3 py-3 w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((expense) => {
                      const share = expense.amount / expense.split.length;
                      const payer = expense.paidBy ?? participants[0];
                      const payerStyle = (PERSON_COLORS[payer] ?? defaultStyle).paid;
                      return (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{expense.date}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{expense.description}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => cyclePaidBy(expense, participants)}
                              title="Click to change who paid"
                              className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${payerStyle}`}
                            >
                              {payer}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">${expense.amount.toFixed(2)}</td>
                          {participants.map((name) => {
                            const inSplit = expense.split.includes(name);
                            const style = PERSON_COLORS[name] ?? defaultStyle;
                            return (
                              <td
                                key={name}
                                className={`px-4 py-3 text-center whitespace-nowrap cursor-pointer select-none transition-colors ${inSplit ? style.activeCell : ""}`}
                                onClick={() => togglePerson(expense, name)}
                              >
                                <label className="flex flex-col items-center gap-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={inSplit}
                                    onChange={() => togglePerson(expense, name)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-4 h-4 cursor-pointer"
                                  />
                                  {inSplit && (
                                    <span className={`text-xs ${style.active}`}>${share.toFixed(2)}</span>
                                  )}
                                </label>
                              </td>
                            );
                          })}
                          <td className="px-3 py-3 text-center">
                            <button onClick={() => deleteExpense(expense.id)} className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none">×</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <AddExpenseModal participants={participants} onAdd={handleAdd} onClose={() => setShowModal(false)} />
      )}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
      {showOnboarding && (
        <OnboardingModal
          name={user?.firstName ?? undefined}
          onDone={completeOnboarding}
        />
      )}
    </main>
  );
}
