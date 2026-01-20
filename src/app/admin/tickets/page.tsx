"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, AlertTriangle, Clock, User } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  customer: string;
  priority: string;
  status: string;
  assignedTo: string;
  createdAt: string;
  scheduledDate: string | null;
}

// Mock data
const mockTickets: Ticket[] = [
  {
    id: "1",
    ticketNumber: "TKT-2024-000123",
    title: "Fire alarm panel not responding",
    customer: "ABC Corporation",
    priority: "emergency",
    status: "in_progress",
    assignedTo: "Mike Thompson",
    createdAt: "2024-01-15",
    scheduledDate: "2024-01-15",
  },
  {
    id: "2",
    ticketNumber: "TKT-2024-000124",
    title: "Motion sensor false alarms",
    customer: "Smith Residence",
    priority: "urgent",
    status: "assigned",
    assignedTo: "Sarah Chen",
    createdAt: "2024-01-15",
    scheduledDate: "2024-01-16",
  },
  {
    id: "3",
    ticketNumber: "TKT-2024-000125",
    title: "Annual inspection due",
    customer: "Tech Solutions Inc",
    priority: "normal",
    status: "scheduled",
    assignedTo: "David Rodriguez",
    createdAt: "2024-01-14",
    scheduledDate: "2024-01-20",
  },
  {
    id: "4",
    ticketNumber: "TKT-2024-000126",
    title: "Keypad replacement request",
    customer: "Downtown Retail",
    priority: "low",
    status: "open",
    assignedTo: "",
    createdAt: "2024-01-14",
    scheduledDate: null,
  },
  {
    id: "5",
    ticketNumber: "TKT-2024-000127",
    title: "Camera installation - 4 units",
    customer: "Medical Center West",
    priority: "normal",
    status: "completed",
    assignedTo: "Mike Thompson",
    createdAt: "2024-01-12",
    scheduledDate: "2024-01-14",
  },
  {
    id: "6",
    ticketNumber: "TKT-2024-000128",
    title: "Door sensor malfunction",
    customer: "Johnson Family",
    priority: "urgent",
    status: "open",
    assignedTo: "",
    createdAt: "2024-01-15",
    scheduledDate: null,
  },
];

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Assigned", value: "assigned" },
  { label: "Scheduled", value: "scheduled" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
];

export default function TicketsPage() {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTickets =
    statusFilter === "all"
      ? mockTickets
      : mockTickets.filter((t) => t.status === statusFilter);

  const columns = [
    {
      key: "ticketNumber",
      label: "Ticket",
      sortable: true,
      render: (ticket: Ticket) => (
        <div>
          <p className="font-medium text-gray-900">{ticket.ticketNumber}</p>
          <p className="text-sm text-gray-500 truncate max-w-[200px]">
            {ticket.title}
          </p>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (ticket: Ticket) => (
        <div className="flex items-center gap-1.5">
          {(ticket.priority === "emergency" || ticket.priority === "urgent") && (
            <AlertTriangle className={`w-4 h-4 ${
              ticket.priority === "emergency" ? "text-red-500" : "text-amber-500"
            }`} />
          )}
          <StatusBadge status={ticket.priority} />
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (ticket: Ticket) => <StatusBadge status={ticket.status} />,
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      render: (ticket: Ticket) => (
        <div className="flex items-center gap-2">
          {ticket.assignedTo ? (
            <>
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-gray-500" />
              </div>
              <span className="text-gray-700">{ticket.assignedTo}</span>
            </>
          ) : (
            <span className="text-gray-400">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: "scheduledDate",
      label: "Scheduled",
      sortable: true,
      render: (ticket: Ticket) => (
        <div className="flex items-center gap-1.5 text-gray-500">
          {ticket.scheduledDate ? (
            <>
              <Clock className="w-4 h-4" />
              {new Date(ticket.scheduledDate).toLocaleDateString()}
            </>
          ) : (
            <span className="text-gray-400">Not scheduled</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Tickets</h1>
          <p className="text-gray-500 mt-1">
            Manage service requests and work orders
          </p>
        </div>
        <Link
          href="/admin/tickets/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Open</p>
          <p className="text-2xl font-bold text-blue-600">
            {mockTickets.filter((t) => t.status === "open").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-amber-600">
            {mockTickets.filter((t) => ["assigned", "scheduled", "in_progress"].includes(t.status)).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Emergency</p>
          <p className="text-2xl font-bold text-red-600">
            {mockTickets.filter((t) => t.priority === "emergency" && t.status !== "completed").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Unassigned</p>
          <p className="text-2xl font-bold text-gray-600">
            {mockTickets.filter((t) => !t.assignedTo && t.status !== "completed").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Completed Today</p>
          <p className="text-2xl font-bold text-green-600">
            {mockTickets.filter((t) => t.status === "completed").length}
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === filter.value
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
        data={filteredTickets}
        searchPlaceholder="Search tickets..."
        onRowClick={(ticket) => console.log("View ticket:", ticket.id)}
        actions={(ticket) => (
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
