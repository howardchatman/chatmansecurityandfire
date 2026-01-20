"use client";

import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
} from "lucide-react";

export default function InvoicesPage() {
  const invoices = [
    {
      id: "INV-2024-001",
      date: "Jan 1, 2024",
      dueDate: "Jan 15, 2024",
      amount: 79.98,
      status: "paid",
      description: "Monthly Monitoring - January 2024",
    },
    {
      id: "INV-2023-012",
      date: "Dec 1, 2023",
      dueDate: "Dec 15, 2023",
      amount: 79.98,
      status: "paid",
      description: "Monthly Monitoring - December 2023",
    },
    {
      id: "INV-2023-011",
      date: "Nov 1, 2023",
      dueDate: "Nov 15, 2023",
      amount: 79.98,
      status: "paid",
      description: "Monthly Monitoring - November 2023",
    },
    {
      id: "INV-2023-010",
      date: "Oct 1, 2023",
      dueDate: "Oct 15, 2023",
      amount: 79.98,
      status: "paid",
      description: "Monthly Monitoring - October 2023",
    },
  ];

  const statusConfig = {
    paid: {
      label: "Paid",
      icon: CheckCircle,
      color: "bg-green-100 text-green-700",
    },
    pending: {
      label: "Pending",
      icon: Clock,
      color: "bg-yellow-100 text-yellow-700",
    },
    overdue: {
      label: "Overdue",
      icon: AlertTriangle,
      color: "bg-red-100 text-red-700",
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600 mt-1">View and download your invoices</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Total Paid (YTD)</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(0)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total Invoices</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((invoice) => {
                const status = statusConfig[invoice.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{invoice.id}</p>
                        <p className="text-sm text-gray-500">
                          {invoice.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{invoice.date}</p>
                        <p className="text-xs text-gray-500">
                          Due: {invoice.dueDate}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
