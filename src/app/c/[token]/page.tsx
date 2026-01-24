"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Download,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ChevronRight,
  Shield,
  Loader2,
  XCircle,
} from "lucide-react";

interface Quote {
  id: string;
  quote_number: string;
  status: string;
  totals: {
    subtotal?: number;
    tax?: number;
    total?: number;
    grandTotal?: number;
  };
  line_items: Array<{
    description?: string;
    name?: string;
    quantity?: number;
    unit_price?: number;
    total?: number;
  }>;
  customer: {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
  };
  site: {
    address?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  template_name?: string;
  valid_until?: string;
  created_at: string;
  accepted_at?: string;
  deposit_amount?: number;
  payment_status?: string;
}

interface Job {
  id: string;
  job_number: string;
  status: string;
  job_type: string;
  scheduled_date?: string;
  scheduled_time_start?: string;
  customer_name: string;
  site_address: string;
  site_city?: string;
  site_state?: string;
  description?: string;
}

interface LinkData {
  token: string;
  link_type: string;
  customer_name?: string;
  customer_email?: string;
  quote?: Quote;
  job?: Job;
  is_valid: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: <FileText className="w-4 h-4" /> },
  sent: { label: "Pending Review", color: "bg-blue-100 text-blue-700", icon: <Clock className="w-4 h-4" /> },
  viewed: { label: "Under Review", color: "bg-indigo-100 text-indigo-700", icon: <FileText className="w-4 h-4" /> },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-4 h-4" /> },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="w-4 h-4" /> },
  rejected: { label: "Declined", color: "bg-red-100 text-red-700", icon: <XCircle className="w-4 h-4" /> },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-500", icon: <AlertCircle className="w-4 h-4" /> },
};

