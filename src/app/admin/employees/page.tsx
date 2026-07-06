"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, User, Mail, Phone, Loader2, X, Pencil } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const ROLES = ["admin", "manager", "technician", "inspector", "dispatcher"];

const roleColor: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  technician: "bg-orange-100 text-orange-700",
  inspector: "bg-green-100 text-green-700",
  dispatcher: "bg-gray-100 text-gray-600",
};

const blank = { full_name: "", email: "", phone: "", role: "technician" };

export default function EmployeesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [showInvite, setShowInvite] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/teams");
      const data = await res.json();
      // teams API returns teams with members; flatten to unique profiles
      if (data.success) {
        const seen = new Set<string>();
        const all: Profile[] = [];
        for (const team of data.data || []) {
          for (const m of team.members || []) {
            if (!seen.has(m.user_id)) {
              seen.add(m.user_id);
              all.push({
                id: m.user_id,
                full_name: m.user?.full_name || "—",
                email: m.user?.email || "—",
                phone: m.user?.phone || "",
                role: m.user?.role || "technician",
                is_active: m.user?.is_active !== false,
                created_at: m.user?.created_at || "",
              });
            }
          }
        }
        setProfiles(all);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const filtered = roleFilter === "all" ? profiles : profiles.filter(p => p.role === roleFilter);

  const handleInvite = async () => {
    if (!form.email || !form.full_name) { setError("Name and email are required."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, name: form.full_name, role: form.role }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to send invite"); return; }
      setInviteSent(true);
      setTimeout(() => { setShowInvite(false); setInviteSent(false); setForm({ ...blank }); fetchProfiles(); }, 2000);
    } catch { setError("Failed to send invite."); }
    finally { setSaving(false); }
  };

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} team member{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setForm({ ...blank }); setError(""); setInviteSent(false); setShowInvite(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" /> Invite Employee
        </button>
      </div>

      {/* Role filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", ...ROLES].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${roleFilter === r ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {r}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <User className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No employees yet. <button onClick={() => setShowInvite(true)} className="text-orange-600 font-medium hover:underline">Invite one</button></p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Name", "Email", "Phone", "Role", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-600 font-semibold text-sm">{p.full_name?.[0]?.toUpperCase() || "?"}</span>
                      </div>
                      <span className="font-medium text-gray-900">{p.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <a href={`mailto:${p.email}`} className="flex items-center gap-1.5 hover:text-orange-600">
                      <Mail className="w-3.5 h-3.5" />{p.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {p.phone ? <a href={`tel:${p.phone}`} className="flex items-center gap-1.5 hover:text-orange-600"><Phone className="w-3.5 h-3.5" />{p.phone}</a> : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColor[p.role] || "bg-gray-100 text-gray-600"}`}>{p.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setEditing(p); setForm({ full_name: p.full_name, email: p.email, phone: p.phone || "", role: p.role }); setError(""); setShowEdit(true); }}
                      className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Invite Employee</h2>
              <button onClick={() => setShowInvite(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}
              {inviteSent && <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium">Invite sent!</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input value={form.full_name} onChange={f("full_name")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={f("email")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input value={form.phone} onChange={f("phone")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={form.role} onChange={f("role")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowInvite(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleInvite} disabled={saving || inviteSent} className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit role modal */}
      {showEdit && editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Edit {editing.full_name}</h2>
              <button onClick={() => setShowEdit(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={form.role} onChange={f("role")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <p className="text-xs text-gray-500">To change name or email, use the Team Management page.</p>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowEdit(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => setShowEdit(false)} className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-medium">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
