import { auth, currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

const CLERK_SECRET = process.env.CLERK_SECRET_KEY!;
const clerkHeaders = {
  Authorization: `Bearer ${CLERK_SECRET}`,
  "Content-Type": "application/json",
};

// Admin-only. Open in your browser (you're logged in as admin) to mint a
// fresh, long-lived Clerk signup link for someone and copy it to send directly.
// Usage: /api/invite-link?email=gaz@example.com&role=member
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return html("You need to sign in as an admin first, then reload this page.");

  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  if (role !== "admin") return html("Admins only.");

  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  const inviteRole = url.searchParams.get("role") ?? "member";
  if (!email) return html("Add ?email=their@email.com to the URL.");

  // Revoke any existing pending invite for this email so we don't hit a duplicate.
  const existingRes = await fetch(
    `https://api.clerk.com/v1/invitations?status=pending&limit=100`,
    { headers: clerkHeaders },
  );
  if (existingRes.ok) {
    const existing = (await existingRes.json()) as { id: string; email_address: string }[];
    await Promise.all(
      existing
        .filter((i) => i.email_address.toLowerCase() === email.toLowerCase())
        .map((i) =>
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
      public_metadata: { role: inviteRole },
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://philiplaney.com"}/sign-up`,
      expires_in_days: 365, // long-lived so the link doesn't disappear
      notify: false, // we're sharing the link manually, skip Clerk's email
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return html(`Couldn't create invite: ${data.errors?.[0]?.message ?? "unknown error"}`);
  }

  const link = data.url as string;
  return html(
    `Signup link for <b>${escapeHtml(email)}</b> (${escapeHtml(inviteRole)}), valid for 1 year:` +
      `<div style="margin:16px 0;padding:14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;word-break:break-all;"><a href="${link}">${link}</a></div>` +
      `<button onclick="navigator.clipboard.writeText('${link}');this.textContent='Copied ✓'" ` +
      `style="padding:10px 18px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer;">Copy link</button>` +
      `<p style="color:#6b7280;font-size:13px;margin-top:16px;">Send this link to them. When they open it, they go straight to signup with this email pre-approved.</p>`,
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function html(body: string) {
  return new Response(
    `<!doctype html><html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:60px auto;padding:0 20px;color:#111;line-height:1.5;">${body}</body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}
