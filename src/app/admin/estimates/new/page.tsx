"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Search,
  Package,
  User,
  FileText,
  Calculator,
  Send,
  Save,
} from "lucide-react";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
}

interface LineItem {
  id: string;
  itemId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: "equipment" | "labor" | "other";
}

// Mock inventory for selection
const inventoryItems: InventoryItem[] = [
  { id: "1", sku: "PNL-DSC-001", name: "DSC PowerSeries Neo Panel", category: "Panels", unitPrice: 299.00 },
  { id: "2", sku: "PNL-HON-001", name: "Honeywell Vista 21ip", category: "Panels", unitPrice: 349.00 },
  { id: "3", sku: "SEN-MOT-001", name: "PIR Motion Sensor", category: "Sensors", unitPrice: 45.00 },
  { id: "4", sku: "SEN-DOO-001", name: "Door/Window Contact Sensor", category: "Sensors", unitPrice: 25.00 },
  { id: "5", sku: "SEN-GLB-001", name: "Glass Break Detector", category: "Sensors", unitPrice: 65.00 },
  { id: "6", sku: "CAM-OUT-001", name: "4K Outdoor Bullet Camera", category: "Cameras", unitPrice: 199.00 },
  { id: "7", sku: "CAM-DOM-001", name: "Indoor Dome Camera", category: "Cameras", unitPrice: 149.00 },
  { id: "8", sku: "CAM-NVR-001", name: "8-Channel NVR", category: "Cameras", unitPrice: 399.00 },
  { id: "9", sku: "FIR-SMK-001", name: "Photoelectric Smoke Detector", category: "Fire", unitPrice: 55.00 },
  { id: "10", sku: "FIR-HEA-001", name: "Heat Detector", category: "Fire", unitPrice: 60.00 },
  { id: "11", sku: "FIR-COD-001", name: "CO Detector", category: "Fire", unitPrice: 75.00 },
  { id: "12", sku: "KEY-STD-001", name: "Standard Keypad", category: "Keypads", unitPrice: 89.00 },
  { id: "13", sku: "KEY-TCH-001", name: "Touchscreen Keypad", category: "Keypads", unitPrice: 249.00 },
  { id: "14", sku: "SIR-OUT-001", name: "Outdoor Siren", category: "Sirens", unitPrice: 85.00 },
  { id: "15", sku: "PWR-BAT-001", name: "Backup Battery 12V 7Ah", category: "Power", unitPrice: 35.00 },
  { id: "16", sku: "PWR-TRN-001", name: "16.5V Transformer", category: "Power", unitPrice: 28.00 },
  { id: "17", sku: "WIR-22G-001", name: "22/4 Alarm Wire (500ft)", category: "Wire & Cable", unitPrice: 89.00 },
  { id: "18", sku: "WIR-CAT-001", name: "CAT6 Cable (1000ft)", category: "Wire & Cable", unitPrice: 165.00 },
];

const laborRates = [
  { id: "labor-1", name: "Installation Labor (per hour)", rate: 85.00 },
  { id: "labor-2", name: "Programming/Setup (per hour)", rate: 95.00 },
  { id: "labor-3", name: "Emergency Service (per hour)", rate: 125.00 },
];

const categories = ["All", "Panels", "Sensors", "Cameras", "Fire", "Keypads", "Sirens", "Power", "Wire & Cable"];

export default function NewEstimatePage() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [taxRate, setTaxRate] = useState(8.25);
  const [discount, setDiscount] = useState(0);

  // Filter inventory items
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add item to estimate
  const addItem = (item: InventoryItem) => {
    const existingItem = lineItems.find((li) => li.itemId === item.id);
    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: LineItem = {
        id: `line-${Date.now()}`,
        itemId: item.id,
        name: item.name,
        sku: item.sku,
        quantity: 1,
        unitPrice: item.unitPrice,
        total: item.unitPrice,
        type: "equipment",
      };
      setLineItems([...lineItems, newItem]);
    }
  };

  // Add labor line
  const addLabor = (labor: { id: string; name: string; rate: number }, hours: number = 1) => {
    const newItem: LineItem = {
      id: `line-${Date.now()}`,
      itemId: labor.id,
      name: labor.name,
      sku: "",
      quantity: hours,
      unitPrice: labor.rate,
      total: labor.rate * hours,
      type: "labor",
    };
    setLineItems([...lineItems, newItem]);
  };

  // Update quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setLineItems(
      lineItems.map((item) =>
        item.id === id
          ? { ...item, quantity, total: item.unitPrice * quantity }
          : item
      )
    );
  };

  // Remove item
  const removeItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = subtotal * (discount / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (taxRate / 100);
  const total = taxableAmount + taxAmount;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/estimates"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Estimate</h1>
            <p className="text-gray-500 mt-1">Create a new job estimate</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
            <Send className="w-4 h-4" />
            Send to Customer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Customer Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="John Smith or Company Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Project Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Residential Security System Installation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Describe the scope of work..."
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Equipment & Labor</h2>
              </div>
              <button
                onClick={() => setShowItemPicker(!showItemPicker)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {/* Item Picker */}
            {showItemPicker && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Search parts..."
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Equipment List */}
                <div className="max-h-48 overflow-y-auto space-y-1 mb-4">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addItem(item)}
                      className="w-full flex items-center justify-between p-2 hover:bg-white rounded-lg text-left transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.sku}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        ${item.unitPrice.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Labor Options */}
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Labor</p>
                  <div className="space-y-1">
                    {laborRates.map((labor) => (
                      <button
                        key={labor.id}
                        onClick={() => addLabor(labor)}
                        className="w-full flex items-center justify-between p-2 hover:bg-white rounded-lg text-left transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900">{labor.name}</p>
                        <span className="text-sm font-medium text-gray-900">
                          ${labor.rate.toFixed(2)}/hr
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Line Items Table */}
            {lineItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">
                        Item
                      </th>
                      <th className="text-center py-2 text-xs font-semibold text-gray-500 uppercase w-24">
                        Qty
                      </th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase w-24">
                        Price
                      </th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase w-24">
                        Total
                      </th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.sku && (
                            <p className="text-xs text-gray-500">{item.sku}</p>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Minus className="w-4 h-4 text-gray-400" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.id, parseInt(e.target.value) || 1)
                              }
                              className="w-12 text-center border border-gray-200 rounded py-1 text-sm"
                            />
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Plus className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 text-right text-gray-600">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-medium text-gray-900">
                          ${item.total.toFixed(2)}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No items added yet</p>
                <p className="text-sm">Click &quot;Add Item&quot; to start building your estimate</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Summary */}
        <div className="space-y-6">
          {/* Totals */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Estimate Summary</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Equipment ({lineItems.filter(i => i.type === "equipment").length} items)</span>
                <span className="text-gray-900">
                  ${lineItems
                    .filter((i) => i.type === "equipment")
                    .reduce((sum, i) => sum + i.total, 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Labor</span>
                <span className="text-gray-900">
                  ${lineItems
                    .filter((i) => i.type === "labor")
                    .reduce((sum, i) => sum + i.total, 0)
                    .toFixed(2)}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Discount */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Discount</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-16 text-right border border-gray-200 rounded px-2 py-1 text-sm"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount Amount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Tax */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Tax Rate</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-16 text-right border border-gray-200 rounded px-2 py-1 text-sm"
                    step="0.01"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900">${taxAmount.toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Valid Until */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid Until
              </label>
              <input
                type="date"
                defaultValue={
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                <Send className="w-4 h-4" />
                Send Estimate
              </button>
              <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                <Save className="w-4 h-4" />
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
