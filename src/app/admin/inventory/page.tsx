"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Package, AlertTriangle, X, Loader2, Pencil, Trash2 } from "lucide-react";

interface InventoryItem {
  id: string;
  sku?: string;
  name: string;
  description?: string;
  category: string;
  manufacturer?: string;
  unit_cost: number;
  unit_price: number;
  stock_qty: number;
  min_stock: number;
  location?: string;
  status: string;
}

const CATEGORIES = ["panels", "sensors", "devices", "wiring", "hardware", "extinguishers", "tools", "other"];

const blank = {
  sku: "", name: "", description: "", category: "other", manufacturer: "",
  unit_cost: "", unit_price: "", stock_qty: "0", min_stock: "0", location: "", status: "active",
};

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory?category=${categoryFilter}`);
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [categoryFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditing(null); setForm({ ...blank }); setError(""); setShowModal(true); };
  const openEdit = (item: InventoryItem) => {
    setEditing(item);
    setForm({
      sku: item.sku || "", name: item.name, description: item.description || "",
      category: item.category, manufacturer: item.manufacturer || "",
      unit_cost: String(item.unit_cost), unit_price: String(item.unit_price),
      stock_qty: String(item.stock_qty), min_stock: String(item.min_stock),
      location: item.location || "", status: item.status,
    });
    setError(""); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { setError("Item name is required."); return; }
    setSaving(true); setError("");
    try {
      const url = editing ? `/api/inventory/${editing.id}` : "/api/inventory";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to save"); return; }
      setShowModal(false); fetchItems();
    } catch { setError("Failed to save item."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/inventory/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const lowStock = items.filter(i => i.stock_qty <= i.min_stock && i.status === "active").length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""}
            {lowStock > 0 && <span className="ml-2 text-orange-600 font-medium">· {lowStock} low stock</span>}
          </p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${categoryFilter === c ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No items yet. <button onClick={openCreate} className="text-orange-600 font-medium hover:underline">Add one</button></p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["SKU", "Name", "Category", "Cost", "Price", "Stock", "Location", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item.id} className={`hover:bg-gray-50 ${item.stock_qty <= item.min_stock && item.status === "active" ? "bg-orange-50/30" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.sku || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    {item.manufacturer && <div className="text-xs text-gray-500">{item.manufacturer}</div>}
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600">{item.category}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(item.unit_cost)}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{fmt(item.unit_price)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${item.stock_qty <= item.min_stock ? "text-orange-600" : "text-gray-900"}`}>{item.stock_qty}</span>
                    <span className="text-xs text-gray-400 ml-1">/ min {item.min_stock}</span>
                    {item.stock_qty <= item.min_stock && <AlertTriangle className="w-3 h-3 text-orange-500 inline ml-1" />}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{item.location || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? "Edit Item" : "Add Inventory Item"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input value={form.name} onChange={f("name")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input value={form.sku} onChange={f("sku")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={f("category")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <input value={form.manufacturer} onChange={f("manufacturer")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost ($)</label>
                  <input type="number" step="0.01" value={form.unit_cost} onChange={f("unit_cost")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
                  <input type="number" step="0.01" value={form.unit_price} onChange={f("unit_price")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty</label>
                  <input type="number" value={form.stock_qty} onChange={f("stock_qty")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
                  <input type="number" value={form.min_stock} onChange={f("min_stock")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={f("status")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location (truck, warehouse, etc.)</label>
                <input value={form.location} onChange={f("location")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={f("description")} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
