"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Building2, MapPin } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  status: string;
  systems: number;
  monthlyValue: number;
}

// Mock data
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "ABC Corporation",
    email: "contact@abccorp.com",
    phone: "(555) 111-2222",
    company: "ABC Corporation",
    city: "Austin, TX",
    status: "active",
    systems: 3,
    monthlyValue: 450,
  },
  {
    id: "2",
    name: "Smith Residence",
    email: "john.smith@email.com",
    phone: "(555) 222-3333",
    company: "",
    city: "Dallas, TX",
    status: "active",
    systems: 1,
    monthlyValue: 49,
  },
  {
    id: "3",
    name: "Tech Solutions Inc",
    email: "info@techsolutions.com",
    phone: "(555) 333-4444",
    company: "Tech Solutions Inc",
    city: "Houston, TX",
    status: "active",
    systems: 5,
    monthlyValue: 850,
  },
  {
    id: "4",
    name: "Johnson Family",
    email: "sarah.johnson@email.com",
    phone: "(555) 444-5555",
    company: "",
    city: "San Antonio, TX",
    status: "inactive",
    systems: 1,
    monthlyValue: 0,
  },
  {
    id: "5",
    name: "Downtown Retail",
    email: "manager@downtownretail.com",
    phone: "(555) 555-6666",
    company: "Downtown Retail LLC",
    city: "Austin, TX",
    status: "active",
    systems: 2,
    monthlyValue: 299,
  },
  {
    id: "6",
    name: "Medical Center West",
    email: "admin@medcenterwest.com",
    phone: "(555) 666-7777",
    company: "Medical Center West",
    city: "Fort Worth, TX",
    status: "active",
    systems: 8,
    monthlyValue: 1200,
  },
];

export default function CustomersPage() {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCustomers =
    statusFilter === "all"
      ? mockCustomers
      : mockCustomers.filter((c) => c.status === statusFilter);

  const totalMonthlyRevenue = mockCustomers
    .filter((c) => c.status === "active")
    .reduce((sum, c) => sum + c.monthlyValue, 0);

  const columns = [
    {
      key: "name",
      label: "Customer",
      sortable: true,
      render: (customer: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{customer.name}</p>
            <p className="text-xs text-gray-500">{customer.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "city",
      label: "Location",
      sortable: true,
      render: (customer: Customer) => (
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          {customer.city}
        </div>
      ),
    },
    {
      key: "systems",
      label: "Systems",
      sortable: true,
      render: (customer: Customer) => (
        <span className="text-gray-900">{customer.systems}</span>
      ),
    },
    {
      key: "monthlyValue",
      label: "Monthly Value",
      sortable: true,
      render: (customer: Customer) => (
        <span className="font-medium text-gray-900">
          ${customer.monthlyValue.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (customer: Customer) => <StatusBadge status={customer.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">
            Manage your customer accounts and properties
          </p>
        </div>
        <Link
          href="/admin/customers/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900">{mockCustomers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {mockCustomers.filter((c) => c.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Systems</p>
          <p className="text-2xl font-bold text-blue-600">
            {mockCustomers.reduce((sum, c) => sum + c.systems, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Monthly Revenue</p>
          <p className="text-2xl font-bold text-red-600">
            ${totalMonthlyRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            statusFilter === "all"
              ? "bg-red-600 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("active")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            statusFilter === "active"
              ? "bg-red-600 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setStatusFilter("inactive")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            statusFilter === "inactive"
              ? "bg-red-600 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Inactive
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredCustomers}
        searchPlaceholder="Search customers..."
        onRowClick={(customer) => console.log("View customer:", customer.id)}
        actions={(customer) => (
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
