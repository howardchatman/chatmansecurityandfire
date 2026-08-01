"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Phone, CreditCard, CheckCircle2, ShieldCheck,
  Clock, Users, Wallet, ChevronDown, ChevronUp, Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Chatman's unique Acorn Finance contractor prequalification link
// (d=DZNTT is the tracking code that credits applications to the account).
const ACORN_APPLY_URL = "https://www.acornfinance.com/pre-qualify/?d=DZNTT";
const ACORN_BANNER_URL = "https://www.acornfinance.com/pre-qualify/?d=DZNTT&utm_medium=web_pre_qual_banner";
const ACORN_BANNER_IMG = "https://fs.acornfinance.com/banners/acorn-finance-banner-easy-payment-options-horizontal-medium.png";

const steps = [
  { icon: Sparkles, title: "Check your rate in ~60 seconds", desc: "One short form. It's a soft credit check — seeing your offers will NOT affect your credit score." },
  { icon: Users, title: "Compare offers from 12+ lenders", desc: "Acorn's network puts competing lenders side by side so you get the best rate you qualify for." },
  { icon: Wallet, title: "Pick the terms that fit you", desc: "Choose your monthly payment and term — up to $100,000 and terms up to 12 years." },
  { icon: Clock, title: "Get funded, we get to work", desc: "Approved funds can arrive in as little as 1–2 business days, and we schedule your project." },
];

const examples = [
  { job: "$25,000", low: "$330", high: "$403" },
  { job: "$45,000", low: "$595", high: "$725" },
  { job: "$100,000", low: "$1,322", high: "$1,610" },
];

const whyFinance = [
  { title: "Do it now, not later", desc: "Failed an inspection or need an upgrade? Get it handled today and spread the cost over time." },
  { title: "Keep your cash working", desc: "Preserve working capital and reserves for your business instead of a large one-time outlay." },
  { title: "No impact to check", desc: "Seeing your offers is a soft pull — your credit score isn't affected unless you accept a loan." },
  { title: "You're in control", desc: "You pick the lender, the term, and the payment. Acorn just shows you the options." },
];

