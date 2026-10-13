import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarClock, Gamepad2, Hash, Library, MapPin, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GUIDE_GLOSSARY, GUIDE_NUMBERS, GUIDE_SCHEDULE, GUIDE_STANDARDS } from "@/lib/nfpa-guide";

export const metadata: Metadata = {
  title: "NFPA Codes & Standards Study Guide for Building Owners",
  description:
    "Plain-English guide to the NFPA standards behind fire inspections: NFPA 1, 10, 13, 14, 20, 25, 72, 80, 96, 101, and more. Inspection and testing schedule, key code numbers, glossary, and how NFPA applies in Texas.",
  alternates: { canonical: "/academy/nfpa" },
  openGraph: {
    title: "NFPA Codes & Standards Study Guide | Chatman Security & Fire",
    description:
      "What each NFPA standard covers, how often systems get inspected and tested, and the numbers inspectors check. Then practice in the Fire Protection Academy.",
    url: "https://www.chatmansecurityandfire.com/academy/nfpa",
  },
};

const SECTIONS = [
  { id: "standards", label: "The standards", icon: Library },
  { id: "schedule", label: "Inspection schedule", icon: CalendarClock },
  { id: "numbers", label: "Key numbers", icon: Hash },
  { id: "glossary", label: "Glossary", icon: BookOpen },
  { id: "texas", label: "NFPA in Texas", icon: MapPin },
];

