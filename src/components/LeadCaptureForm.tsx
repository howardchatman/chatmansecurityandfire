"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";

type FormVariant = "inline" | "hero" | "sidebar" | "footer";

interface LeadCaptureFormProps {
  variant?: FormVariant;
  heading?: string;
  subtext?: string;
  service?: string;
}

const buildingTypes = [
  "Office",
  "Retail",
  "Restaurant",
  "Daycare / School",
  "Church",
  "Warehouse",
  "Healthcare",
  "Assisted Living",
  "Other",
];

const serviceNeeds = [
  "New system install",
  "Inspection correction",
  "Trouble / repair",
  "Panel replacement",
  "Sprinkler work",
  "Extinguisher service",
  "Security system",
  "Not sure",
];

export default function LeadCaptureForm({
  variant = "inline",
  heading = "Let's Talk About Your Building",
  subtext = "Tell me about your project. I'll get back to you within one business day.",
  service,
}: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    buildingType: "",
    serviceNeed: service || "",
    description: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source: variant,
          page: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-[#0D1B2A] mb-2">Got it. I&apos;ll be in touch.</h3>
        <p className="text-gray-500">You&apos;ll hear from me within one business day. For urgent needs, call (832) 859-7009.</p>
      </div>
    );
  }

  const showAllFields = variant === "inline" || variant === "hero";
  const isFooter = variant === "footer";
  const isSidebar = variant === "sidebar";

  if (isFooter) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
        <input
          type="email"
          name="email"
          required
          placeholder="Your email"
          value={formData.email}
          onChange={handleChange}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#E85D04]"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="px-4 py-2.5 bg-[#E85D04] hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          {status === "submitting" ? "..." : "Go"}
        </button>
      </form>
    );
  }

  if (isSidebar) {
    return (
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[#0D1B2A] mb-1">{heading}</h3>
        {subtext && <p className="text-sm text-gray-500 mb-4">{subtext}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="name"
            required
            placeholder="Your Name *"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E85D04]"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="Email Address *"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E85D04]"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#E85D04] hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {status === "submitting" ? "Sending..." : "Get in Touch"}
            {status !== "submitting" && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
        {status === "error" && (
          <p className="text-red-500 text-xs mt-2 text-center">Something went wrong. Please call (832) 859-7009.</p>
        )}
      </div>
    );
  }

  return (
    <section className="py-16 bg-[#0D1B2A]">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{heading}</h2>
          <p className="text-gray-400 mb-8">{subtext}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                required
                placeholder="Your Name *"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#E85D04]"
              />
              <input
                type="tel"
                name="phone"
                required
                placeholder="Phone Number *"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#E85D04]"
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email Address (optional)"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#E85D04]"
            />

            {showAllFields && (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <select
                    name="buildingType"
                    value={formData.buildingType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm focus:outline-none focus:border-[#E85D04] text-white [&>option]:text-gray-900 appearance-none"
                  >
                    <option value="">Building Type</option>
                    {buildingTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  <select
                    name="serviceNeed"
                    value={formData.serviceNeed}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm focus:outline-none focus:border-[#E85D04] text-white [&>option]:text-gray-900 appearance-none"
                  >
                    <option value="">What Do You Need?</option>
                    {serviceNeeds.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <textarea
                  name="description"
                  placeholder="Tell me more about your situation (optional)"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#E85D04] resize-none"
                />
              </>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#E85D04] hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold rounded-xl text-sm transition-colors"
            >
              {status === "submitting" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Get in Touch
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {status === "error" && (
              <p className="text-red-400 text-sm text-center">
                Something went wrong. Please call us directly at (832) 859-7009.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
