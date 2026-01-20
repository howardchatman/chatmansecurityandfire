"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Package, AlertTriangle, Search } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  manufacturer: string;
  unitCost: number;
  unitPrice: number;
  stock: number;
  minStock: number;
  status: string;
}

// Mock inventory data
const mockInventory: InventoryItem[] = [
  {
    id: "1",
    sku: "PNL-DSC-001",
    name: "DSC PowerSeries Neo Panel",
    category: "Panels",
    manufacturer: "DSC",
    unitCost: 185.00,
    unitPrice: 299.00,
    stock: 12,
    minStock: 5,
    status: "active",
  },
  {
    id: "2",
    sku: "PNL-HON-001",
    name: "Honeywell Vista 21ip",
    category: "Panels",
    manufacturer: "Honeywell",
    unitCost: 210.00,
    unitPrice: 349.00,
    stock: 8,
    minStock: 5,
    status: "active",
  },
  {
    id: "3",
    sku: "SEN-MOT-001",
    name: "PIR Motion Sensor",
    category: "Sensors",
    manufacturer: "DSC",
    unitCost: 18.00,
    unitPrice: 45.00,
    stock: 45,
    minStock: 20,
    status: "active",
  },
  {
    id: "4",
    sku: "SEN-DOO-001",
    name: "Door/Window Contact Sensor",
    category: "Sensors",
    manufacturer: "Honeywell",
    unitCost: 8.00,
    unitPrice: 25.00,
    stock: 78,
    minStock: 30,
    status: "active",
  },
  {
    id: "5",
    sku: "SEN-GLB-001",
    name: "Glass Break Detector",
    category: "Sensors",
    manufacturer: "DSC",
    unitCost: 32.00,
    unitPrice: 65.00,
    stock: 15,
    minStock: 10,
    status: "active",
  },
  {
    id: "6",
    sku: "CAM-OUT-001",
    name: "4K Outdoor Bullet Camera",
    category: "Cameras",
    manufacturer: "Hikvision",
    unitCost: 89.00,
    unitPrice: 199.00,
    stock: 22,
    minStock: 10,
    status: "active",
  },
  {
    id: "7",
    sku: "CAM-DOM-001",
    name: "Indoor Dome Camera",
    category: "Cameras",
    manufacturer: "Hikvision",
    unitCost: 65.00,
    unitPrice: 149.00,
    stock: 18,
    minStock: 10,
    status: "active",
  },
  {
    id: "8",
    sku: "CAM-NVR-001",
    name: "8-Channel NVR",
    category: "Cameras",
    manufacturer: "Hikvision",
    unitCost: 195.00,
    unitPrice: 399.00,
    stock: 6,
    minStock: 5,
    status: "active",
  },
  {
    id: "9",
    sku: "FIR-SMK-001",
    name: "Photoelectric Smoke Detector",
    category: "Fire",
    manufacturer: "System Sensor",
    unitCost: 24.00,
    unitPrice: 55.00,
    stock: 35,
    minStock: 15,
    status: "active",
  },
  {
    id: "10",
    sku: "FIR-HEA-001",
    name: "Heat Detector",
    category: "Fire",
    manufacturer: "System Sensor",
    unitCost: 28.00,
    unitPrice: 60.00,
    stock: 20,
    minStock: 10,
    status: "active",
  },
  {
    id: "11",
    sku: "FIR-COD-001",
    name: "CO Detector",
    category: "Fire",
    manufacturer: "System Sensor",
    unitCost: 35.00,
    unitPrice: 75.00,
    stock: 8,
    minStock: 10,
    status: "active",
  },
  {
    id: "12",
    sku: "KEY-STD-001",
    name: "Standard Keypad",
    category: "Keypads",
    manufacturer: "DSC",
    unitCost: 45.00,
    unitPrice: 89.00,
    stock: 14,
    minStock: 8,
    status: "active",
  },
  {
    id: "13",
    sku: "KEY-TCH-001",
    name: "Touchscreen Keypad",
    category: "Keypads",
    manufacturer: "DSC",
    unitCost: 125.00,
    unitPrice: 249.00,
    stock: 4,
    minStock: 5,
    status: "active",
  },
  {
    id: "14",
    sku: "SIR-OUT-001",
    name: "Outdoor Siren",
    category: "Sirens",
    manufacturer: "Honeywell",
    unitCost: 42.00,
    unitPrice: 85.00,
    stock: 12,
    minStock: 8,
    status: "active",
  },
  {
    id: "15",
    sku: "PWR-BAT-001",
    name: "Backup Battery 12V 7Ah",
    category: "Power",
    manufacturer: "Generic",
    unitCost: 18.00,
    unitPrice: 35.00,
    stock: 25,
    minStock: 15,
    status: "active",
  },
  {
    id: "16",
    sku: "PWR-TRN-001",
    name: "16.5V Transformer",
    category: "Power",
    manufacturer: "Honeywell",
    unitCost: 12.00,
    unitPrice: 28.00,
    stock: 30,
    minStock: 15,
    status: "active",
  },
  {
    id: "17",
    sku: "WIR-22G-001",
    name: "22/4 Alarm Wire (500ft)",
    category: "Wire & Cable",
    manufacturer: "Generic",
    unitCost: 45.00,
    unitPrice: 89.00,
    stock: 18,
    minStock: 10,
    status: "active",
  },
  {
    id: "18",
    sku: "WIR-CAT-001",
    name: "CAT6 Cable (1000ft)",
    category: "Wire & Cable",
    manufacturer: "Generic",
    unitCost: 85.00,
    unitPrice: 165.00,
    stock: 8,
    minStock: 5,
    status: "active",
  },
];

