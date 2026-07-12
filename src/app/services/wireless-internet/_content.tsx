"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Wifi, Phone, ArrowLeft, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChadChat from "@/components/ChadChat";
import LeadCaptureForm from "@/components/LeadCaptureForm";

const faqs = [
  {
    question: "How much does commercial WiFi installation cost in Houston?",
    answer:
      "It depends on the square footage, building construction, number of access points, and whether cabling already exists to each mounting location. A small office with two or three access points often runs $2,500 to $6,000 installed. A warehouse or multi-floor building needing a site survey, a dozen or more access points, switching, and cabling can run $15,000 to $50,000 or more. We provide exact pricing after a site survey.",
  },
  {
    question: "Why not just use consumer routers from a big-box store?",
    answer:
      "Consumer gear is built for a house, not a business. It can't handle dozens of devices, doesn't roam cleanly between access points, has no central management, and no real support. Business-grade wireless (Ubiquiti UniFi, Cisco Meraki, Aruba) gives you seamless roaming, per-device control, guest networks, and a dashboard you or we can manage. The difference shows the moment your building gets busy.",
  },
  {
    question: "What is a wireless site survey and do I need one?",
    answer:
      "A site survey maps how a wireless signal actually behaves in your specific building — walls, metal racking, concrete, and interference all change coverage. We measure signal and plan access point placement so you get full coverage with no dead zones instead of guessing and hoping. For anything larger than a small open office, a survey pays for itself by avoiding under- or over-buying access points.",
  },
  {
    question: "Can you connect two buildings without trenching fiber?",
    answer:
      "Yes. A point-to-point wireless bridge links two buildings across a parking lot, yard, or street with a fast, licensed-free radio link — often far cheaper and faster to deploy than trenching fiber between them. We aim and tune the link and verify throughput before we leave.",
  },
  {
    question: "Do you provide the internet service too?",
    answer:
      "We don't sell the internet circuit itself — that comes from a carrier like Comcast Business, AT&T, or a fiber provider. What we do is build everything past the modem: the switching, the access points, the cabling, and the wireless coverage that turns one internet drop into reliable connectivity throughout your building. We can also coordinate with your carrier during install.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-orange-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {open && <p className="pb-5 text-gray-600 leading-relaxed">{answer}</p>}
    </div>
  );
}

const pricingRows = [
  { scope: "Wireless site survey", range: "$500 – $2,000" },
  { scope: "Access point install (per AP, cabling exists)", range: "$300 – $600" },
  { scope: "Small office network (2–3 access points)", range: "$2,500 – $6,000" },
  { scope: "Point-to-point building bridge", range: "$3,500 – $9,000" },
  { scope: "Warehouse / multi-floor coverage", range: "$15,000 – $50,000+" },
  { scope: "Network switching and controller", range: "$1,500 – $8,000" },
];

const relatedServices = [
  {
    title: "Fiber Optics & Cabling",
    href: "/services/fiber-optics",
    description: "The wired backbone that feeds every access point. We install both together.",
  },
  {
    title: "Security Alarm",
    href: "/services/security-alarm",
    description: "Cameras and access control ride the network we build. One contractor for all of it.",
  },
  {
    title: "Fire Alarm Systems",
    href: "/services/fire-alarm",
    description: "Low-voltage done right — fire, data, and wireless coordinated on one contract.",
  },
  {
    title: "Consulting",
    href: "/services/consulting",
    description: "Not sure what your building needs for coverage? We'll survey it and tell you.",
  },
];

