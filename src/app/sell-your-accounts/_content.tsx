"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Phone, Send, Loader2, CheckCircle2,
  Bell, Droplets, Shield, FlameKindling, Building2, Lock, DollarSign,
  Clock, TrendingUp, Handshake, ChevronDown, ChevronUp,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const whatWeBuy = [
  { icon: Bell, title: "Fire Alarm Monitoring", desc: "Central-station monitored fire alarm accounts and their RMR." },
  { icon: Droplets, title: "Inspection & ITM Accounts", desc: "Recurring fire alarm, sprinkler, and extinguisher inspection/ITM agreements." },
  { icon: Shield, title: "Security & Burglar RMR", desc: "Monitored intrusion, camera, and access-control accounts." },
  { icon: FlameKindling, title: "Extinguisher & Service Routes", desc: "Recurring tagging, service, and testing routes." },
  { icon: Building2, title: "Commercial Books", desc: "Commercial-focused portfolios of any size across Texas." },
  { icon: Handshake, title: "Whole Companies", desc: "Full business acquisitions when an owner is ready to exit." },
];

const whySell = [
  { icon: Building2, title: "A Direct, Local Buyer", desc: "You deal with the owner of a Houston fire & security company — not a broker or an out-of-state fund. No middleman fees." },
  { icon: DollarSign, title: "Fair RMR Multiples", desc: "We pay competitive multiples of your recurring monthly revenue, structured to fit your goals — lump sum or holdback." },
  { icon: Clock, title: "Fast, Clean Close", desc: "Straightforward due diligence and a quick timeline. No months of runaround." },
  { icon: Lock, title: "Completely Confidential", desc: "Your inquiry, numbers, and customer list stay private. Nothing is shared." },
];

const steps = [
  { step: "Reach Out Confidentially", detail: "Tell us a little about your accounts — roughly how many, the type, and your approximate RMR. No commitment, and everything stays private." },
  { step: "Valuation", detail: "We review the account mix, contracts, and monitoring/service arrangements and give you a clear valuation based on a multiple of your RMR." },
  { step: "Written Offer", detail: "You get a straightforward written offer with the price, structure (lump sum or holdback), and timeline — no hidden terms." },
  { step: "Due Diligence", detail: "We verify the accounts and contracts together. We'll tell you upfront exactly what we need so it moves quickly." },
  { step: "Close & Smooth Transition", detail: "We close, you get paid, and we handle a professional handoff so your customers keep getting great service under our name." },
];

