import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CLERK_SECRET = process.env.CLERK_SECRET_KEY!;
const clerkHeaders = { Authorization: `Bearer ${CLERK_SECRET}` };

export async function GET() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") return NextResponse.json({ error: "Admins only" }, { status: 403 });

  const [usersRes, invitesRes] = await Promise.all([
    fetch("https://api.clerk.com/v1/users?limit=100", { headers: clerkHeaders }),
    fetch("https://api.clerk.com/v1/invitations?status=pending&limit=100", { headers: clerkHeaders }),
  ]);

  const users = await usersRes.json();
  const invitations = await invitesRes.json();

  return NextResponse.json({
    users: users.map((u: { id: string; email_addresses: { email_address: string }[]; first_name: string; last_name: string; public_metadata: { role?: string } }) => ({
      id: u.id,
      email: u.email_addresses[0]?.email_address,
      name: [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email_addresses[0]?.email_address,
      role: u.public_metadata?.role ?? "member",
    })),
    pending: invitations.map((i: { id: string; email_address: string; public_metadata: { role?: string } }) => ({
      id: i.id,
      email: i.email_address,
      role: i.public_metadata?.role ?? "member",
    })),
  });
}
