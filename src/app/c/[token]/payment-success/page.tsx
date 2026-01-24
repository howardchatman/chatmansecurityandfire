"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  Download,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

interface PaymentDetails {
  amount: number;
  payment_type: string;
  receipt_url?: string;
  quote_number?: string;
}

export default function PaymentSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = params.token as string;
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const response = await fetch(`/api/payments/verify?session_id=${sessionId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to verify payment");
        setLoading(false);
        return;
      }

      setPaymentDetails(data.data);
    } catch (err) {
      setError("Unable to verify payment status");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Payment Verification</h1>
          <p className="text-gray-600 mb-6">
            {error}. Your payment may still have been processed successfully.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please check your email for a payment receipt, or contact us if you have questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:+12144516366"
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-900 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call Us
            </a>
            <button
              onClick={() => router.push(`/c/${token}`)}
              className="flex-1 bg-orange-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-orange-700 transition-colors"
            >
              Return to Portal
            </button>
          </div>
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
            href="tel:+12144516366"
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-green-100">Thank you for your business</p>
          </div>

          {/* Payment Details */}
          <div className="p-6">
            {paymentDetails && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(paymentDetails.amount)}
                  </span>
                </div>
                {paymentDetails.quote_number && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Quote</span>
                    <span className="text-gray-700">{paymentDetails.quote_number}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-500">Payment Type</span>
                  <span className="text-gray-700 capitalize">{paymentDetails.payment_type}</span>
                </div>
              </div>
            )}

            <div className="space-y-4 text-gray-600">
              <p>
                A confirmation email has been sent to your email address with your receipt.
              </p>
              <p>
                Our team will be in touch shortly to schedule your service.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              {paymentDetails?.receipt_url && (
                <a
                  href={paymentDetails.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download Receipt
                </a>
              )}
              <button
                onClick={() => router.push(`/c/${token}`)}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
              >
                Return to Portal
              </button>
            </div>
          </div>

          {/* What's Next */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">What Happens Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-orange-600">1</span>
                </div>
                <p className="text-gray-600">
                  Our team will review your order and reach out to schedule installation.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-orange-600">2</span>
                </div>
                <p className="text-gray-600">
                  You'll receive a confirmation with your scheduled service date.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-orange-600">3</span>
                </div>
                <p className="text-gray-600">
                  Track your job status anytime through your customer portal.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Card */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Questions?</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:+12144516366"
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-900 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              <Phone className="w-5 h-5" />
              (214) 451-6366
            </a>
            <a
              href="mailto:info@chatmansecurityandfire.com"
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-900 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Email Us
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
