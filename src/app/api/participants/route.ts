import { NextResponse } from "next/server";
import { readExpenses, writeExpenses } from "@/lib/blob";
import { requireAdmin } from "@/lib/authz";

export async function PATCH(req: Request) {
  // Replacing the participant list rewrites expense splits — admins only.
  const ctx = await requireAdmin();
  if (ctx instanceof NextResponse) return ctx;

  const { participants } = await req.json();
  if (!Array.isArray(participants) || participants.length === 0) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  const data = await readExpenses();
  data.participants = participants;
  await writeExpenses(data);
  return NextResponse.json({ participants });
}