const categoryFilters = [
  { label: "All", value: "all" },
  { label: "Panels", value: "Panels" },
  { label: "Sensors", value: "Sensors" },
  { label: "Cameras", value: "Cameras" },
  { label: "Fire", value: "Fire" },
  { label: "Keypads", value: "Keypads" },
  { label: "Sirens", value: "Sirens" },
  { label: "Power", value: "Power" },
  { label: "Wire & Cable", value: "Wire & Cable" },
];

export default function InventoryPage() {
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredInventory =
    categoryFilter === "all"
      ? mockInventory
      : mockInventory.filter((item) => item.category === categoryFilter);

  const lowStockItems = mockInventory.filter((item) => item.stock <= item.minStock);
  const totalValue = mockInventory.reduce((sum, item) => sum + item.unitCost * item.stock, 0);

  const columns = [
    {
      key: "sku",
      label: "SKU",
      sortable: true,
      render: (item: InventoryItem) => (
        <span className="font-mono text-sm text-gray-600">{item.sku}</span>
      ),
    },
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (item: InventoryItem) => (
        <div>
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-500">{item.manufacturer}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (item: InventoryItem) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
          {item.category}
        </span>
      ),
    },
    {
      key: "unitCost",
      label: "Cost",
      sortable: true,
      render: (item: InventoryItem) => (
        <span className="text-gray-600">${item.unitCost.toFixed(2)}</span>
      ),
    },
    {
      key: "unitPrice",
      label: "Price",
      sortable: true,
      render: (item: InventoryItem) => (
        <span className="font-medium text-gray-900">${item.unitPrice.toFixed(2)}</span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
      render: (item: InventoryItem) => {
        const isLow = item.stock <= item.minStock;
        return (
          <div className="flex items-center gap-2">
            <span className={isLow ? "text-red-600 font-medium" : "text-gray-900"}>
              {item.stock}
            </span>
            {isLow && <AlertTriangle className="w-4 h-4 text-red-500" />}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (item: InventoryItem) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">
            Manage parts catalog and stock levels
          </p>
        </div>
        <Link
          href="/admin/inventory/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-2xl font-bold text-gray-900">{mockInventory.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-2xl font-bold text-blue-600">
            {new Set(mockInventory.map((i) => i.category)).size}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Inventory Value</p>
          <p className="text-2xl font-bold text-green-600">
            ${totalValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Low Stock Alert</h3>
              <p className="text-sm text-red-600 mt-1">
                {lowStockItems.length} items are at or below minimum stock levels:{" "}
                {lowStockItems.map((i) => i.name).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categoryFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setCategoryFilter(filter.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              categoryFilter === filter.value
                ? "bg-red-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredInventory}
        searchPlaceholder="Search inventory..."
        onRowClick={(item) => console.log("View item:", item.id)}
        actions={(item) => (
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      />
    </div>
  );
}
