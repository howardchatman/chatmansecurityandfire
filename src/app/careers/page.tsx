import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ROLES, CATEGORY_LABELS } from "@/lib/careers";
import { ArrowRight, MapPin, Briefcase, GraduationCap, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers — Fire Alarm, Sprinkler, Extinguisher & Fiber Technicians",
  description:
    "Hiring fire alarm, fire sprinkler, fire extinguisher, and fiber optic technicians, apprentices, and sales reps in Houston. Licensed commercial fire protection contractor since 2009. Apply online.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "Careers at Chatman Security & Fire | Houston",
    description:
      "Fire alarm, sprinkler, extinguisher, and fiber optic technician jobs in Houston. Apprenticeships available — no experience required.",
    url: "https://www.chatmansecurityandfire.com/careers",
  },
};

const GROUPS: { key: "technician" | "apprentice" | "sales"; blurb: string }[] = [
  { key: "technician", blurb: "Licensed and experienced field techs across four disciplines." },
  { key: "apprentice", blurb: "No experience needed. We train you and help you get licensed." },
  { key: "sales", blurb: "Real inbound leads, not cold calling from a list." },
];

export default function CareersPage() {
  // Google surfaces these in the jobs panel, which is where trade candidates
  // actually look.
  const jobSchema = {
    "@context": "https://schema.org",
    "@graph": ROLES.map((r) => ({
      "@type": "JobPosting",
      title: r.title,
      description: `${r.summary} Responsibilities: ${r.responsibilities.join("; ")}. Requirements: ${r.requirements.join("; ")}.`,
      employmentType: r.employmentType,
      hiringOrganization: {
        "@type": "Organization",
        name: "Chatman Security & Fire, Inc.",
        sameAs: "https://www.chatmansecurityandfire.com",
        logo: "https://www.chatmansecurityandfire.com/csf_wide_logo.png",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Houston",
          addressRegion: "TX",
          addressCountry: "US",
        },
      },
      directApply: true,
      url: `https://www.chatmansecurityandfire.com/careers/${r.slug}`,
    })),
  };

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }} />

      <main className="pt-24 pb-20 bg-white">
        <section className="bg-[#0D1B2A] text-white py-16">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h1 className="text-3xl sm:text-5xl font-bold">Work With Us</h1>
            <p className="mt-4 text-lg text-white/80 leading-relaxed">
              We&apos;re a Houston fire protection contractor, family-run since 2009. We do fire alarm,
              sprinkler, extinguishers, and low-voltage work for commercial buildings across the metro.
            </p>
            <p className="mt-3 text-white/70 leading-relaxed">
              We&apos;re hiring experienced techs — and we&apos;ll train apprentices from scratch. If you
              show up and do good work, there&apos;s a career here.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4" /> Houston metro
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                <Briefcase className="w-4 h-4" /> Full time
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                <GraduationCap className="w-4 h-4" /> We pay for training
              </span>
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-12">
            {GROUPS.map((g) => {
              const roles = ROLES.filter((r) => r.category === g.key);
              if (!roles.length) return null;
              return (
                <div key={g.key}>
                  <h2 className="text-2xl font-bold text-[#0D1B2A]">
                    {CATEGORY_LABELS[g.key]} Roles
                  </h2>
                  <p className="text-gray-600 mt-1">{g.blurb}</p>
                  <div className="mt-5 grid gap-4">
                    {roles.map((r) => (
                      <Link
                        key={r.slug}
                        href={`/careers/${r.slug}`}
                        className="group block rounded-2xl border border-gray-200 p-5 hover:border-orange-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-[#0D1B2A] group-hover:text-orange-600">
                              {r.title}
                            </h3>
                            {r.discipline && (
                              <span className="inline-block mt-1 text-xs font-medium text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
                                {r.discipline}
                              </span>
                            )}
                            <p className="text-gray-600 mt-2 leading-relaxed">{r.summary}</p>
                            {r.payRange && (
                              <p className="text-sm text-gray-500 mt-2">{r.payRange}</p>
                            )}
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 flex-shrink-0 mt-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#0D1B2A]">Don&apos;t see your trade?</h2>
              <p className="text-gray-600 mt-1">
                Send your résumé anyway. We keep good people on file and reach out when something opens
                up.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/careers/general"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium"
                >
                  Send a résumé <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="tel:8328597009"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-white"
                >
                  <Phone className="w-4 h-4" /> (832) 859-7009
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