const faqs = [
  {
    question: "Will checking my rate affect my credit score?",
    answer:
      "No. Checking your offers through Acorn Finance uses a soft credit inquiry, which does not affect your credit score. A hard credit pull only happens if you choose to move forward and formally accept a specific lender's offer.",
  },
  {
    question: "How much can I finance?",
    answer:
      "You can request financing up to $100,000, depending on the lender and your credit. That covers everything from a single fire alarm correction to a full commercial fire, sprinkler, security, or low-voltage project.",
  },
  {
    question: "What are the rates and terms?",
    answer:
      "Rates start as low as 4.49% APR, with repayment terms up to 12 years, depending on your credit and the lender you choose. Because Acorn shows you offers from 12+ competing lenders at once, you can pick the combination of rate and monthly payment that works best for you.",
  },
  {
    question: "How fast can I get funded?",
    answer:
      "Many lenders in the Acorn network can fund approved loans in as little as 1–2 business days. Funding times vary by lender. Once funds are available, we schedule and complete your project.",
  },
  {
    question: "Who actually provides the loan?",
    answer:
      "The financing is provided by third-party lenders in Acorn Finance's network — not by Chatman Security & Fire. Acorn is the platform that matches you with lenders. You apply directly and choose your lender; we simply make it easy to get started.",
  },
  {
    question: "What can I use financing for?",
    answer:
      "Any of our services — fire alarm systems, fire sprinklers, extinguishers, emergency lighting, fire marshal corrections, security and camera systems, access control, fiber optic cabling, and wireless networks — plus multi-service projects.",
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

export default function FinancingContent() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-20 bg-[#0D1B2A] overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-orange-400 mb-8 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/15 text-orange-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">
                <CreditCard className="w-3.5 h-3.5" /> Financing Available
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.08] mb-5">
                Do the work now. <span className="text-orange-500">Pay monthly.</span>
              </h1>
              <p className="text-xl text-gray-300 mb-4">
                Don&apos;t let budget delay a failed inspection or an important upgrade. Through
                Acorn Finance, get your fire &amp; security project done now and pay over time.
              </p>
              <p className="text-gray-400 mb-8">
                Compare offers from <strong className="text-white">12+ lenders</strong> · up to{" "}
                <strong className="text-white">$100,000</strong> · rates as low as{" "}
                <strong className="text-white">4.49% APR</strong> · checking won&apos;t affect your credit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={ACORN_APPLY_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-full transition-all shadow-lg shadow-orange-600/30">
                  Check Your Rate <ArrowRight className="w-5 h-5" />
                </a>
                <a href="tel:+18328597009" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/25 hover:border-white/60 hover:bg-white/5 text-white font-semibold rounded-full transition-all">
                  <Phone className="w-5 h-5" /> (832) 859-7009
                </a>
              </div>
              <p className="text-xs text-white/50 mt-4 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Soft credit check · no impact to your score to see offers
              </p>
              <a href={ACORN_BANNER_URL} target="_blank" rel="noopener noreferrer" className="inline-block mt-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ACORN_BANNER_IMG}
                  alt="Acorn Finance — apply and get affordable payment options from multiple lenders"
                  className="rounded-lg border border-white/20 max-w-full h-auto"
                />
              </a>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-white">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-10">How it works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {steps.map((s, i) => (
                <div key={s.title} className="bg-gray-50 rounded-2xl p-6 relative">
                  <div className="absolute top-5 right-5 text-4xl font-bold text-gray-100">{i + 1}</div>
                  <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                    <s.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1.5">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Example pricing */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Example monthly payments</h2>
              <p className="text-gray-600">
                Here&apos;s roughly what different project sizes could look like. Because you choose
                from <strong>12+ competing lenders</strong>, your actual rate and term may be better.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {examples.map((ex) => (
                <div key={ex.job} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-[#0D1B2A] p-5 text-center">
                    <p className="text-sm text-gray-400 uppercase tracking-wide">Project</p>
                    <p className="text-3xl font-bold text-white">{ex.job}</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <div className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-orange-600">{ex.low}<span className="text-base font-medium text-gray-500">/mo</span></p>
                        <p className="text-xs text-gray-500 mt-0.5">10% APR · 10 years</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{ex.high}<span className="text-base font-medium text-gray-500">/mo</span></p>
                        <p className="text-xs text-gray-500 mt-0.5">18% APR · 15 years</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-6 max-w-3xl leading-relaxed">
              <strong>Estimates for illustration only.</strong> Actual rates, terms, and monthly
              payments are set by third-party lenders in the Acorn Finance network and depend on your
              creditworthiness and the offer you accept. Rates start as low as 4.49% APR with terms up
              to 12 years. Financing is provided by Acorn&apos;s lending partners, not by Chatman
              Security &amp; Fire. This is not a commitment to lend or an offer of credit.
            </p>
            <div className="mt-6">
              <a href={ACORN_APPLY_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors">
                See your real offers <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Why finance */}
        <section className="py-16 bg-white">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-10">Why finance your project</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {whyFinance.map((w) => (
                <div key={w.title} className="border border-gray-200 rounded-2xl p-6">
                  <CheckCircle2 className="w-7 h-7 text-orange-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1.5">{w.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Financing FAQ</h2>
              <div className="bg-white rounded-2xl px-6 border border-gray-200">
                {faqs.map((f) => <FAQItem key={f.question} question={f.question} answer={f.answer} />)}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[#0D1B2A]">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Check your rate in about a minute — no impact to your credit — then let&apos;s get your
              project scheduled.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={ACORN_APPLY_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-full transition-colors">
                Check Your Rate <ArrowRight className="w-5 h-5" />
              </a>
              <Link href="/request-quote" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/25 hover:border-white/60 hover:bg-white/5 text-white font-semibold rounded-full transition-colors">
                Request a Quote First
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
