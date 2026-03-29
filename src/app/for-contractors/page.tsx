"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  HardHat,
  Phone,
  CheckCircle,
  FileText,
  ShieldCheck,
  Clock,
  Building2,
  ClipboardList,
  Zap,
  Users,
  Award,
  ArrowRight,
  Send,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChadChat from "@/components/ChadChat";

const whyUs = [
  {
    icon: Clock,
    title: "Bids Back in 24–48 Hours",
    description: "We know your schedules are tight. Send us the plans and we'll turn a competitive bid around fast.",
  },
  {
    icon: Award,
    title: "NICET-Certified Technicians",
    description: "Our crew is fully certified, licensed, insured, and bonded — no subs, no surprises on your job site.",
  },
  {
    icon: FileText,
    title: "We Pull Our Own Permits",
    description: "We handle all AHJ submittals, plan reviews, fire marshal coordination, and final inspections.",
  },
  {
    icon: ShieldCheck,
    title: "Code Compliance Guaranteed",
    description: "NFPA 72, local AHJ requirements, and fire marshal sign-off — we own it start to finish.",
  },
  {
    icon: Users,
    title: "Direct Point of Contact",
    description: "You deal with Howard directly. No call centers, no runarounds — just a partner who answers.",
  },
  {
    icon: Zap,
    title: "No Project Delays",
    description: "We show up when we say we will. Schedule us around your rough-in, drywall, and closeout milestones.",
  },
];

const projectTypes = [
  { label: "New Commercial Construction", icon: Building2 },
  { label: "Tenant Improvements (TI)", icon: ClipboardList },
  { label: "School & Institutional", icon: ShieldCheck },
  { label: "Industrial & Warehouse", icon: HardHat },
  { label: "Retail & Restaurant Build-Outs", icon: Building2 },
  { label: "Mixed-Use & Multi-Family", icon: Building2 },
];

const steps = [
  { step: "1", title: "Send Us the Plans", description: "Email or upload your architectural/MEP plans. We review scope and square footage." },
  { step: "2", title: "Receive Your Bid", description: "We send a detailed bid within 24–48 hours with device count, labor, and total installed cost." },
  { step: "3", title: "We Handle the Rest", description: "Permitting, installation, inspections, and fire marshal sign-off — all on your schedule." },
];

const buildingTypes = [
  "Office / Commercial",
  "Retail / Restaurant",
  "School / Institutional",
  "Industrial / Warehouse",
  "Multi-Family / Mixed-Use",
  "Medical / Healthcare",
  "Other",
];

interface FormData {
  company: string;
  name: string;
  email: string;
  phone: string;
  projectName: string;
  projectAddress: string;
  buildingType: string;
  sqft: string;
  timeline: string;
  notes: string;
}

