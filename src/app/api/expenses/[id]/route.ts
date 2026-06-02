import { NextResponse } from "next/server";
import { readExpenses, writeExpenses } from "@/lib/blob";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data = await readExpenses();

  const idx = data.expenses.findIndex((e) => e.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  data.expenses[idx] = { ...data.expenses[idx], ...body };
  await writeExpenses(data);
  return NextResponse.json(data.expenses[idx]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readExpenses();
  data.expenses = data.expenses.filter((e) => e.id !== id);
  await writeExpenses(data);
  return NextResponse.json({ ok: true });
}
