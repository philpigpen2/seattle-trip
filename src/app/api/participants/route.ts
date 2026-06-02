import { NextResponse } from "next/server";
import { readExpenses, writeExpenses } from "@/lib/blob";

export async function PATCH(req: Request) {
  const { participants } = await req.json();
  if (!Array.isArray(participants) || participants.length === 0) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  const data = await readExpenses();
  data.participants = participants;
  await writeExpenses(data);
  return NextResponse.json({ participants });
}
