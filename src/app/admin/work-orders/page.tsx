"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  User,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Calendar,
  MoreVertical,
  Phone,
  Navigation,
} from "lucide-react";

interface WorkOrder {
  id: string;
  number: string;
  type: "installation" | "repair" | "maintenance" | "inspection";
  priority: "low" | "medium" | "high" | "emergency";
  status: "pending" | "assigned" | "in_progress" | "completed" | "on_hold";
  customer: string;
  address: string;
  description: string;
  technician?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  createdAt: string;
  completedAt?: string;
  estimatedHours: number;
}

const mockWorkOrders: WorkOrder[] = [
  {
    id: "1",
    number: "WO-2024-001",
    type: "installation",
    priority: "high",
    status: "in_progress",
    customer: "ABC Corporation",
    address: "123 Business Park Dr, Suite 100",
    description: "Install 16-camera surveillance system with NVR",
    technician: "Mike Johnson",
    scheduledDate: "2024-01-19",
    scheduledTime: "09:00 AM",
    createdAt: "2024-01-15",
    estimatedHours: 8,
  },
  {
    id: "2",
    number: "WO-2024-002",
    type: "repair",
    priority: "emergency",
    status: "assigned",
    customer: "Tech Solutions Inc",
    address: "456 Tech Blvd, Floor 3",
    description: "Alarm panel not communicating - customer reports false alarms",
    technician: "Sarah Williams",
    scheduledDate: "2024-01-19",
    scheduledTime: "02:00 PM",
    createdAt: "2024-01-19",
    estimatedHours: 2,
  },
  {
    id: "3",
    number: "WO-2024-003",
    type: "maintenance",
    priority: "low",
    status: "pending",
    customer: "Retail Chain LLC",
    address: "789 Shopping Center Way",
    description: "Quarterly maintenance check - 24 cameras, access control",
    createdAt: "2024-01-18",
    estimatedHours: 4,
  },
  {
    id: "4",
    number: "WO-2024-004",
    type: "inspection",
    priority: "medium",
    status: "completed",
    customer: "Wilson Warehouses",
    address: "321 Industrial Ave",
    description: "Annual fire alarm inspection and certification",
    technician: "Tom Davis",
    scheduledDate: "2024-01-18",
    scheduledTime: "10:00 AM",
    createdAt: "2024-01-15",
    completedAt: "2024-01-18",
    estimatedHours: 3,
  },
  {
    id: "5",
    number: "WO-2024-005",
    type: "installation",
    priority: "medium",
    status: "on_hold",
    customer: "Downtown Clinic",
    address: "555 Medical Plaza",
    description: "Access control system installation - waiting for equipment",
    technician: "Mike Johnson",
    scheduledDate: "2024-01-22",
    scheduledTime: "08:00 AM",
    createdAt: "2024-01-10",
    estimatedHours: 6,
  },
];

const typeConfig = {
  installation: { label: "Installation", color: "bg-blue-100 text-blue-700" },
  repair: { label: "Repair", color: "bg-orange-100 text-orange-700" },
  maintenance: { label: "Maintenance", color: "bg-purple-100 text-purple-700" },
  inspection: { label: "Inspection", color: "bg-green-100 text-green-700" },
};

const priorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  emergency: { label: "Emergency", color: "bg-red-100 text-red-700" },
};

const statusConfig = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-700" },
  assigned: { label: "Assigned", color: "bg-blue-100 text-blue-700" },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  on_hold: { label: "On Hold", color: "bg-orange-100 text-orange-700" },
};

export default function WorkOrdersPage() {
  const [workOrders] = useState<WorkOrder[]>(mockWorkOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"list" | "board">("list");

  const filteredOrders = workOrders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: workOrders.length,
    pending: workOrders.filter((o) => o.status === "pending").length,
    inProgress: workOrders.filter((o) => o.status === "in_progress").length,
    completed: workOrders.filter((o) => o.status === "completed").length,
    emergency: workOrders.filter((o) => o.priority === "emergency").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all service work orders
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          New Work Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Wrench className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Wrench className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.inProgress}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Emergency</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.emergency}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search work orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700">Filter</span>
        </button>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const type = typeConfig[order.type];
          const priority = priorityConfig[order.priority];
          const status = statusConfig[order.status];

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-gray-900">
                          {order.number}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${type.color}`}
                        >
                          {type.label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${priority.color}`}
                        >
                          {priority.label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {order.customer}
                      </h3>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <p className="text-gray-600 mb-4">{order.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {order.address}
                    </div>
                    {order.technician && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        {order.technician}
                      </div>
                    )}
                    {order.scheduledDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {order.scheduledDate} at {order.scheduledTime}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Est. {order.estimatedHours}h
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  <button className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <Navigation className="w-4 h-4" />
                    Navigate
                  </button>
                  <button className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
