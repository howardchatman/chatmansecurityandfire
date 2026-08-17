"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Phone, ArrowLeft, ArrowRight, ChevronDown, ChevronUp,
  Video, KeyRound, Speaker, BellRing, DoorOpen, ShieldAlert, CheckCircle2, type LucideIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadCaptureForm from "@/components/LeadCaptureForm";

const icons: Record<string, LucideIcon> = {
  video: Video,
  access: KeyRound,
  pa: Speaker,
  nurse: BellRing,
  gate: DoorOpen,
  firedept: ShieldAlert,
};

export interface ServiceLandingData {
  iconName: keyof typeof icons;
  bgImage: string;
  title: string;          // H1
  kicker: string;         // small label above H1
  intro: string;          // hero paragraph
  subIntro?: string;      // second, smaller hero paragraph
  whatWeDo: { title: string; desc: string }[];
  howItWorks?: { step: string; detail: string }[];
  standards?: { code: string; detail: string }[];
  standardsIntro?: string;
  pricingRows?: { scope: string; range: string }[];
  pricingNote?: string;
  faqs: { question: string; answer: string }[];
  related: { title: string; href: string; description: string }[];
  leadHeading: string;
  leadSubtext: string;
  leadService: string;
}

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

export default function ServiceLanding({ data }: { data: ServiceLandingData }) {
  const Icon = icons[data.iconName];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-16 lg:py-24" style={{ backgroundImage: `url('${data.bgImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#0E2148" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E2148] via-[#0E2148]/80 to-[#0E2148]/40" />
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-orange-400 mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-600 rounded-xl">{Icon && <Icon className="w-8 h-8 text-white" />}</div>
                <span className="text-orange-400 text-xs font-semibold uppercase tracking-[0.2em]">{data.kicker}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">{data.title}</h1>
              <p className="text-lg text-white/90 mb-4 max-w-3xl">{data.intro}</p>
              {data.subIntro && <p className="text-base text-white/75 mb-8 max-w-3xl">{data.subIntro}</p>}
              <div className="flex flex-wrap gap-3">
                <a href="tel:+18328597009" className="inline-flex items-center gap-2 px-7 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors">
                  <Phone className="w-5 h-5" /> Call (832) 859-7009
                </a>
                <Link href="/request-quote" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-full transition-colors">
                  Request a Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl py-16 space-y-16">
            {/* What we do */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">What We Do</h2>
              <div className="space-y-8">
                {data.whatWeDo.map((w) => (
                  <div key={w.title}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{w.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{w.desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* How it works */}
            {data.howItWorks && (
              <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
                <ol className="space-y-6">
                  {data.howItWorks.map((item, i) => (
                    <li key={item.step} className="flex gap-5">
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm">{i + 1}</div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">{item.step}</p>
                        <p className="text-gray-600 leading-relaxed">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </motion.section>
            )}

            {/* Standards */}
            {data.standards && (
              <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Standards &amp; Best Practices</h2>
                {data.standardsIntro && <p className="text-gray-600 mb-6">{data.standardsIntro}</p>}
                <ul className="space-y-4">
                  {data.standards.map(({ code, detail }) => (
                    <li key={code} className="flex gap-3">
                      <span className="mt-1 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                      <p className="text-gray-600 leading-relaxed"><strong className="text-gray-900">{code}</strong> — {detail}</p>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {/* Pricing */}
            {data.pricingRows && (
              <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Pricing</h2>
                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 border-b border-gray-200"><th className="text-left px-5 py-3 font-semibold text-gray-700">Scope</th><th className="text-right px-5 py-3 font-semibold text-gray-700">Typical Range</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.pricingRows.map(({ scope, range }) => (
                        <tr key={scope} className="hover:bg-gray-50 transition-colors"><td className="px-5 py-4 text-gray-700">{scope}</td><td className="px-5 py-4 text-right font-semibold text-orange-600">{range}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {data.pricingNote && <p className="text-sm text-gray-500 mt-3">{data.pricingNote}</p>}
                <div className="mt-5">
                  <Link href="/request-quote" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full text-sm transition-colors">
                    Get an exact quote <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.section>
            )}

            {/* FAQ */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
              <div className="bg-white rounded-2xl border border-gray-200 px-6">
                {data.faqs.map((f) => <FAQItem key={f.question} question={f.question} answer={f.answer} />)}
              </div>
            </motion.section>

            {/* Why Chatman */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#0E2148] rounded-3xl p-8 sm:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Why choose Chatman Security &amp; Fire</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "One trusted partner for fire, life safety, security, and low-voltage — not five vendors",
                  "Licensed, insured, and code-focused — we build it to pass inspection",
                  "Local Houston owner-operator who shows up and stays on the job",
                  "Straightforward quotes, clean installs, and service after the sale",
                ].map((p) => (
                  <div key={p} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 leading-relaxed">{p}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Related */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Related Services</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {data.related.map(({ title, href, description }) => (
                  <Link key={href} href={href} className="group block bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 rounded-2xl p-5 transition-all">
                    <p className="font-semibold text-gray-900 group-hover:text-orange-700 mb-1">{title} <ArrowRight className="inline w-3.5 h-3.5 ml-1" /></p>
                    <p className="text-sm text-gray-500">{description}</p>
                  </Link>
                ))}
              </div>
            </motion.section>
          </div>
        </div>

        <LeadCaptureForm variant="inline" heading={data.leadHeading} subtext={data.leadSubtext} service={data.leadService} />
      </main>
      <Footer />
    </>
  );
}