const jobStatusConfig: Record<string, { label: string; color: string }> = {
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700" },
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700" },
  in_progress: { label: "In Progress", color: "bg-orange-100 text-orange-700" },
  awaiting_inspection: { label: "Awaiting Inspection", color: "bg-cyan-100 text-cyan-700" },
  corrections_required: { label: "Corrections Required", color: "bg-rose-100 text-rose-700" },
  passed: { label: "Inspection Passed", color: "bg-teal-100 text-teal-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  on_hold: { label: "On Hold", color: "bg-yellow-100 text-yellow-700" },
};

export default function CustomerPortalPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link Unavailable</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact us at{" "}
            <a href="tel:+12144516366" className="text-orange-600 hover:underline">
              (214) 451-6366
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (!linkData) {
    return null;
  }

  const { quote, job } = linkData;
  const total = quote?.totals?.total || quote?.totals?.grandTotal || 0;
  const quoteStatus = statusConfig[quote?.status || ""] || statusConfig.draft;
  const isQuoteAcceptable = quote && ["sent", "viewed"].includes(quote.status);
  const isQuoteAccepted = quote && ["accepted", "paid"].includes(quote.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/csf_wide_logo.png"
              alt="Chatman Security & Fire"
              width={180}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <a
            href="tel:+12144516366"
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">(214) 451-6366</span>
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 mb-1">Welcome,</p>
              <h1 className="text-2xl font-bold text-gray-900">
                {linkData.customer_name || quote?.customer?.name || quote?.customer?.company || "Valued Customer"}
              </h1>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${quoteStatus.color}`}>
              {quoteStatus.icon}
              <span className="text-sm font-medium">{quoteStatus.label}</span>
            </div>
          </div>
        </div>

        {/* Quote Details */}
        {quote && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* Quote Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-6">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-6 h-6" />
                <span className="text-orange-100">Estimate #{quote.quote_number}</span>
              </div>
              <h2 className="text-2xl font-bold">{quote.template_name || "Security & Fire Services"}</h2>
              {quote.valid_until && (
                <p className="text-orange-100 mt-2 text-sm">
                  Valid until {formatDate(quote.valid_until)}
                </p>
              )}
            </div>

            {/* Site Info */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Service Location</p>
                  <p className="text-gray-600">
                    {quote.site?.address || quote.site?.street}
                    {quote.site?.city && `, ${quote.site.city}`}
                    {quote.site?.state && `, ${quote.site.state}`}
                    {quote.site?.zip && ` ${quote.site.zip}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Scope of Work</h3>
              <div className="space-y-3">
                {quote.line_items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.description || item.name}
                      </p>
                      {item.quantity && item.quantity > 1 && (
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                        </p>
                      )}
                    </div>
                    <p className="font-medium text-gray-900 ml-4">
                      {formatCurrency(item.total || (item.quantity || 1) * (item.unit_price || 0))}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                {quote.totals?.subtotal && quote.totals?.tax && (
                  <>
                    <div className="flex justify-between text-gray-600 mb-2">
                      <span>Subtotal</span>
                      <span>{formatCurrency(quote.totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 mb-2">
                      <span>Tax</span>
                      <span>{formatCurrency(quote.totals.tax)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                {quote.deposit_amount && quote.deposit_amount > 0 && (
                  <div className="flex justify-between text-gray-600 mt-2">
                    <span>Deposit Required</span>
                    <span>{formatCurrency(quote.deposit_amount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {isQuoteAcceptable && (
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push(`/c/${token}/approve`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Estimate
                  </button>
                  <button
                    onClick={() => router.push(`/c/${token}/approve?pay=true`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
                  >
                    <CreditCard className="w-5 h-5" />
                    Approve & Pay {quote.deposit_amount ? "Deposit" : "Now"}
                  </button>
                </div>
                <p className="text-center text-sm text-gray-500 mt-4">
                  By approving, you agree to our{" "}
                  <a href="/terms" className="text-orange-600 hover:underline">
                    terms of service
                  </a>
                </p>
              </div>
            )}

            {isQuoteAccepted && (
              <div className="p-6 bg-green-50 border-t border-green-100">
                <div className="flex items-center gap-3 text-green-700">
                  <CheckCircle className="w-6 h-6" />
                  <div>
                    <p className="font-semibold">Estimate Approved</p>
                    {quote.accepted_at && (
                      <p className="text-sm text-green-600">
                        Approved on {formatDate(quote.accepted_at)}
                      </p>
                    )}
                  </div>
                </div>
                {quote.payment_status === "unpaid" && (
                  <button
                    onClick={() => router.push(`/c/${token}/pay`)}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
                  >
                    <CreditCard className="w-5 h-5" />
                    Make Payment
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Job Status */}
        {job && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Work Order</p>
                    <p className="font-semibold text-gray-900">{job.job_number}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  jobStatusConfig[job.status]?.color || "bg-gray-100 text-gray-700"
                }`}>
                  {jobStatusConfig[job.status]?.label || job.status}
                </span>
              </div>

              <p className="text-gray-700 mb-4">{job.description}</p>

              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="w-5 h-5 mt-0.5" />
                <span>
                  {job.site_address}
                  {job.site_city && `, ${job.site_city}`}
                  {job.site_state && `, ${job.site_state}`}
                </span>
              </div>

              {job.scheduled_date && (
                <div className="flex items-center gap-3 text-gray-600 mt-3">
                  <Calendar className="w-5 h-5" />
                  <span>
                    Scheduled for {formatDate(job.scheduled_date)}
                    {job.scheduled_time_start && ` at ${job.scheduled_time_start}`}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push(`/c/${token}/job`)}
              className="w-full p-4 flex items-center justify-between text-orange-600 hover:bg-orange-50 transition-colors"
            >
              <span className="font-medium">View Job Details & Timeline</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Contact Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Questions?</h3>
          <p className="text-gray-600 mb-4">
            Our team is here to help. Contact us anytime.
          </p>
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

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Chatman Security & Fire. All rights reserved.</p>
          <p className="mt-1">
            <a href="/privacy" className="hover:text-orange-600">Privacy Policy</a>
            {" · "}
            <a href="/terms" className="hover:text-orange-600">Terms of Service</a>
          </p>
        </footer>
      </main>
    </div>
  );
}
