import Link from "next/link";
import { ArrowRight, GraduationCap, Landmark, Building2, Handshake } from "lucide-react";

const sectors = [
  { icon: GraduationCap, label: "School districts" },
  { icon: Landmark, label: "Cities & municipalities" },
  { icon: Building2, label: "County, state & federal facilities" },
  { icon: Handshake, label: "Subcontracting for prime contractors" },
];

export default function PublicSectorBanner() {
  return (
    <section className="bg-white py-16 border-b border-gray-100">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0D1B2A] px-8 py-12 sm:px-12 lg:px-16">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="max-w-2xl">
              <p className="text-orange-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                Government &amp; Public Sector
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
                Fire &amp; security for schools, cities, and government facilities
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                We work with school districts and city municipalities, as the prime contractor or as a subcontractor
                on your public project.
              </p>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {sectors.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2.5 text-sm text-gray-200">
                    <Icon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/government"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-all shadow-lg shadow-orange-600/30 text-lg"
              >
                Government &amp; Schools
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
