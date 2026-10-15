"use client";

import { useEffect, useState } from "react";
import { KeyRound, Loader2, CheckCircle2, Clock, Send, Copy, UserPlus } from "lucide-react";

// Who at this customer can sign in to the customer portal, and the button(s)
// that give them access. A company can have several people (a GC's project
// manager and install manager, say): each gets their own login, tied to this
// customer record, so they all see the same projects, quotes, and updates.
// Each invitee gets an email to choose their own password; nobody on our side
// handles a password.

interface Login {
  id: string;
  email: string;
  full_name?: string | null;
  role: string;
  is_active: boolean;
  customer_id?: string | null;
  invite_accepted_at?: string | null;
  invite_expires_at?: string | null;
}

export default function PortalAccess({
  customerId,
  name,
  email,
}: {
  customerId: string;
  name: string;
  email: string;
}) {
  const [logins, setLogins] = useState<Login[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "forbidden">("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/admin/invite?role=customer");
      if (res.status === 401 || res.status === 403) {
        setState("forbidden");
        return;
      }
      const json = await res.json();
      const rows: Login[] = json.data || [];
      setLogins(
        rows.filter(
          (r) => r.customer_id === customerId || (!!email && r.email?.toLowerCase() === email.toLowerCase())
        )
      );
      setState("ready");
    } catch {
      setState("ready");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, email]);

  const invite = async (inviteEmail: string, fullName: string) => {
    if (!inviteEmail) {
      setMessage({ ok: false, text: "Enter an email address." });
      return false;
    }
    setBusy(true);
    setMessage(null);
    setInviteUrl(null);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, full_name: fullName || inviteEmail, role: "customer", customer_id: customerId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Couldn't create the login");
      setMessage({ ok: json.emailSent !== false, text: json.message || `Invite emailed to ${inviteEmail}.` });
      if (json.inviteUrl) setInviteUrl(json.inviteUrl);
      await load();
      return true;
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Couldn't create the login" });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const resend = async (login: Login) => {
    setBusy(true);
    setMessage(null);
    setInviteUrl(null);
    try {
      const res = await fetch("/api/admin/invite/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: login.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Couldn't resend the invite");
      setMessage({ ok: json.emailSent !== false, text: json.message });
      if (json.inviteUrl) setInviteUrl(json.inviteUrl);
      await load();
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Couldn't resend the invite" });
    } finally {
      setBusy(false);
    }
  };

  // Only admins manage logins; everyone else just doesn't see the panel.
  if (state === "forbidden") return null;

  return (
    <div className="pt-4 mt-4 border-t border-gray-100">
      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
        <KeyRound className="w-3.5 h-3.5" />
        Customer portal
      </p>

      {state === "loading" ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
      ) : (
        <>
          {logins.length === 0 ? (
            <p className="text-sm text-gray-600 mb-3">
              No logins yet. People you add can follow quotes, project progress, daily updates, inspections, and invoices.
            </p>
          ) : (
            <ul className="space-y-2 mb-3">
              {logins.map((l) => {
                const accepted = !!l.invite_accepted_at;
                const pending = !accepted && !!l.invite_expires_at;
                return (
                  <li key={l.id} className="text-sm">
                    <p className="text-gray-900 truncate">{l.full_name && l.full_name !== l.email ? `${l.full_name} · ` : ""}{l.email}</p>
                    {!l.is_active ? (
                      <p className="text-xs text-gray-500">Deactivated (reactivate on the Team page)</p>
                    ) : pending ? (
                      <p className="text-xs text-amber-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Invited, hasn&apos;t set a password yet ·{" "}
                        <button onClick={() => resend(l)} disabled={busy} className="text-orange-600 hover:underline">
                          Resend
                        </button>
                      </p>
                    ) : (
                      <p className="text-xs text-green-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Has access
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {logins.length === 0 && email && !adding && (
            <button
              onClick={() => invite(email, name)}
              disabled={busy}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm disabled:opacity-50 mr-2"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Invite {email}
            </button>
          )}

          {adding ? (
            <div className="space-y-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name, e.g. their project manager"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (await invite(newEmail.trim(), newName.trim())) {
                      setAdding(false);
                      setNewName("");
                      setNewEmail("");
                    }
                  }}
                  disabled={busy || !newEmail.trim()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send invite
                </button>
                <button onClick={() => setAdding(false)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:underline"
            >
              <UserPlus className="w-4 h-4" /> Add a person
            </button>
          )}
        </>
      )}

      {message && (
        <p className={`text-xs mt-3 ${message.ok ? "text-green-700" : "text-red-600"}`}>{message.text}</p>
      )}
      {inviteUrl && message && !message.ok && (
        <button
          onClick={() => navigator.clipboard?.writeText(inviteUrl)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-orange-600 hover:underline"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy invite link
        </button>
      )}
    </div>
  );
}
