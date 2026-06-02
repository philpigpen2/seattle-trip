import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = await fetch("https://api.clerk.com/v1/instance", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ social_login_connections: { oauth_google: { enabled: false } } }),
  });
  return NextResponse.json({ status: res.status, ok: res.ok });
}
