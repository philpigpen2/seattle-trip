import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CLERK_SECRET = process.env.CLERK_SECRET_KEY!;
const clerkHeaders = {
  Authorization: `Bearer ${CLERK_SECRET}`,
  "Content-Type": "application/json",
};

export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") return NextResponse.json({ error: "Admins only" }, { status: 403 });

  const { email, inviteRole } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const res = await fetch("https://api.clerk.com/v1/invitations", {
    method: "POST",
    headers: clerkHeaders,
    body: JSON.stringify({
      email_address: email,
      public_metadata: { role: inviteRole ?? "member" },
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://philiplaney.com"}/sign-up`,
      notify: true,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.errors?.[0]?.message ?? "Failed" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
