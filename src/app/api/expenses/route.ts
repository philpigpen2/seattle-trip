import { NextResponse } from "next/server";
import { readExpenses, writeExpenses } from "@/lib/blob";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await readExpenses();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = await readExpenses();

  const expense = {
    id: uuidv4(),
    date: body.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    description: body.description,
    amount: parseFloat(body.amount),
    split: body.split || ["Phil"],
    paidBy: body.paidBy || body.split?.[0] || "Phil",
    receiptUrl: body.receiptUrl || null,
    notes: body.notes || "",
    addedBy: body.addedBy || "",
  };

  data.expenses.push(expense);
  await writeExpenses(data);
  return NextResponse.json(expense);
}
