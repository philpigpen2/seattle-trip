import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CLERK_SECRET = process.env.CLERK_SECRET_KEY!;
const clerkHeaders = {
  Authorization: `Bearer ${CLERK_SECRET}`,
  "Content-Type": "application/json",
};

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Restrict who may claim admin to an allowlist of owner emails (comma-separated
  // OWNER_EMAILS env var). This closes the "first authenticated caller becomes
  // admin" land-grab race on a fresh instance.
  const ownerEmails = (process.env.OWNER_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const user = await currentUser();
  const callerEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  if (ownerEmails.length > 0 && (!callerEmail || !ownerEmails.includes(callerEmail))) {
    return NextResponse.json({ error: "Not authorized to bootstrap" }, { status: 403 });
  }

  // Check if any admin already exists
  const usersRes = await fetch("https://api.clerk.com/v1/users?limit=100", { headers: clerkHeaders });
  const users = await usersRes.json();
  const hasAdmin =
    Array.isArray(users) &&
    users.some((u: { public_metadata?: { role?: string } }) => u.public_metadata?.role === "admin");
  if (hasAdmin) return NextResponse.json({ error: "An admin already exists" }, { status: 403 });

  // Make current user admin
  await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
    method: "PATCH",
    headers: clerkHeaders,
    body: JSON.stringify({ public_metadata: { role: "admin" } }),
  });

  return NextResponse.json({ ok: true });
}
