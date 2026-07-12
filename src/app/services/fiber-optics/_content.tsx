"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Network, Phone, ArrowLeft, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChadChat from "@/components/ChadChat";
import LeadCaptureForm from "@/components/LeadCaptureForm";

const faqs = [
  {
    question: "How much does commercial fiber optic installation cost in Houston?",
    answer:
      "It depends on the number of drops, the distance of the runs, whether it's single-mode or multimode fiber, and how much conduit or pathway work is involved. Small projects — a few fiber runs between two points — often start around $2,500. Full-building structured cabling for new construction can run $15,000 to $75,000 or more depending on square footage and drop count. We provide exact pricing after reviewing your drawings or walking the site.",
  },
  {
    question: "What's the difference between single-mode and multimode fiber?",
    answer:
      "Multimode fiber is used for shorter runs (typically under 550 meters) inside a building or campus and is less expensive per foot. Single-mode fiber carries signal much farther with less loss and is used for long runs, between-building backbones, and connections to the carrier. We assess your distances and bandwidth needs and spec the right type — using the wrong one wastes money or limits performance.",
  },
  {
    question: "Do you handle both the cabling and the conduit/pathways?",
    answer:
      "Yes. As a low-voltage contractor we run the cable, install the conduit, cable tray, J-hooks, and pathways, terminate and test every connection, and label everything. Because we also do fire alarm and security wiring, we can coordinate all the low-voltage systems in a building on one contract instead of you juggling three different trades.",
  },
  {
    question: "Do you test and certify the fiber after installation?",
    answer:
      "Every fiber run is tested and certified with an OTDR and power meter. You receive documentation showing each link passes the required loss budget for its standard. Certified test results are what a general contractor, IT department, or building owner needs to sign off on the work and honor the warranty.",
  },
  {
    question: "Can you install fiber during new construction?",
    answer:
      "Yes, and that's the best time to do it. We work off the drawings, coordinate with the electrical and low-voltage schedule, rough in pathways before walls close, and pull and terminate fiber on the construction timeline. We also handle retrofits in occupied buildings where the pathways are already in place.",
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
  { scope: "Fiber run between two points (per run, short)", range: "$400 – $900" },
  { scope: "Fusion splice and termination (per end)", range: "$75 – $150" },
  { scope: "Small project (a few drops, existing pathways)", range: "$2,500 – $6,000" },
  { scope: "Building backbone / riser fiber", range: "$8,000 – $20,000" },
  { scope: "Full-building structured cabling (new construction)", range: "$15,000 – $75,000+" },
  { scope: "OTDR testing and certification (per project)", range: "Included" },
];

const relatedServices = [
  {
    title: "Wireless & WiFi Installation",
    href: "/services/wireless-internet",
    description: "Fiber backbone feeds the access points. We design and install both together.",
  },
  {
    title: "Security Alarm",
    href: "/services/security-alarm",
    description: "Cameras and access control ride the same network cabling we install.",
  },
  {
    title: "Fire Alarm Systems",
    href: "/services/fire-alarm",
    description: "One low-voltage contractor for fire, data, and connectivity across your building.",
  },
  {
    title: "Consulting",
    href: "/services/consulting",
    description: "Not sure what cabling your building needs? We'll walk the property and spec it.",
  },
];

export default function FiberOpticsContent() {
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
            backgroundImage: "url('/fiber_optic_wide.png')",
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
                  <Network className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Fiber Optic Cabling &amp; Structured Cabling in Houston, TX
              </h1>
              <p className="text-lg text-white/90 mb-4 max-w-3xl">
                We design and install commercial fiber optic and structured cabling for buildings across Houston and Greater Texas. Backbone fiber between floors and buildings, horizontal data cabling to every workstation, splicing, termination, and full OTDR-certified testing. Whether it's a ground-up build or a retrofit in an occupied space, we run it clean, label it, test it, and hand you the documentation.
              </p>
              <p className="text-base text-white/75 mb-8 max-w-3xl">
                Because we also install fire alarm and security systems, we can wire all of your low-voltage infrastructure on a single contract — one crew, one point of contact, one schedule.
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Fiber Backbone and Riser Cabling</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Single-mode and multimode backbone fiber connecting floors, telecom rooms, and buildings on a campus. We size the fiber count for today's needs plus growth, run it through code-compliant pathways, and terminate it in the IDF/MDF racks.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Structured Data Cabling</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Horizontal cabling to workstations, cameras, access points, and equipment — Cat6, Cat6A, and fiber to the desk where required. Everything is labeled, tested, and documented to the applicable TIA/EIA standard.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Fusion Splicing and Termination</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Fusion splicing for low-loss permanent joints and field termination of connectors. Clean, precise work with test results to prove each connection meets its loss budget.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pathways, Conduit, and Cable Management</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Conduit, cable tray, J-hooks, and racks — the physical infrastructure that keeps a cabling system organized, protected, and serviceable. We build it to code and to a standard you can maintain years down the road.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Testing, Certification, and Documentation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Every link is tested with an OTDR and power meter and certified against the required standard. You receive labeled documentation and test results — what your IT team, GC, or building owner needs to sign off and warranty the work.
                  </p>
                </div>
              </div>
              <p className="mt-6 text-sm text-gray-500">
                Pairing cabling with wireless coverage?{" "}
                <Link href="/services/wireless-internet" className="text-orange-600 hover:underline font-medium">
                  See our wireless &amp; WiFi services →
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
                    step: "Assessment or Drawing Review",
                    detail: "For an existing building we walk the property and map pathways and drop locations. For new construction we work off the drawings and coordinate with the electrical and low-voltage schedule.",
                  },
                  {
                    step: "Design and Proposal",
                    detail: "You get a written scope with drop counts, fiber and copper types, pathway work, and clear pricing. We spec the right media for your distances and bandwidth — no over-building, no shortcuts.",
                  },
                  {
                    step: "Rough-In",
                    detail: "Pathways, conduit, and cable tray go in first — before walls close on new construction. We coordinate around the other trades so nothing gets buried or blocked.",
                  },
                  {
                    step: "Pull, Terminate, and Splice",
                    detail: "We pull the cable, terminate connectors, and fusion splice where needed. Clean routing, proper bend radius, and labeling at every point.",
                  },
                  {
                    step: "Test, Certify, and Document",
                    detail: "Every link is tested and certified. You get the documentation package — labeled maps and test results — for sign-off and warranty.",
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

            {/* Standards */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Standards We Build To</h2>
              <p className="text-gray-600 mb-6">Structured cabling is governed by a set of industry standards that keep systems consistent, testable, and supportable:</p>
              <ul className="space-y-4 mb-6">
                {[
                  {
                    code: "ANSI/TIA-568 (Structured Cabling)",
                    detail: "The core standard for commercial building cabling — covers cable types, connectors, distances, and performance categories for copper and fiber.",
                  },
                  {
                    code: "ANSI/TIA-569 (Pathways and Spaces)",
                    detail: "Defines how pathways, conduit, and telecom rooms are designed and built so cabling is protected and serviceable.",
                  },
                  {
                    code: "ANSI/TIA-606 (Labeling and Administration)",
                    detail: "The labeling and documentation standard — every cable, panel, and outlet identified so the system can be maintained years later.",
                  },
                  {
                    code: "NEC / NFPA 70 (Electrical Code)",
                    detail: "Governs the installation, firestopping, and plenum-rated cable requirements for low-voltage runs.",
                  },
                ].map(({ code, detail }) => (
                  <li key={code} className="flex gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                    <p className="text-gray-600 leading-relaxed">
                      <strong className="text-gray-900">{code}</strong> — {detail}
                    </p>
                  </li>
                ))}
              </ul>
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
                These are general ranges. Every building is different. We provide exact pricing after reviewing your drawings or walking the site.
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
                We install fiber optic and structured cabling across Texas, with primary coverage in Houston, Missouri City, Sugar Land, Pearland, The Woodlands, and surrounding areas. We also travel to Dallas, Austin, San Antonio, Fort Worth, College Station, Waco, Denton, and Lufkin for larger projects.
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
          heading="Request a Fiber / Cabling Quote"
          subtext="Tell me about your building or project. I'll get back to you within one business day."
          service="Fiber Optics & Structured Cabling"
        />
      </main>
      <Footer />
      <ChadChat />
    </>
  );
}
