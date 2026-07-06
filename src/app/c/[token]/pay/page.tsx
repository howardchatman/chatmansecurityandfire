"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  CreditCard,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Shield,
  Phone,
  CheckCircle,
} from "lucide-react";

interface Quote {
  id: string;
  quote_number: string;
  status: string;
  payment_status?: string;
  totals: {
    subtotal?: number;
    tax?: number;
    total?: number;
    grandTotal?: number;
  };
  customer: {
    name?: string;
    email?: string;
  };
  template_name?: string;
  deposit_amount?: number;
}

interface LinkData {
  token: string;
  customer_name?: string;
  customer_email?: string;
  quote?: Quote;
}

export default function PayPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [paymentType, setPaymentType] = useState<"full" | "deposit">("full");

  useEffect(() => {
    fetchLinkData();
  }, [token]);

  const fetchLinkData = async () => {
    try {
      const response = await fetch(`/api/customer-links/${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to load payment page");
        return;
      }

      setLinkData(data.data);
    } catch {
      setError("Unable to load payment page. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!linkData?.quote) return;
    setRedirecting(true);
    setError("");

    try {
      const response = await fetch(`/api/customer-links/${token}/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_email: linkData.customer_email,
          customer_name: linkData.customer_name,
          payment_type: paymentType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to start payment. Please try again.");
        setRedirecting(false);
        return;
      }

      window.location.href = data.checkout_url;
    } catch {
      setError("Unable to connect to payment processor. Please try again.");
      setRedirecting(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount == null) return "$0.00";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error && !linkData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Unable to Load</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="tel:+18328597009"
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call (832) 859-7009
          </a>
        </div>
      </div>
    );
  }

  const quote = linkData?.quote;
  const total = quote?.totals?.total || quote?.totals?.grandTotal || 0;
  const depositAmount = quote?.deposit_amount || 0;
  const hasDeposit = depositAmount > 0 && depositAmount < total;
  const paymentAmount = paymentType === "deposit" && hasDeposit ? depositAmount : total;

  if (quote?.payment_status === "paid") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Paid</h1>
          <p className="text-gray-600 mb-6">This quote has already been paid. Thank you!</p>
          <button
            onClick={() => router.push(`/c/${token}`)}
            className="w-full bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
          >
            Return to Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Image
            src="/csf_wide_logo.png"
            alt="Chatman Security & Fire"
            width={150}
            height={33}
            className="h-8 w-auto"
          />
          <a
            href="tel:+18328597009"
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 text-sm font-medium"
          >
            <Phone className="w-4 h-4" />
            (832) 859-7009
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => router.push(`/c/${token}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </button>

        {/* Quote Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {quote?.template_name || "Service Estimate"}
          </h2>
          <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
            <span>Quote #</span>
            <span className="font-medium text-gray-900">{quote?.quote_number}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
            <span>Customer</span>
            <span className="font-medium text-gray-900">
              {linkData?.customer_name || quote?.customer?.name}
            </span>
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
            <span className="text-gray-600 font-medium">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment Options */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Choose Payment Amount</h2>
          </div>
          <div className="p-6 space-y-3">
            {hasDeposit && (
              <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors hover:bg-gray-50 border-gray-200 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                <input
                  type="radio"
                  name="paymentType"
                  value="deposit"
                  checked={paymentType === "deposit"}
                  onChange={() => setPaymentType("deposit")}
                  className="mt-1 accent-orange-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Pay Deposit</span>
                    <span className="text-xl font-bold text-orange-600">{formatCurrency(depositAmount)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Secure your project now. Balance due upon completion.
                  </p>
                </div>
              </label>
            )}

            <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors hover:bg-gray-50 border-gray-200 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
              <input
                type="radio"
                name="paymentType"
                value="full"
                checked={paymentType === "full"}
                onChange={() => setPaymentType("full")}
                className="mt-1 accent-orange-600"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Pay in Full</span>
                  <span className="text-xl font-bold text-orange-600">{formatCurrency(total)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Complete payment via secure online checkout.
                </p>
              </div>
            </label>
          </div>

          {/* Amount Due */}
          <div className="mx-6 mb-6 p-4 bg-gray-50 rounded-xl flex justify-between items-center">
            <span className="text-gray-600 font-medium">Amount Due Now</span>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(paymentAmount)}</span>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-4 flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Pay Button */}
          <div className="p-6 pt-0">
            <button
              onClick={handlePayNow}
              disabled={redirecting}
              className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {redirecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirecting to checkout...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay {formatCurrency(paymentAmount)} Securely
                </>
              )}
            </button>
          </div>
        </div>

        {/* Trust signals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-900">Secure Payment</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Payments are processed securely by Stripe. Chatman Security & Fire never stores your card information.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              256-bit SSL encryption
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              PCI-DSS compliant
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              No card data stored
            </span>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Questions about your invoice?{" "}
          <a href="tel:+18328597009" className="text-orange-600 font-medium hover:underline">
            Call (832) 859-7009
          </a>{" "}
          or{" "}
          <a href="mailto:info@chatmansecurityandfire.com" className="text-orange-600 font-medium hover:underline">
            email us
          </a>
        </div>
      </main>
    </div>
  );
}
