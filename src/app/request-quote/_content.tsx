"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Phone, Send, Loader2, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChadChat from "@/components/ChadChat";

const SERVICES = [
  "Fire Alarm Systems",
  "Fire Sprinkler Systems",
  "Fire Extinguishers",
  "Emergency Lighting",
  "Fire Lane Marking",
  "Fire Marshal Compliance",
  "Security Alarm / Cameras",
  "Fiber Optics & Cabling",
  "Wireless & WiFi",
  "Multiple Services",
  "Not Sure — Need Guidance",
];

const BUILDING_TYPES = [
  "Office",
  "Retail",
  "Restaurant",
  "Warehouse / Industrial",
  "School / Daycare",
  "Medical / Healthcare",
  "Multi-Family / Apartments",
  "New Construction",
  "Other",
];

const TIMELINES = [
  "ASAP / Emergency",
  "Within 30 days",
  "1–3 months",
  "3–6 months",
  "Just planning / budgeting",
];

const blank = {
  name: "",
  company: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  service: "",
  buildingType: "",
  timeline: "",
  details: "",
};

const initialConsent = false;

export default function RequestQuoteContent() {
  const router = useRouter();
  const [form, setForm] = useState({ ...blank });
  const [smsConsent, setSmsConsent] = useState(initialConsent);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof blank) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.phone.trim()) {
      setError("Please provide your name and phone number.");
      return;
    }

    setSubmitting(true);

    // Compose a rich message so the full RFQ lands in the email + dashboard
    const messageLines = [
      form.company && `Company: ${form.company}`,
      (form.address || form.city) && `Project location: ${[form.address, form.city].filter(Boolean).join(", ")}`,
      form.timeline && `Timeline: ${form.timeline}`,
      `SMS consent: ${smsConsent ? "YES — opted in to text messages" : "No"}`,
      form.details && `\nProject details:\n${form.details}`,
    ].filter(Boolean);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email || null,
          phone: form.phone,
          serviceNeed: form.service || undefined,
          buildingType: form.buildingType || undefined,
          message: messageLines.join("\n") || undefined,
          preferred_contact: form.email ? "email" : "phone",
          source: "rfq",
          page: "/request-quote",
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Something went wrong. Please call us at (832) 859-7009.");
        setSubmitting(false);
        return;
      }
      router.push("/request-quote/thank-you");
    } catch {
      setError("Something went wrong. Please call us at (832) 859-7009.");
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500";

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-gray-50 min-h-screen">
        {/* Hero */}
        <section className="bg-[#0D1B2A] py-14">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-orange-400 mb-6 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-orange-600 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-orange-400 text-xs font-semibold uppercase tracking-[0.2em]">Request for Quote</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 max-w-2xl">
              Tell us about your project
            </h1>
            <p className="text-gray-300 max-w-2xl">
              Fill out the form below and we&apos;ll get back to you within one business day with next steps.
              Prefer to talk? Call{" "}
              <a href="tel:+18328597009" className="text-orange-400 font-semibold hover:underline">
                (832) 859-7009
              </a>.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="py-12">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-10 space-y-6"
            >
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
              )}

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input value={form.name} onChange={set("name")} className={inputClass} placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
                  <input value={form.company} onChange={set("company")} className={inputClass} placeholder="Business name" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                  <input type="tel" value={form.phone} onChange={set("phone")} className={inputClass} placeholder="(832) 000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={set("email")} className={inputClass} placeholder="you@company.com" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Address</label>
                  <input value={form.address} onChange={set("address")} className={inputClass} placeholder="Street address" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                  <input value={form.city} onChange={set("city")} className={inputClass} placeholder="Houston" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Needed</label>
                  <select value={form.service} onChange={set("service")} className={inputClass}>
                    <option value="">Select a service…</option>
                    {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Building / Property Type</label>
                  <select value={form.buildingType} onChange={set("buildingType")} className={inputClass}>
                    <option value="">Select type…</option>
                    {BUILDING_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Timeline</label>
                <select value={form.timeline} onChange={set("timeline")} className={inputClass}>
                  <option value="">Select timeline…</option>
                  {TIMELINES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Details</label>
                <textarea
                  value={form.details}
                  onChange={set("details")}
                  rows={5}
                  className={`${inputClass} resize-none`}
                  placeholder="Describe the scope — square footage, what needs to be done, any inspection deadlines, drawings available, etc."
                />
              </div>

              {/* SMS opt-in (A2P / TCR compliance) */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsConsent}
                  onChange={(e) => setSmsConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-orange-600 flex-shrink-0"
                />
                <span className="text-xs text-gray-500 leading-relaxed">
                  I agree to receive SMS text messages from Chatman Security &amp; Fire, Inc. about my
                  request, appointments, and service updates. Message frequency varies; message &amp; data
                  rates may apply. Reply STOP to opt out, HELP for help. Consent is not a condition of
                  purchase. See our{" "}
                  <a href="/privacy-policy" target="_blank" className="text-orange-600 hover:underline">Privacy Policy</a>{" "}
                  and{" "}
                  <a href="/terms-and-conditions" target="_blank" className="text-orange-600 hover:underline">Terms &amp; Conditions</a>.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold rounded-full transition-colors text-lg"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {submitting ? "Sending…" : "Submit Request"}
              </button>

              <p className="text-center text-xs text-gray-400">
                By submitting, you agree to be contacted about your request. We never sell your information.
              </p>
            </motion.form>

            {/* Fallback call CTA */}
            <div className="max-w-2xl mx-auto mt-6 text-center">
              <a href="tel:+18328597009" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium transition-colors">
                <Phone className="w-4 h-4" />
                Or call us directly: (832) 859-7009
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ChadChat />
    </>
  );
}
