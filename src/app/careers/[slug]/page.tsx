import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ROLES, getRole } from "@/lib/careers";
import ApplyForm from "./_form";

// "general" is a real destination — the careers page invites speculative
// résumés — but it has no posting, so it is handled separately from ROLES.
export function generateStaticParams() {
  return [...ROLES.map((r) => ({ slug: r.slug })), { slug: "general" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "general") {
    return {
      title: "Send Us Your Résumé",
      description:
        "Send your résumé to Chatman Security & Fire. We keep experienced fire protection and low-voltage techs on file for future openings in Houston.",
      alternates: { canonical: "/careers/general" },
    };
  }
  const role = getRole(slug);
  if (!role) return { title: "Careers" };
  return {
    title: `${role.title} — Houston`,
    description: role.summary,
    alternates: { canonical: `/careers/${role.slug}` },
    openGraph: { title: `${role.title} | Chatman Security & Fire`, description: role.summary },
  };
}

export default async function RolePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const isGeneral = slug === "general";
  const role = isGeneral ? null : getRole(slug);
  if (!isGeneral && !role) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 bg-white">
        <section className="bg-[#0E2148] text-white py-12">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <a href="/careers" className="text-white/60 text-sm hover:text-white">
              ← All openings
            </a>
            <h1 className="text-3xl sm:text-4xl font-bold mt-3">
              {role ? role.title : "Send Us Your Résumé"}
            </h1>
            <p className="mt-3 text-white/80 leading-relaxed">
              {role
                ? role.summary
                : "We keep good people on file. Tell us what you do and we'll reach out when something opens up that fits."}
            </p>
            {role?.payRange && <p className="mt-2 text-white/60 text-sm">{role.payRange}</p>}
          </div>
        </section>

        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-12 space-y-10">
          {role && (
            <>
              <div>
                <h2 className="text-xl font-bold text-[#0E2148]">What you&apos;ll do</h2>
                <ul className="mt-3 space-y-2">
                  {role.responsibilities.map((r, i) => (
                    <li key={i} className="flex gap-3 text-gray-700 leading-relaxed">
                      <span className="text-orange-500 flex-shrink-0">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#0E2148]">What we need from you</h2>
                <ul className="mt-3 space-y-2">
                  {role.requirements.map((r, i) => (
                    <li key={i} className="flex gap-3 text-gray-700 leading-relaxed">
                      <span className="text-orange-500 flex-shrink-0">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {role.niceToHave?.length ? (
                <div>
                  <h2 className="text-xl font-bold text-[#0E2148]">Helps, but not required</h2>
                  <ul className="mt-3 space-y-2">
                    {role.niceToHave.map((r, i) => (
                      <li key={i} className="flex gap-3 text-gray-600 leading-relaxed">
                        <span className="text-gray-300 flex-shrink-0">•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}

          <div id="apply" className="rounded-2xl border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#0E2148]">Apply</h2>
            <p className="text-gray-600 mt-1">
              Takes two minutes. A résumé helps but isn&apos;t required — if you&apos;ve got the
              experience, tell us and we&apos;ll call.
            </p>
            <ApplyForm roleSlug={role?.slug || "general"} roleTitle={role?.title || "General Application"} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
