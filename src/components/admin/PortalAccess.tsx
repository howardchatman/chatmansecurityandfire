"use client";

import { useEffect, useState } from "react";
import { KeyRound, Loader2, CheckCircle2, Clock, Send, Copy } from "lucide-react";

// Whether this customer can sign in to the customer portal, and the one
// button that gives them access. The login is created against the customer's
// email and tied to this customer record, then they get an email with a link
// to choose their own password — nobody on our side handles a password.

interface Login {
  id: string;
  email: string;
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
  const [login, setLogin] = useState<Login | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "forbidden">("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/invite?role=customer");
      if (res.status === 401 || res.status === 403) {
        setState("forbidden");
        return;
      }
      const json = await res.json();
      const rows: Login[] = json.data || [];
      const mine =
        rows.find((r) => r.customer_id === customerId) ||
        rows.find((r) => r.email?.toLowerCase() === email?.toLowerCase()) ||
        null;
      setLogin(mine);
      setState("ready");
    } catch {
      setState("ready");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, email]);

  const invite = async () => {
    if (!email) {
      setMessage({ ok: false, text: "Add an email address for this customer first." });
      return;
    }
    setBusy(true);
    setMessage(null);
    setInviteUrl(null);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, full_name: name || email, role: "customer", customer_id: customerId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Couldn't create the login");
      setMessage({ ok: json.emailSent !== false, text: json.message || `Invite emailed to ${email}.` });
      if (json.inviteUrl) setInviteUrl(json.inviteUrl);
      await load();
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Couldn't create the login" });
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!login) return;
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

  const accepted = !!login?.invite_accepted_at;
  const pending = !!login && !accepted && !!login.invite_expires_at;

  return (
    <div className="pt-4 mt-4 border-t border-gray-100">
      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
        <KeyRound className="w-3.5 h-3.5" />
        Customer portal
      </p>

      {state === "loading" ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
      ) : !login ? (
        <>
          <p className="text-sm text-gray-600 mb-3">
            No login yet. Give them access to follow quotes, project stages, inspections and invoices.
          </p>
          <button
            onClick={invite}
            disabled={busy}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Give portal access
          </button>
        </>
      ) : !login.is_active ? (
        <p className="text-sm text-gray-600">Login is deactivated. Reactivate it on the Team page.</p>
      ) : pending ? (
        <>
          <p className="text-sm text-amber-700 flex items-center gap-1.5 mb-3">
            <Clock className="w-4 h-4" />
            Invited — hasn&apos;t set a password yet
          </p>
          <button
            onClick={resend}
            disabled={busy}
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Resend invite
          </button>
        </>
      ) : (
        <p className="text-sm text-green-700 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          Has portal access{login.email.toLowerCase() !== email.toLowerCase() ? ` (${login.email})` : ""}
        </p>
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
