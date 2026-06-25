import { NextResponse } from "next/server";
import { readExpenses, writeExpenses } from "@/lib/blob";
import { requireUser, resolveParticipantName } from "@/lib/authz";
import type { Expense } from "@/lib/types";

export const dynamic = "force-dynamic";

// Only these fields may be edited via PATCH (never id or addedBy).
const EDITABLE: (keyof Expense)[] = [
  "date",
  "description",
  "amount",
  "split",
  "receiptUrl",
  "notes",
  "category",
  "paidBy",
];

function canModify(role: string, callerName: string, expense: Expense): boolean {
  if (role === "admin") return true;
  return !!expense.addedBy && expense.addedBy === callerName;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireUser();
  if (ctx instanceof NextResponse) return ctx;

  const { id } = await params;
  const body = await req.json();
  const data = await readExpenses();

  const idx = data.expenses.findIndex((e) => e.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const callerName = resolveParticipantName(ctx.user, data.participants);
  if (!canModify(ctx.role, callerName, data.expenses[idx])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Apply only whitelisted fields; never let id/addedBy be overwritten.
  const updated = { ...data.expenses[idx] } as Record<string, unknown>;
  for (const key of EDITABLE) {
    if (key in body) updated[key] = body[key as string];
  }
  data.expenses[idx] = updated as unknown as Expense;
  await writeExpenses(data);
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireUser();
  if (ctx instanceof NextResponse) return ctx;

  const { id } = await params;
  const data = await readExpenses();

  const expense = data.expenses.find((e) => e.id === id);
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const callerName = resolveParticipantName(ctx.user, data.participants);
  if (!canModify(ctx.role, callerName, expense)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  data.expenses = data.expenses.filter((e) => e.id !== id);
  await writeExpenses(data);
  return NextResponse.json({ ok: true });
}
