"use client";

import { useState, useEffect, useCallback } from "react";
import {
  QrCode,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Download,
  ExternalLink,
  Search,
  Loader2,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import QRCode from "qrcode";

const BASE_URL = "https://chatmansecurityandfire.com";

interface QrCodeRecord {
  id: string;
  slug: string;
  destination_url: string;
  label: string;
  qr_type: string;
  scan_count: number;
  last_scanned_at: string | null;
  is_active: boolean;
  created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  marketing: "#EA580C",
  portal: "#3B82F6",
  proposal: "#22C55E",
  custom: "#8B5CF6",
};

export default function QrCodesPage() {
  const [qrCodes, setQrCodes] = useState<QrCodeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<QrCodeRecord | null>(null);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    slug: "",
    label: "",
    destination_url: "",
    qr_type: "marketing",
  });

  const fetchQrCodes = useCallback(async () => {
    try {
      const res = await fetch("/api/qr-codes");
      if (!res.ok) return;
      const { data } = await res.json();
      setQrCodes(data || []);
      generateQrImages(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchQrCodes(); }, [fetchQrCodes]);

  async function generateQrImages(codes: QrCodeRecord[]) {
    const images: Record<string, string> = {};
    for (const code of codes) {
      try {
        images[code.id] = await QRCode.toDataURL(`${BASE_URL}/qr/${code.slug}`, {
          width: 200,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
        });
      } catch { /* skip */ }
    }
    setQrImages(images);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch("/api/qr-codes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        if (!res.ok) { const d = await res.json(); alert(d.error); return; }
      } else {
        const res = await fetch("/api/qr-codes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) { const d = await res.json(); alert(d.error); return; }
      }
      setShowForm(false);
      setEditing(null);
      setForm({ slug: "", label: "", destination_url: "", qr_type: "marketing" });
      fetchQrCodes();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this QR code? Any printed copies will stop working.")) return;
    await fetch(`/api/qr-codes?id=${id}`, { method: "DELETE" });
    fetchQrCodes();
  }

  async function handleToggleActive(code: QrCodeRecord) {
    await fetch("/api/qr-codes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: code.id, is_active: !code.is_active, label: code.label, destination_url: code.destination_url, qr_type: code.qr_type }),
    });
    fetchQrCodes();
  }

  async function downloadQR(code: QrCodeRecord) {
    const dataUrl = await QRCode.toDataURL(`${BASE_URL}/qr/${code.slug}`, {
      width: 1024,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
    const link = document.createElement("a");
    link.download = `qr-${code.slug}.png`;
    link.href = dataUrl;
    link.click();
  }

  function copyUrl(code: QrCodeRecord) {
    navigator.clipboard.writeText(`${BASE_URL}/qr/${code.slug}`);
    setCopied(code.id);
    setTimeout(() => setCopied(null), 2000);
  }

  function openEdit(code: QrCodeRecord) {
    setEditing(code);
    setForm({
      slug: code.slug,
      label: code.label,
      destination_url: code.destination_url,
      qr_type: code.qr_type,
    });
    setShowForm(true);
  }

  const filtered = qrCodes
    .filter(c => typeFilter === "all" || c.qr_type === typeFilter)
    .filter(c => !search || c.label.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search.toLowerCase()));

  const types = ["all", "marketing", "portal", "proposal", "custom"];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <QrCode className="w-7 h-7 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">QR Codes</h1>
          <span className="bg-gray-100 text-gray-600 text-sm px-2 py-0.5 rounded-full">{qrCodes.length}</span>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ slug: "", label: "", destination_url: "", qr_type: "marketing" }); setShowForm(true); }}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New QR Code
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition ${
                typeFilter === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <QrCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No QR codes found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(code => (
            <div key={code.id} className={`bg-white border rounded-xl p-4 flex items-center gap-5 ${!code.is_active ? "opacity-50" : ""}`}>
              {/* QR Preview */}
              <div className="flex-shrink-0 w-20 h-20 bg-white rounded-lg border flex items-center justify-center">
                {qrImages[code.id] ? (
                  <img src={qrImages[code.id]} alt={code.label} className="w-16 h-16" />
                ) : (
                  <QrCode className="w-8 h-8 text-gray-300" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{code.label}</h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
                    style={{ background: (TYPE_COLORS[code.qr_type] || "#666") + "18", color: TYPE_COLORS[code.qr_type] || "#666" }}
                  >
                    {code.qr_type}
                  </span>
                  {!code.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">Inactive</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-mono mb-1">/qr/{code.slug}</p>
                <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> {code.destination_url}
                </p>
              </div>

              {/* Stats */}
              <div className="text-center px-4">
                <div className="text-2xl font-bold text-gray-900">{code.scan_count}</div>
                <div className="text-xs text-gray-400">scans</div>
                {code.last_scanned_at && (
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(code.last_scanned_at).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button onClick={() => copyUrl(code)} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Copy URL">
                  {copied === code.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
                <button onClick={() => downloadQR(code)} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Download PNG">
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={() => handleToggleActive(code)} className="p-2 hover:bg-gray-100 rounded-lg transition" title={code.is_active ? "Deactivate" : "Activate"}>
                  {code.is_active ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-red-400" />}
                </button>
                <button onClick={() => openEdit(code)} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Edit">
                  <Edit3 className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={() => handleDelete(code.id)} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Delete">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? "Edit QR Code" : "New QR Code"}</h2>

            <div className="space-y-4">
              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">/qr/</span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                      placeholder="my-code"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={e => setForm({ ...form, label: e.target.value })}
                  placeholder="Business Card QR"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination URL</label>
                <input
                  type="url"
                  value={form.destination_url}
                  onChange={e => setForm({ ...form, destination_url: e.target.value })}
                  placeholder="https://chatmansecurityandfire.com/start"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.qr_type}
                  onChange={e => setForm({ ...form, qr_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="marketing">Marketing</option>
                  <option value="portal">Portal</option>
                  <option value="proposal">Proposal</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.label || !form.destination_url || (!editing && !form.slug)}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
