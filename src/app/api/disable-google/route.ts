import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const secret = process.env.CLERK_SECRET_KEY!;

  // Get current social connections
  const listRes = await fetch("https://api.clerk.com/v1/instance", {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const instance = await listRes.json();

  // Disable Google OAuth by patching the instance social login settings
  const patchRes = await fetch("https://api.clerk.com/v1/instance", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      social_login_connections: {
        oauth_google: { enabled: false },
      },
    }),
  });

  const result = await patchRes.json();
  return NextResponse.json({ status: patchRes.status, result, instance_id: instance.id });
}