const faqs = [
  {
    question: "How much are my accounts worth?",
    answer:
      "Alarm and monitoring accounts are valued as a multiple of their recurring monthly revenue (RMR). The exact multiple depends on the account type, contract terms, attrition history, geographic concentration, and how the accounts are monitored/serviced. After a quick confidential review we give you a clear number — reach out and we'll walk you through it.",
  },
  {
    question: "What kinds of accounts do you buy?",
    answer:
      "Fire alarm monitoring, recurring fire/sprinkler/extinguisher inspection (ITM) agreements, security and burglar monitoring, camera and access-control RMR, extinguisher service routes, and whole companies. Commercial-focused books are our specialty, and we consider portfolios of any size across Texas.",
  },
  {
    question: "Is this confidential?",
    answer:
      "Yes. Everything you share — your numbers, contracts, and customer information — stays strictly between us. We never share or resell your information, and nothing is disclosed to your customers until we've agreed on terms and planned the transition together.",
  },
  {
    question: "What happens to my customers after the sale?",
    answer:
      "They stay in good hands. We're a licensed, established Houston fire & security company. We handle a professional transition so your customers continue to receive monitoring, inspections, and service — often better than before. Your reputation is protected.",
  },
  {
    question: "Do I have to sell my whole business?",
    answer:
      "No. You can sell a portfolio of accounts, a service route, or the entire company — whatever fits your situation. Many owners sell a book of accounts to free up cash while keeping the rest, or sell everything as part of retiring.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 py-5 text-left">
        <span className="font-semibold text-gray-900">{question}</span>
        {open ? <ChevronUp className="w-5 h-5 text-orange-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>
      {open && <p className="pb-5 text-gray-600 leading-relaxed">{answer}</p>}
    </div>
  );
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
};

const blank = { name: "", company: "", email: "", phone: "", accountType: "", accountCount: "", rmr: "", message: "" };

export default function SellAccountsContent() {
  const [form, setForm] = useState({ ...blank });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim()) { setError("Please provide your name and phone so we can follow up."); return; }
    setSubmitting(true);
    const lines = [
      form.company && `Company: ${form.company}`,
      form.accountType && `Account type: ${form.accountType}`,
      form.accountCount && `Approx. # of accounts: ${form.accountCount}`,
      form.rmr && `Approx. monthly RMR: ${form.rmr}`,
      form.message && `\n${form.message}`,
    ].filter(Boolean);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email || null, phone: form.phone,
          message: lines.join("\n") || undefined,
          preferred_contact: form.email ? "email" : "phone",
          source: "account_sale", page: "/sell-your-accounts",
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Something went wrong. Please call (832) 859-7009."); setSubmitting(false); return; }
      setDone(true);
    } catch { setError("Something went wrong. Please call (832) 859-7009."); setSubmitting(false); }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section
          className="relative py-20 lg:py-28"
          style={{ backgroundImage: "url('/acquire_hero.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#0D1B2A" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A] via-[#0D1B2A]/85 to-[#0D1B2A]/40" />
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-orange-400 mb-8 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/15 text-orange-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">
                <Handshake className="w-3.5 h-3.5" /> For Fire &amp; Security Dealers
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.08] mb-5">
                We Buy Fire &amp; Security <span className="text-orange-500">Accounts.</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Retiring, downsizing, or ready to cash out? Sell your fire alarm, monitoring,
                inspection, and security accounts to a Texan operator who&apos;ll take
                great care of your customers. Direct buyer — no broker, no middleman.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#inquire" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-full transition-all shadow-lg shadow-orange-600/30">
                  Get a Confidential Valuation <ArrowRight className="w-5 h-5" />
                </a>
                <a href="tel:+18328597009" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/25 hover:border-white/60 hover:bg-white/5 text-white font-semibold rounded-full transition-all">
                  <Phone className="w-5 h-5" /> (832) 859-7009
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why sell to us */}
        <section className="py-16 bg-white">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Why sell to Chatman Security &amp; Fire</h2>
              <p className="text-gray-600">You built these accounts. When it&apos;s time to sell, work with a buyer who values them — and your customers — the way you do.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {whySell.map((w) => (
                <div key={w.title} className="bg-gray-50 rounded-2xl p-6">
                  <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                    <w.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1.5">{w.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What we buy */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-10">What we buy</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {whatWeBuy.map((b) => (
                <div key={b.title} className="bg-white rounded-2xl p-6 border border-gray-200">
                  <b.icon className="w-7 h-7 text-orange-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1.5">{b.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-white">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-10">How it works</h2>
              <ol className="space-y-6">
                {steps.map((s, i) => (
                  <li key={s.step} className="flex gap-5">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm">{i + 1}</div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">{s.step}</p>
                      <p className="text-gray-600 leading-relaxed">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Valuation */}
        <section className="py-16 bg-[#0D1B2A]">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-orange-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                  <TrendingUp className="w-4 h-4" /> What your accounts are worth
                </span>
                <h2 className="text-3xl font-bold text-white mb-4">Priced on a multiple of your RMR</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Fire and security accounts are valued as a multiple of their recurring monthly
                  revenue (RMR). A book generating $5,000/month can be worth well into the six
                  figures, depending on the account mix, contracts, and history.
                </p>
                <p className="text-gray-400 leading-relaxed mb-6">
                  We look at account type, contract terms, attrition, and how the accounts are
                  monitored and serviced — then give you a clear, fair number with no obligation.
                </p>
                <a href="#inquire" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-full transition-colors">
                  Find out what yours are worth <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img src="/acquire_valuation.png" alt="Reviewing an account portfolio and valuation" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-white">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Questions dealers ask</h2>
              <div className="bg-gray-50 rounded-2xl px-6">
                {faqs.map((f) => <FAQItem key={f.question} question={f.question} answer={f.answer} />)}
              </div>
            </div>
          </div>
        </section>

        {/* Inquiry form */}
        <section id="inquire" className="py-16 bg-gray-50">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Get a confidential valuation</h2>
              <p className="text-gray-600">Tell us a little about your accounts. We&apos;ll follow up privately within one business day. No obligation.</p>
            </div>
            {done ? (
              <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-10 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-9 h-9 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank you — we&apos;ll be in touch.</h3>
                <p className="text-gray-600 mb-6">We&apos;ve received your inquiry and will follow up confidentially within one business day. For anything urgent, call us directly.</p>
                <a href="tel:+18328597009" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors">
                  <Phone className="w-5 h-5" /> (832) 859-7009
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-10 space-y-5">
                {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <input value={form.name} onChange={set("name")} className={inputClass} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
                    <input value={form.company} onChange={set("company")} className={inputClass} placeholder="Your company" />
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
                <div className="grid sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Type</label>
                    <select value={form.accountType} onChange={set("accountType")} className={inputClass}>
                      <option value="">Select…</option>
                      <option>Fire Alarm Monitoring</option>
                      <option>Inspection / ITM</option>
                      <option>Security / Burglar</option>
                      <option>Extinguisher / Service Route</option>
                      <option>Whole Company</option>
                      <option>Mixed / Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5"># of Accounts</label>
                    <input value={form.accountCount} onChange={set("accountCount")} className={inputClass} placeholder="Approx." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly RMR</label>
                    <input value={form.rmr} onChange={set("rmr")} className={inputClass} placeholder="Approx. $" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Anything else?</label>
                  <textarea value={form.message} onChange={set("message")} rows={4} className={`${inputClass} resize-none`} placeholder="Tell us about your accounts, timeline, or goals." />
                </div>
                <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold rounded-full transition-colors text-lg">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {submitting ? "Sending…" : "Request My Valuation"}
                </button>
                <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Strictly confidential. We never share or resell your information.
                </p>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
