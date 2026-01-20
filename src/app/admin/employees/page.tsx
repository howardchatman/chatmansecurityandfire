"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Phone, Mail, MapPin } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  hireDate: string;
  jobsCompleted: number;
}

// Mock data
const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "Mike Thompson",
    email: "mike.t@securityplatform.com",
    phone: "(555) 111-0001",
    role: "Senior Technician",
    department: "Field Services",
    status: "active",
    hireDate: "2020-03-15",
    jobsCompleted: 456,
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah.c@securityplatform.com",
    phone: "(555) 111-0002",
    role: "Technician",
    department: "Field Services",
    status: "active",
    hireDate: "2021-06-20",
    jobsCompleted: 289,
  },
  {
    id: "3",
    name: "David Rodriguez",
    email: "david.r@securityplatform.com",
    phone: "(555) 111-0003",
    role: "Technician",
    department: "Field Services",
    status: "active",
    hireDate: "2022-01-10",
    jobsCompleted: 167,
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james.w@securityplatform.com",
    phone: "(555) 111-0004",
    role: "Junior Technician",
    department: "Field Services",
    status: "active",
    hireDate: "2023-08-01",
    jobsCompleted: 45,
  },
  {
    id: "5",
    name: "Emily Davis",
    email: "emily.d@securityplatform.com",
    phone: "(555) 111-0005",
    role: "Dispatcher",
    department: "Operations",
    status: "active",
    hireDate: "2021-02-14",
    jobsCompleted: 0,
  },
  {
    id: "6",
    name: "Jennifer Martinez",
    email: "jen.m@securityplatform.com",
    phone: "(555) 111-0006",
    role: "Sales Representative",
    department: "Sales",
    status: "active",
    hireDate: "2022-04-01",
    jobsCompleted: 0,
  },
  {
    id: "7",
    name: "Robert Brown",
    email: "robert.b@securityplatform.com",
    phone: "(555) 111-0007",
    role: "Account Manager",
    department: "Sales",
    status: "inactive",
    hireDate: "2019-11-01",
    jobsCompleted: 0,
  },
];

const departmentFilters = [
  { label: "All", value: "all" },
  { label: "Field Services", value: "Field Services" },
  { label: "Operations", value: "Operations" },
  { label: "Sales", value: "Sales" },
];

export default function EmployeesPage() {
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const filteredEmployees =
    departmentFilter === "all"
      ? mockEmployees
      : mockEmployees.filter((e) => e.department === departmentFilter);

  const columns = [
    {
      key: "name",
      label: "Employee",
      sortable: true,
      render: (employee: Employee) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-red-600">
              {employee.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{employee.name}</p>
            <p className="text-xs text-gray-500">{employee.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
      render: (employee: Employee) => (
        <span className="text-gray-600">{employee.department}</span>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (employee: Employee) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Mail className="w-3 h-3" />
            {employee.email}
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Phone className="w-3 h-3" />
            {employee.phone}
          </div>
        </div>
      ),
    },
    {
      key: "jobsCompleted",
      label: "Jobs Completed",
      sortable: true,
      render: (employee: Employee) => (
        <span className="font-medium text-gray-900">
          {employee.jobsCompleted > 0 ? employee.jobsCompleted : "-"}
        </span>
      ),
    },
    {
      key: "hireDate",
      label: "Hire Date",
      sortable: true,
      render: (employee: Employee) => (
        <span className="text-gray-500">
          {new Date(employee.hireDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (employee: Employee) => <StatusBadge status={employee.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500 mt-1">
            Manage your team and view performance
          </p>
        </div>
        <Link
          href="/admin/employees/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900">{mockEmployees.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {mockEmployees.filter((e) => e.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Field Technicians</p>
          <p className="text-2xl font-bold text-blue-600">
            {mockEmployees.filter((e) => e.department === "Field Services").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Jobs Completed</p>
          <p className="text-2xl font-bold text-red-600">
            {mockEmployees.reduce((sum, e) => sum + e.jobsCompleted, 0)}
          </p>
        </div>
      </div>

      {/* Department Filter */}
      <div className="flex flex-wrap gap-2">
        {departmentFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setDepartmentFilter(filter.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              departmentFilter === filter.value
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
        data={filteredEmployees}
        searchPlaceholder="Search employees..."
        onRowClick={(employee) => console.log("View employee:", employee.id)}
        actions={(employee) => (
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
