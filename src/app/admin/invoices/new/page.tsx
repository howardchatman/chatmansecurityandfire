"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Send,
  Save,
  DollarSign,
  Users,
  FileText,
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  item_type: string;
}

interface Job {
  id: string;
  job_number: string;
  description: string;
  customer_name: string;
  total_amount: number;
  status: string;
}

export default function NewInvoicePage() {
  const router = useRouter();

  // Customer search
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const customerRef = useRef<HTMLDivElement>(null);

  // Job linking
  const [linkedJob, setLinkedJob] = useState<Job | null>(null);
  const [jobSearch, setJobSearch] = useState("");
  const [jobResults, setJobResults] = useState<Job[]>([]);
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const jobRef = useRef<HTMLDivElement>(null);

  // Line items
  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0, item_type: "service" },
  ]);

  // Invoice details
  const [taxRate, setTaxRate] = useState(8.25);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  // Customer search with debounce
  useEffect(() => {
    if (customerSearch.length < 2) {
      setCustomerResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/customers?search=${encodeURIComponent(customerSearch)}`);
        const data = await res.json();
        if (data.success) {
          setCustomerResults(data.data || []);
          setShowCustomerDropdown(true);
        }
      } catch {
        console.error("Error searching customers");
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  // Job search with debounce
  useEffect(() => {
    if (jobSearch.length < 2) {
      setJobResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/jobs?search=${encodeURIComponent(jobSearch)}`);
        const data = await res.json();
        if (data.success) {
          setJobResults(data.data || []);
          setShowJobDropdown(true);
        }
      } catch {
        console.error("Error searching jobs");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [jobSearch]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (customerRef.current && !customerRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false);
      }
      if (jobRef.current && !jobRef.current.contains(e.target as Node)) {
        setShowJobDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch("");
    setShowCustomerDropdown(false);
  }, []);

  const selectJob = useCallback((job: Job) => {
    setLinkedJob(job);
    setJobSearch("");
    setShowJobDropdown(false);
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0, item_type: "service" },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (action: "draft" | "send") => {
    setError("");

    if (!selectedCustomer) {
      setError("Please select a customer");
      return;
    }

    const validItems = items.filter((item) => item.description.trim() && item.unit_price > 0);
    if (validItems.length === 0) {
      setError("Add at least one line item with a description and price");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create invoice
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: selectedCustomer.id,
          job_id: linkedJob?.id || null,
          items: validItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            item_type: item.item_type,
          })),
          tax_rate: taxRate / 100,
          due_date: dueDate,
          notes,
          status: action === "send" ? "sent" : "draft",
        }),
      });

      const result = await res.json();
      if (!result.success) {
        setError(result.error || "Failed to create invoice");
        return;
      }

      // If sending, trigger Stripe invoice
      if (action === "send") {
        const sendRes = await fetch(`/api/invoices/${result.data.id}/send`, {
          method: "POST",
        });
        const sendResult = await sendRes.json();
        if (!sendResult.success) {
          // Invoice was created but sending failed
          setError(`Invoice created but failed to send: ${sendResult.error}. You can resend from the invoice page.`);
          router.push(`/admin/invoices/${result.data.id}`);
          return;
        }
      }

      router.push("/admin/invoices");
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
          <p className="text-gray-500 mt-1">Create and send an invoice to a customer</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Customer Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-600" />
          Customer
        </h2>

        {selectedCustomer ? (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div>
              <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
              <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
              {selectedCustomer.company && (
                <p className="text-sm text-gray-500">{selectedCustomer.company}</p>
              )}
              {selectedCustomer.address && (
                <p className="text-sm text-gray-400">
                  {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.zip}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Change
            </button>
          </div>
        ) : (
          <div ref={customerRef} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customers by name, email, or company..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {showCustomerDropdown && customerResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {customerResults.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => selectCustomer(customer)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">
                      {customer.email} {customer.company ? `- ${customer.company}` : ""}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {showCustomerDropdown && customerSearch.length >= 2 && customerResults.length === 0 && !isSearching && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
                No customers found. Create a customer first.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Link to Job (optional) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-600" />
          Link to Job
          <span className="text-sm font-normal text-gray-400">(optional)</span>
        </h2>

        {linkedJob ? (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div>
              <p className="font-medium text-gray-900">{linkedJob.job_number}</p>
              <p className="text-sm text-gray-500">{linkedJob.description}</p>
              <p className="text-sm text-gray-400">{linkedJob.customer_name}</p>
            </div>
            <button
              onClick={() => setLinkedJob(null)}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Remove
            </button>
          </div>
        ) : (
          <div ref={jobRef} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                placeholder="Search jobs by number or description..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
              />
            </div>

            {showJobDropdown && jobResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {jobResults.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => selectJob(job)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <p className="font-medium text-gray-900">{job.job_number}</p>
                    <p className="text-sm text-gray-500">{job.description} - {job.customer_name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-orange-600" />
          Line Items
        </h2>

        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-12 gap-3 text-sm font-medium text-gray-500 px-1">
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-1">Qty</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-1 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          {/* Items */}
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-5">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  placeholder="Service description..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm"
                />
              </div>
              <div className="col-span-2">
                <select
                  value={item.item_type}
                  onChange={(e) => updateItem(item.id, "item_type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm"
                >
                  <option value="service">Service</option>
                  <option value="labor">Labor</option>
                  <option value="equipment">Equipment</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm text-center"
                />
              </div>
              <div className="col-span-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price || ""}
                    onChange={(e) => updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm"
                  />
                </div>
              </div>
              <div className="col-span-1 text-right text-sm font-medium text-gray-900">
                ${(item.quantity * item.unit_price).toFixed(2)}
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addItem}
            className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium mt-2"
          >
            <Plus className="w-4 h-4" />
            Add Line Item
          </button>
        </div>

        {/* Totals */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-8 text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-900 w-28 text-right">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">Tax</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-center"
              />
              <span className="text-gray-500">%</span>
              <span className="font-medium text-gray-900 w-28 text-right">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-8 text-lg border-t border-gray-200 pt-2 mt-1">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-gray-900 w-28 text-right">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes or payment terms..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSubmit("draft")}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          Save as Draft
        </button>
        <button
          onClick={() => handleSubmit("send")}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? "Sending..." : "Send Invoice"}
        </button>
      </div>
    </div>
  );
}
