"use client";

import { useState, useEffect } from "react";

interface User { id: string; email: string; name: string; role: string }
interface Pending { id: string; email: string; role: string }

interface Props { onClose: () => void }

export default function InviteModal({ onClose }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(d => {
      setUsers(d.users ?? []);
      setPending(d.pending ?? []);
    });
  }, []);

  const sendInvite = async () => {
    if (!email) return;
    setSending(true);
    setError("");
    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, inviteRole: role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
    } else {
      setSent(true);
      setPending(p => [...p, { id: Date.now().toString(), email, role }]);
      setEmail("");
      setTimeout(() => setSent(false), 3000);
    }
    setSending(false);
  };

  const roleLabel = (r: string) => r === "admin" ? "Admin" : "Member";
  const roleBadge = (r: string) => r === "admin"
    ? "bg-amber-100 text-amber-700"
    : "bg-gray-100 text-gray-600";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">People</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Current members */}
          {users.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Members</p>
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge(u.role)}`}>
                      {roleLabel(u.role)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending invites */}
          {pending.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pending invites</p>
              <div className="space-y-2">
                {pending.map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{p.email}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge(p.role)}`}>
                        {roleLabel(p.role)}
                      </span>
                      <span className="text-xs text-gray-300">pending</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invite form */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Send an invite</p>
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 placeholder-gray-400"
              />
              <div className="flex gap-2">
                {(["member", "admin"] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${
                      role === r
                        ? r === "admin" ? "bg-amber-500 border-amber-500 text-white" : "bg-gray-700 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-600 hover:border-gray-500"
                    }`}
                  >
                    {r === "admin" ? "Admin" : "Member"}
                  </button>
                ))}
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                onClick={sendInvite}
                disabled={sending || !email}
                className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : sent ? "Invite sent ✓" : "Send invite"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
