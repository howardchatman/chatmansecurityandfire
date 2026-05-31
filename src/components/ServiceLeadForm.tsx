"use client";

import { useState } from "react";
import { Phone, Mail, ArrowRight, CheckCircle } from "lucide-react";

interface ServiceLeadFormProps {
  service?: string;
  heading?: string;
  subheading?: string;
}

export default function ServiceLeadForm({
  service = "",
  heading = "Get a Free Estimate",
  subheading = "Tell us about your property and we'll respond within one business day — usually same day.",
}: ServiceLeadFormProps) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          message: form.message || (service ? `Service needed: ${service}` : "Submitted via service page"),
          source: "service_page_form",
        }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        setError("Something went wrong. Please call us at (832) 859-7009.");
      }
    } catch {
      setError("Something went wrong. Please call us at (832) 859-7009.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-neutral-950">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {done ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">We got it — thanks!</h3>
              <p className="text-neutral-400">Expect a call or text within a few hours. For urgent needs call <a href="tel:+18328597009" className="text-orange-400 font-semibold">(832) 859-7009</a>.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{heading}</h2>
                <p className="text-neutral-400 text-sm">{subheading}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number *"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address (optional)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm"
                />
                <textarea
                  rows={3}
                  placeholder={service ? `Tell us about your ${service.toLowerCase()} needs...` : "Describe your property and what you need..."}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm resize-none"
                />

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    {submitting ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                    ) : (
                      <>Send Request <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                  <a
                    href="tel:+18328597009"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-neutral-700 hover:border-orange-500 text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    (832) 859-7009
                  </a>
                </div>

                <p className="text-center text-xs text-neutral-600 flex items-center justify-center gap-1">
                  <Mail className="w-3 h-3" />
                  No spam. We only contact you about your request.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
