import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { blogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Fire & Life Safety Blog",
  description:
    "Plain-English guidance for Houston-area businesses on fire inspections, fire alarm costs, Knox Boxes, sprinklers, and fire marshal compliance, from a licensed Texas fire protection contractor.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/rss.xml" } },
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Chicago" });

export default function BlogIndexPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 bg-gray-50 min-h-screen">
        <section className="bg-[#0D1B2A] py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Blog</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Fire &amp; life safety, explained</h1>
            <p className="text-gray-300 max-w-2xl">
              Straight answers for Houston-area businesses on inspections, fire alarms, sprinklers, and staying on the
              right side of the fire marshal.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 grid gap-6 md:grid-cols-2">
            {blogPosts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex flex-col bg-white rounded-2xl border border-gray-200 p-6 hover:border-orange-300 hover:shadow-sm transition"
              >
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">{p.category}</p>
                <h2 className="text-xl font-bold text-[#0D1B2A] leading-snug mb-3">{p.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 flex-1">{p.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="inline-flex items-center gap-3">
                    {fmtDate(p.date)}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {p.readMinutes} min
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-orange-600 font-medium group-hover:gap-2 transition-all">
                    Read <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
