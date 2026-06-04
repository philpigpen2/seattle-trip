import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CLERK_SECRET = process.env.CLERK_SECRET_KEY!;
const clerkHeaders = {
  Authorization: `Bearer ${CLERK_SECRET}`,
  "Content-Type": "application/json",
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Use currentUser() to get fresh metadata (not stale JWT claims)
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  if (role !== "admin") return NextResponse.json({ error: "Admins only" }, { status: 403 });

  const { email, inviteRole } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Resend support: revoke any existing pending invitation for this email first,
  // otherwise Clerk rejects the new one as a duplicate and stale invites get stuck.
  const existingRes = await fetch(
    `https://api.clerk.com/v1/invitations?status=pending&limit=100`,
    { headers: clerkHeaders },
  );
  if (existingRes.ok) {
    const existing = (await existingRes.json()) as { id: string; email_address: string }[];
    const stale = existing.filter(
      (i) => i.email_address.toLowerCase() === String(email).toLowerCase(),
    );
    await Promise.all(
      stale.map((i) =>
        fetch(`https://api.clerk.com/v1/invitations/${i.id}/revoke`, {
          method: "POST",
          headers: clerkHeaders,
        }),
      ),
    );
  }

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
