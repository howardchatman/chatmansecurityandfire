"use client";

import { useState } from "react";
import {
  CreditCard,
  Plus,
  CheckCircle,
  Calendar,
  DollarSign,
  Trash2,
} from "lucide-react";

export default function PaymentsPage() {
  const [selectedCard, setSelectedCard] = useState("1");

  const paymentMethods = [
    {
      id: "1",
      type: "visa",
      last4: "4242",
      expiry: "12/25",
      isDefault: true,
    },
    {
      id: "2",
      type: "mastercard",
      last4: "8888",
      expiry: "06/26",
      isDefault: false,
    },
  ];

  const recentPayments = [
    {
      id: "PAY-001",
      date: "Jan 15, 2024",
      amount: 79.98,
      method: "Visa •••• 4242",
      invoice: "INV-2024-001",
      status: "completed",
    },
    {
      id: "PAY-002",
      date: "Dec 15, 2023",
      amount: 79.98,
      method: "Visa •••• 4242",
      invoice: "INV-2023-012",
      status: "completed",
    },
    {
      id: "PAY-003",
      date: "Nov 15, 2023",
      amount: 79.98,
      method: "Visa •••• 4242",
      invoice: "INV-2023-011",
      status: "completed",
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">
          Manage your payment methods and view payment history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Payment Methods
              </h2>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Plus className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedCard(method.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCard === method.id
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 bg-gray-100 rounded flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {method.type} •••• {method.last4}
                        </p>
                        <p className="text-xs text-gray-500">
                          Expires {method.expiry}
                        </p>
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-red-300 hover:text-red-600 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Add Payment Method
            </button>
          </div>

          {/* Auto-Pay */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Auto-Pay</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Automatically pay invoices when due
                </p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  defaultChecked
                  className="sr-only peer"
                  id="autopay"
                />
                <label
                  htmlFor="autopay"
                  className="w-11 h-6 bg-gray-200 peer-checked:bg-red-600 rounded-full cursor-pointer transition-colors relative block"
                >
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                </label>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">
                Auto-pay is enabled using Visa •••• 4242
              </span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Payment History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {payment.date}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.method}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`/portal/invoices`}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          {payment.invoice}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Make a Payment */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Make a Payment
            </h2>
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-900">No Outstanding Balance</p>
              <p className="text-sm mt-1">
                Your account is current. Thank you for your payment!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
