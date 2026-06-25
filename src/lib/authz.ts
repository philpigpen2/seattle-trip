import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export type AuthCtx = {
  userId: string;
  role: string;
  user: Awaited<ReturnType<typeof currentUser>>;
};

// Returns the auth context, or a NextResponse the caller should return directly.
export async function requireUser(): Promise<AuthCtx | NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string) ?? "member";
  return { userId, role, user };
}

export async function requireAdmin(): Promise<AuthCtx | NextResponse> {
  const ctx = await requireUser();
  if (ctx instanceof NextResponse) return ctx;
  if (ctx.role !== "admin") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }
  return ctx;
}

// Map a Clerk user to one of the trip participant names (Phil/Matt/Gaz),
// falling back to their full name / email. Used for expense ownership checks.
export function resolveParticipantName(
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
