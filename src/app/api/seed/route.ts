import { NextResponse } from "next/server";
import { writeExpenses } from "@/lib/blob";
import { SEED_EXPENSES } from "@/lib/seed";

export async function POST() {
  await writeExpenses({
    participants: ["Phil", "Matt", "Gaz"],
    expenses: SEED_EXPENSES,
  });
  return NextResponse.json({ ok: true, count: SEED_EXPENSES.length });
}