export default function NfpaGuidePage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-neutral-950 text-white">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <Link href="/academy" className="text-sm font-semibold text-orange-400 hover:text-orange-300">
              ← Fire Protection Academy
            </Link>
            <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold leading-tight max-w-3xl">
              NFPA Codes &amp; Standards: <span className="text-orange-500">a study guide for building owners</span>
            </h1>
            <p className="mt-4 text-neutral-300 max-w-2xl text-lg">
              The National Fire Protection Association (NFPA) writes the standards behind nearly every fire inspection: how
              systems are installed, how often they&apos;re tested, and what an inspector checks. Here&apos;s what each one
              covers, in plain English.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/academy#nfpa"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition-colors"
              >
                <Gamepad2 className="w-5 h-5" />
                Practice with the NFPA course
              </Link>
              <a
                href="tel:+13468525540"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-full transition-colors"
              >
                <Phone className="w-5 h-5" />
                (346) 852-5540
              </a>
            </div>
            <nav aria-label="On this page" className="mt-10 flex flex-wrap gap-2">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-sm text-neutral-200"
                >
                  <s.icon className="w-4 h-4 text-orange-400" />
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {/* Standards */}
        <section id="standards" className="academy-grid py-12 sm:py-16 scroll-mt-20">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">The standards you&apos;ll actually run into</h2>
            <p className="mt-2 text-gray-600 max-w-2xl">
              NFPA publishes hundreds of codes and standards. These are the ones that come up on commercial fire inspections.
            </p>
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              {GUIDE_STANDARDS.map((s) => (
                <article
                  key={s.number}
                  id={s.number.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                  className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm scroll-mt-24"
                >
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-2xl font-black text-orange-700">{s.number}</span>
                    <h3 className="text-lg font-extrabold text-gray-900">{s.title}</h3>
                  </div>
                  <p className="mt-2 text-gray-700">{s.covers}</p>
                  {s.points.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {s.points.map((p) => (
                        <li key={p} className="flex gap-2 text-sm text-gray-700">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href={`/academy#${s.practice.hash}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-orange-700 hover:text-orange-800"
                  >
                    Practice: {s.practice.label}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section id="schedule" className="bg-white py-12 sm:py-16 scroll-mt-20">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Inspection, testing &amp; maintenance schedule</h2>
            <p className="mt-2 text-gray-600 max-w-2xl">
              The recurring items building owners get asked about most. Your inspection company handles most of them; the
              monthly checks are usually yours.
            </p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-900 text-white">
                  <tr>
                    <th className="px-4 py-3 font-bold">System</th>
                    <th className="px-4 py-3 font-bold">Task</th>
                    <th className="px-4 py-3 font-bold">How often</th>
                    <th className="px-4 py-3 font-bold">Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {GUIDE_SCHEDULE.map((r) => (
                    <tr key={`${r.system}-${r.task}`} className="odd:bg-gray-50/60">
                      <td className="px-4 py-2.5 font-semibold text-gray-900">{r.system}</td>
                      <td className="px-4 py-2.5 text-gray-700">{r.task}</td>
                      <td className="px-4 py-2.5 font-bold text-orange-700 whitespace-nowrap">{r.frequency}</td>
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{r.standard}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link href="/academy#nfpa" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-orange-700 hover:text-orange-800">
              Test yourself: The ITM Calendar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Numbers */}
        <section id="numbers" className="academy-grid py-12 sm:py-16 scroll-mt-20">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Numbers inspectors check</h2>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {GUIDE_NUMBERS.map((n) => (
                <div key={n.what} className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
                  <div className="text-2xl font-black text-gray-900">{n.value}</div>
                  <div className="mt-1 text-sm text-gray-700">{n.what}</div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{n.standard}</div>
                </div>
              ))}
            </div>
            <Link href="/academy#nfpa" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-orange-700 hover:text-orange-800">
              Test yourself: Dial In the Code
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Glossary */}
        <section id="glossary" className="bg-white py-12 sm:py-16 scroll-mt-20">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Glossary</h2>
            <dl className="mt-6 grid md:grid-cols-2 gap-x-10 gap-y-4">
              {GUIDE_GLOSSARY.map((g) => (
                <div key={g.term} className="border-b border-gray-100 pb-4">
                  <dt className="font-extrabold text-gray-900">{g.term}</dt>
                  <dd className="mt-1 text-gray-700">{g.meaning}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Texas */}
        <section id="texas" className="academy-grid py-12 sm:py-16 scroll-mt-20">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">How NFPA becomes the law</h2>
              <ul className="mt-5 space-y-3 text-gray-700">
                <li>
                  <strong className="text-gray-900">NFPA standards are written by consensus committees</strong> and revised on
                  a regular cycle, usually every three years.
                </li>
                <li>
                  <strong className="text-gray-900">They aren&apos;t law on their own.</strong> They become enforceable when a
                  state or city adopts them, usually by reference in its building and fire codes.
                </li>
                <li>
                  <strong className="text-gray-900">The edition matters.</strong> Jurisdictions adopt specific editions,
                  sometimes with local amendments, so the rule that applies is the one your jurisdiction adopted.
                </li>
                <li>
                  <strong className="text-gray-900">The AHJ has the final word</strong> on how a requirement applies to your
                  building.
                </li>
                <li>
                  You can read NFPA codes free online through NFPA&apos;s free-access program at{" "}
                  <a href="https://www.nfpa.org" className="font-semibold text-orange-700 underline" rel="noopener" target="_blank">
                    nfpa.org
                  </a>
                  .
                </li>
              </ul>
            </div>
            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-extrabold text-gray-900">In Texas and Houston</h3>
              <ul className="mt-4 space-y-3 text-gray-700">
                <li>
                  The <strong className="text-gray-900">Texas State Fire Marshal&apos;s Office</strong> licenses the companies
                  and technicians who install and service fire extinguishers, fire alarms, and fire sprinklers, and its rules
                  tie that work to adopted NFPA standards.
                </li>
                <li>
                  Many Texas cities, including <strong className="text-gray-900">Houston</strong>, enforce a fire code based on
                  the International Fire Code with local amendments. It points to NFPA standards for system details.
                </li>
                <li>Your local fire marshal is the AHJ who inspects your building and signs off on corrections.</li>
              </ul>
              <div className="mt-6 grid gap-3">
                <Link
                  href="/request-quote"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition-colors"
                >
                  Schedule an inspection
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/academy"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-full transition-colors"
                >
                  <Gamepad2 className="w-5 h-5" />
                  Play the Fire Protection Academy
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-8">
          <p className="container-custom mx-auto px-4 sm:px-6 lg:px-8 text-xs text-gray-400 max-w-4xl">
            This guide summarizes NFPA requirements in plain language for education. It isn&apos;t the code text, doesn&apos;t
            cover every exception, and may not match the edition or amendments your jurisdiction adopted. NFPA codes and
            standards are copyrighted by the National Fire Protection Association. Confirm requirements with your AHJ or a
            licensed fire protection company.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
