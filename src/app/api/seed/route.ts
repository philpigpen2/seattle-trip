import { NextResponse } from "next/server";
import { writeExpenses } from "@/lib/blob";
import { SEED_EXPENSES } from "@/lib/seed";
import { requireAdmin } from "@/lib/authz";

export async function POST() {
  // Destructive: replaces all trip data. Admins only.
  const ctx = await requireAdmin();
  if (ctx instanceof NextResponse) return ctx;

  await writeExpenses({
    participants: ["Phil", "Matt", "Gaz"],
    expenses: SEED_EXPENSES,
  });
  return NextResponse.json({ ok: true, count: SEED_EXPENSES.length });
}