export default function ForContractorsPage() {
  const [form, setForm] = useState<FormData>({
    company: "",
    name: "",
    email: "",
    phone: "",
    projectName: "",
    projectAddress: "",
    buildingType: "",
    sqft: "",
    timeline: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const message = [
      `GC BID REQUEST`,
      `Company: ${form.company}`,
      `Project: ${form.projectName}`,
      `Address: ${form.projectAddress}`,
      `Building Type: ${form.buildingType}`,
      `Square Footage: ${form.sqft} sq ft`,
      `Timeline: ${form.timeline}`,
      form.notes ? `Notes: ${form.notes}` : "",
    ].filter(Boolean).join("\n");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          message,
          source: "general_contractor",
          preferred_contact: "email",
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Submission failed");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-20">

        {/* Hero */}
        <section className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-orange-950 py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400 rounded-full blur-3xl" />
          </div>
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-500/30 text-orange-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <HardHat className="w-4 h-4" />
                For General Contractors
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Houston&apos;s Fire Alarm
                <span className="text-orange-500"> Subcontractor</span>
                <br />for General Contractors
              </h1>

              <p className="text-xl text-gray-300 mb-4">
                Fast bids. NICET-certified crew. We pull our own permits and handle everything with the fire marshal — so your project closes on time.
              </p>

              <p className="text-gray-400 mb-10">
                Serving the greater Houston area on new construction, TIs, schools, and commercial build-outs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#bid-form"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Request a Bid
                </a>
                <a
                  href="tel:+18324301826"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full border border-white/20 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  (832) 430-1826
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-orange-600 py-6">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
              {[
                { value: "24–48hr", label: "Bid Turnaround" },
                { value: "NICET", label: "Certified Crew" },
                { value: "100%", label: "Permit Ownership" },
                { value: "Houston", label: "Based & Licensed" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-orange-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Work With Us */}
        <section className="py-20 bg-white">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Why GCs Choose Chatman
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We understand what general contractors need — reliability, speed, and a sub who doesn&apos;t create headaches on your job site.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyUs.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="p-3 bg-orange-100 rounded-xl w-fit mb-4">
                    <item.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Project Types */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Projects We Bid On
              </h2>
              <p className="text-gray-600">If you&apos;re building it in Houston, we can sub the fire alarm.</p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {projectTypes.map((pt, i) => (
                <motion.div
                  key={pt.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm"
                >
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-800">{pt.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-gray-600">Simple, fast, no surprises.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {steps.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center relative"
                >
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-2/3 w-full">
                      <ArrowRight className="w-6 h-6 text-orange-300 mx-auto" />
                    </div>
                  )}
                  <div className="w-14 h-14 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Bid Request Form */}
        <section id="bid-form" className="py-20 bg-gray-50 scroll-mt-20">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Request a Bid</h2>
                <p className="text-gray-600">
                  Fill out the form below and we&apos;ll get back to you within 24–48 hours with a complete bid.
                </p>
              </motion.div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-200"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Bid Request Received!</h3>
                  <p className="text-gray-600 mb-6">
                    Howard will review your project and follow up within 24–48 hours with a complete bid.
                  </p>
                  <a
                    href="tel:+18324301826"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Need it faster? Call (832) 430-1826
                  </a>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 space-y-5"
                >
                  {/* Your Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Your Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                        <input
                          type="text"
                          name="company"
                          required
                          value={form.company}
                          onChange={handleChange}
                          placeholder="ABC General Contractors"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="John Smith"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="john@abcgc.com"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="(832) 555-0000"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Project Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                        <input
                          type="text"
                          name="projectName"
                          required
                          value={form.projectName}
                          onChange={handleChange}
                          placeholder="Westheimer Retail Center"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Address</label>
                        <input
                          type="text"
                          name="projectAddress"
                          value={form.projectAddress}
                          onChange={handleChange}
                          placeholder="1234 Westheimer Rd, Houston, TX 77056"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Building Type *</label>
                          <div className="relative">
                            <select
                              name="buildingType"
                              required
                              value={form.buildingType}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                            >
                              <option value="">Select type...</option>
                              {buildingTypes.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Square Footage</label>
                          <input
                            type="text"
                            name="sqft"
                            value={form.sqft}
                            onChange={handleChange}
                            placeholder="e.g. 25,000"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Timeline</label>
                        <input
                          type="text"
                          name="timeline"
                          value={form.timeline}
                          onChange={handleChange}
                          placeholder="e.g. Rough-in starts June, CO by September"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                        <textarea
                          name="notes"
                          value={form.notes}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Anything else we should know about the project..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold rounded-xl transition-colors"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Bid Request
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    Or call Howard directly at{" "}
                    <a href="tel:+18324301826" className="text-orange-600 font-medium">(832) 430-1826</a>
                  </p>
                </motion.form>
              )}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-neutral-900 py-16">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to add a reliable fire alarm sub to your team?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Call Howard now or send us your plans — we&apos;ll have a bid back to you within 24–48 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+18324301826"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call (832) 430-1826
                </a>
                <a
                  href="#bid-form"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full border border-white/20 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Submit a Bid Request
                </a>
              </div>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
      <ChadChat />
    </>
  );
}
