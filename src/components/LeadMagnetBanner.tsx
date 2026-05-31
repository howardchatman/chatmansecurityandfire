import Link from "next/link";
import { ClipboardList, ArrowRight } from "lucide-react";

export default function LeadMagnetBanner() {
  return (
    <section className="py-12 bg-neutral-950">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 bg-neutral-900 border border-neutral-800 rounded-2xl px-8 py-7">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">Free Download</p>
              <h3 className="text-lg font-bold text-white leading-snug">
                Commercial Fire Safety<br className="hidden sm:block" /> Self-Inspection Checklist
              </h3>
              <p className="text-sm text-neutral-400 mt-1">
                {44} items covering the most common Houston fire marshal violations — check before they do.
              </p>
            </div>
          </div>
          <Link
            href="/checklist"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors text-sm flex-shrink-0 whitespace-nowrap"
          >
            Get Free Checklist
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