export default function WirelessContent() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section
          className="relative py-16 lg:py-24"
          style={{
            backgroundImage: "url('/wireless_wide.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "#0D1B2A",
          }}
        >
          <div className="absolute inset-0 bg-black/55" />
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-orange-400 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-600 rounded-xl">
                  <Wifi className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Commercial WiFi &amp; Wireless Internet in Houston, TX
              </h1>
              <p className="text-lg text-white/90 mb-4 max-w-3xl">
                We design and install business-grade wireless networks for offices, warehouses, retail, and multi-building sites across Houston and Greater Texas. Site surveys, business-class access points, switching, guest networks, and point-to-point links between buildings. We build reliable coverage with no dead zones — and we manage it after the install if you want us to.
              </p>
              <p className="text-base text-white/75 mb-8 max-w-3xl">
                Because we also run the fiber and structured cabling that feeds your access points, we can deliver the whole connectivity stack — wired and wireless — on one contract instead of you coordinating multiple vendors.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:+18328597009"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call (832) 859-7009
                </a>
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-full transition-colors"
                >
                  Request a Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl py-16 space-y-16">

            {/* What We Do */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">What We Do</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Wireless Site Surveys and Design</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We map how signal actually behaves in your building — accounting for walls, metal, concrete, and interference — and design access point placement for full coverage with no dead zones. No guessing, no over-buying hardware.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Business-Grade Access Points and Switching</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We install and configure enterprise wireless — Ubiquiti UniFi, Cisco Meraki, and Aruba — with the switching, PoE, and controller to run it. Seamless roaming, guest networks, and per-device control your business actually needs.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Point-to-Point Building Links</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Connect two buildings across a yard, lot, or street with a wireless bridge — fast to deploy and far cheaper than trenching fiber. We aim, tune, and verify throughput before we leave.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Warehouse and High-Density Coverage</h3>
                  <p className="text-gray-600 leading-relaxed">
                    High-bay warehouses, event spaces, and busy offices need wireless designed for range and device density. We build coverage that holds up when the floor is full of scanners, tablets, and phones.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ongoing Management and Support</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Centrally managed networks mean we can monitor, update, and troubleshoot remotely. Add coverage, change a guest password, or diagnose an issue without a truck roll for every little thing.
                  </p>
                </div>
              </div>
              <p className="mt-6 text-sm text-gray-500">
                Need the wired backbone too?{" "}
                <Link href="/services/fiber-optics" className="text-orange-600 hover:underline font-medium">
                  See our fiber optic &amp; cabling services →
                </Link>
              </p>
            </motion.section>

            {/* How a Project Works */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">How a Project Works</h2>
              <ol className="space-y-6">
                {[
                  {
                    step: "Site Survey",
                    detail: "We walk the building, measure signal behavior, and identify coverage needs, device density, and interference sources. This drives the whole design.",
                  },
                  {
                    step: "Design and Proposal",
                    detail: "You get a written scope with access point count and placement, switching, cabling, and clear pricing. We spec the right amount of hardware — no dead zones, no waste.",
                  },
                  {
                    step: "Cabling and Mounting",
                    detail: "We run the cabling to each access point location, mount the hardware cleanly, and bring the switching and controller online.",
                  },
                  {
                    step: "Configuration and Tuning",
                    detail: "We configure the network, guest access, and roaming, then tune channels and power for real-world performance in your space.",
                  },
                  {
                    step: "Verification and Handoff",
                    detail: "We verify coverage and throughput across the building, document the setup, and hand it off — or keep managing it for you.",
                  },
                ].map((item, i) => (
                  <li key={item.step} className="flex gap-5">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">{item.step}</p>
                      <p className="text-gray-600 leading-relaxed">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </motion.section>

            {/* Where It Fits */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Where Business Wireless Fits</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  {
                    type: "Offices",
                    desc: "Seamless coverage across floors and conference rooms, secure staff and guest networks, and roaming that doesn't drop calls as people move.",
                  },
                  {
                    type: "Warehouses & Industrial",
                    desc: "High-bay coverage built for scanners, forklifts, and tablets across large open spans and metal racking that kills consumer signal.",
                  },
                  {
                    type: "Multi-Building Sites",
                    desc: "Point-to-point links tie separate buildings together without trenching, so one internet drop serves the whole property.",
                  },
                ].map(({ type, desc }) => (
                  <div key={type} className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{type}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Pricing */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Pricing</h2>
              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-5 py-3 font-semibold text-gray-700">Scope</th>
                      <th className="text-right px-5 py-3 font-semibold text-gray-700">Typical Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pricingRows.map(({ scope, range }) => (
                      <tr key={scope} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-gray-700">{scope}</td>
                        <td className="px-5 py-4 text-right font-semibold text-orange-600">{range}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                These are general ranges. Coverage needs vary widely by building. We provide exact pricing after a site survey.
              </p>
              <div className="mt-5">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full text-sm transition-colors"
                >
                  Get an exact quote for your building
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.section>

            {/* Service Areas */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Service Areas</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We install and manage commercial wireless across Texas, with primary coverage in Houston, Missouri City, Sugar Land, Pearland, The Woodlands, and surrounding areas. We also travel to Dallas, Austin, San Antonio, Fort Worth, College Station, Waco, Denton, and Lufkin for larger projects.
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                {[
                  { label: "Houston", slug: "houston" },
                  { label: "Dallas", slug: "dallas" },
                  { label: "Austin", slug: "austin" },
                  { label: "San Antonio", slug: "san-antonio" },
                  { label: "Fort Worth", slug: "fort-worth" },
                ].map(({ label, slug }) => (
                  <Link
                    key={slug}
                    href={`/service-areas/${slug}`}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-orange-100 hover:text-orange-700 rounded-full transition-colors text-gray-700 font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </motion.section>

            {/* FAQ */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
              <div className="bg-white rounded-2xl border border-gray-200 px-6">
                {faqs.map((faq) => (
                  <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </motion.section>

            {/* Related Services */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Related Services</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedServices.map(({ title, href, description }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group block bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 rounded-2xl p-5 transition-all"
                  >
                    <p className="font-semibold text-gray-900 group-hover:text-orange-700 mb-1">
                      {title} <ArrowRight className="inline w-3.5 h-3.5 ml-1" />
                    </p>
                    <p className="text-sm text-gray-500">{description}</p>
                  </Link>
                ))}
              </div>
            </motion.section>

          </div>
        </div>

        <LeadCaptureForm
          variant="inline"
          heading="Request a Wireless / WiFi Quote"
          subtext="Tell me about your building or project. I'll get back to you within one business day."
          service="Wireless & WiFi"
        />
      </main>
      <Footer />
      <ChadChat />
    </>
  );
}
