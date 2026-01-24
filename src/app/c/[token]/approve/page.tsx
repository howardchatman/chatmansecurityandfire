"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  CreditCard,
  Phone,
} from "lucide-react";

interface Quote {
  id: string;
  quote_number: string;
  status: string;
  totals: {
    total?: number;
    grandTotal?: number;
  };
  customer: {
    name?: string;
    company?: string;
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

export default function ApproveQuotePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = params.token as string;
  const wantsToPay = searchParams.get("pay") === "true";

  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [signatureName, setSignatureName] = useState("");
  const [signatureEmail, setSignatureEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentOption, setPaymentOption] = useState<"pay_later" | "pay_now" | "pay_deposit">(
    wantsToPay ? "pay_now" : "pay_later"
  );

  useEffect(() => {
    fetchLinkData();
  }, [token]);

  const fetchLinkData = async () => {
    try {
      const response = await fetch(`/api/customer-links/${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to load this page");
        setLoading(false);
        return;
      }

      setLinkData(data.data);

      // Pre-fill email if available
      if (data.data.customer_email) {
        setSignatureEmail(data.data.customer_email);
      }
      if (data.data.customer_name) {
        setSignatureName(data.data.customer_name);
      }
    } catch (err) {
      setError("Unable to load this page. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signatureName.trim()) {
      setError("Please enter your name to sign");
      return;
    }
    if (!signatureEmail.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!termsAccepted) {
      setError("Please accept the terms and conditions");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/customer-links/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature_name: signatureName,
          signature_email: signatureEmail,
          payment_option: paymentOption,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to submit approval");
        setSubmitting(false);
        return;
      }

      // If paying now, redirect to Stripe
      if (paymentOption !== "pay_later" && data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
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
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Estimate Approved!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your approval. We'll be in touch shortly to schedule your service.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            A confirmation has been sent to {signatureEmail}
          </p>
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

  const quote = linkData?.quote;
  const total = quote?.totals?.total || quote?.totals?.grandTotal || 0;
  const depositAmount = quote?.deposit_amount || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/csf_wide_logo.png"
              alt="Chatman Security & Fire"
              width={150}
              height={33}
              className="h-8 w-auto"
            />
          </div>
          <a
            href="tel:+12144516366"
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.push(`/c/${token}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Estimate
        </button>

        {/* Quote Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimate #{quote?.quote_number}</p>
              <p className="font-semibold text-gray-900">{quote?.template_name || "Security & Fire Services"}</p>
            </div>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Approval Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Approve Estimate</h2>
            <p className="text-gray-600">Sign below to approve this estimate</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Signature Name */}
            <div>
              <label htmlFor="signatureName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Full Name (Signature)
              </label>
              <input
                type="text"
                id="signatureName"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-signature"
                placeholder="Type your full name"
                style={{ fontFamily: "'Dancing Script', cursive" }}
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                By typing your name, you agree this constitutes your electronic signature
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signatureEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="signatureEmail"
                value={signatureEmail}
                onChange={(e) => setSignatureEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Payment Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Option
              </label>
              <div className="space-y-3">
                {depositAmount > 0 && (
                  <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentOption"
                      value="pay_deposit"
                      checked={paymentOption === "pay_deposit"}
                      onChange={() => setPaymentOption("pay_deposit")}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Pay Deposit Now</span>
                        <span className="font-semibold text-orange-600">{formatCurrency(depositAmount)}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Secure your spot with a deposit. Balance due upon completion.
                      </p>
                    </div>
                  </label>
                )}

                <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="pay_now"
                    checked={paymentOption === "pay_now"}
                    onChange={() => setPaymentOption("pay_now")}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Pay in Full Now</span>
                      <span className="font-semibold text-orange-600">{formatCurrency(total)}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Complete payment now via secure online payment.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="pay_later"
                    checked={paymentOption === "pay_later"}
                    onChange={() => setPaymentOption("pay_later")}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">Pay Later</span>
                    <p className="text-sm text-gray-500">
                      Approve now, pay after service is completed.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-gray-50 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  required
                />
                <span className="text-sm text-gray-600">
                  I have read and agree to the{" "}
                  <a href="/terms" className="text-orange-600 hover:underline">
                    terms and conditions
                  </a>
                  . I authorize Chatman Security & Fire to perform the work described in this estimate.
                </span>
              </label>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : paymentOption === "pay_later" ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Approve Estimate
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Approve & Continue to Payment
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
