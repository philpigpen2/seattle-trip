import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { readExpenses, writeExpenses } from "@/lib/blob";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

// Map the logged-in Clerk user to one of the trip participants (Phil/Matt/Gaz).
// Falls back to their full name or email so nothing is silently lost.
function resolveAddedBy(
  user: Awaited<ReturnType<typeof currentUser>>,
  participants: string[],
): string {
  if (!user) return "";
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const candidates = [user.firstName, fullName].filter(Boolean) as string[];
  for (const c of candidates) {
    const match = participants.find((p) => p.toLowerCase() === c.toLowerCase());
    if (match) return match;
  }
  return fullName || user.emailAddresses[0]?.emailAddress || "";
}

export async function GET() {
  const data = await readExpenses();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = await readExpenses();

  const user = await currentUser();
  const addedBy = resolveAddedBy(user, data.participants);

  const expense = {
    id: uuidv4(),
    date: body.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    description: body.description,
    amount: parseFloat(body.amount),
    split: body.split || ["Phil"],
    paidBy: body.paidBy || body.split?.[0] || "Phil",
    receiptUrl: body.receiptUrl || null,
    notes: body.notes || "",
    addedBy,
  };

  data.expenses.push(expense);
  await writeExpenses(data);
  return NextResponse.json(expense);
}
