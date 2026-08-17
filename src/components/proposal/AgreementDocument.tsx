/* eslint-disable @next/next/no-img-element */
"use client";

import {
  ProposalDocument,
  DISCIPLINES,
  STANDARD_TERMS,
  usd,
} from "@/lib/proposal-doc";

// Renders the agreement the way it goes to a customer. Laid out for paper:
// each scope is its own page, and print rules keep the page breaks where they
// belong so "Save as PDF" from the browser produces the finished document —
// no PDF library, and what you see on screen is what prints.

const NAVY = "#0E2148";
const ORANGE = "#C42332";

function PageHeader({ page }: { page: string }) {
  return (
    <div
      className="flex items-center justify-between px-6 py-2.5 text-white text-[11px]"
      style={{ background: NAVY, borderBottom: `3px solid ${ORANGE}` }}
    >
      <span className="flex items-center gap-2 font-semibold tracking-wide">
        <img src="/logo_only.png" alt="" className="h-5 w-auto" />
        CHATMAN SECURITY &amp; FIRE
      </span>
      <span className="text-white/70">{page}</span>
    </div>
  );
}

function PageFooter({ doc, n }: { doc: ProposalDocument; n: number }) {
  return (
    <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between text-[10px] text-gray-400">
      <span>
        {doc.project_name} | {doc.project_address}
      </span>
      <span>Page {n}</span>
    </div>
  );
}

const Sheet = ({ children }: { children: React.ReactNode }) => (
  <section className="agreement-page bg-white shadow-sm mx-auto mb-6 flex flex-col">
    {children}
  </section>
);

export default function AgreementDocument({ doc }: { doc: ProposalDocument }) {
  // A scope with unpriced work is not a finished number. Rather than print a
  // clean total that happens to be short, the document says so on its face —
  // so an incomplete agreement physically cannot go out looking final.
  const incomplete = doc.scopes.some((s) => (s.unpriced?.length ?? 0) > 0);
  const priceOrPending = (s: (typeof doc.scopes)[number]) =>
    (s.unpriced?.length ?? 0) > 0 ? "PRICING INCOMPLETE" : usd(s.price);
  const meta: [string, string][] = [
    ["CLIENT / OWNER", doc.client_name],
    ["DATE", doc.date],
    ["OPERATIONS MANAGER", doc.operations_manager || "—"],
    ["PHONE", doc.operations_phone || doc.client_phone || "—"],
    ["PROJECT ADDRESS", doc.project_address],
    ["EMAIL", doc.client_email || "—"],
    ["JURISDICTION", doc.jurisdiction],
    ["OCCUPANCY", doc.occupancy],
    ["BUILDING SIZE", doc.building_size],
    ["PREPARED BY", doc.prepared_by],
  ];

  return (
    <div className="agreement-root">
      <style>{`
        .agreement-page {
          width: 8.5in;
          min-height: 11in;
          padding: 0 0 0.5in;
        }
        @media print {
          @page { size: letter; margin: 0.4in; }
          body { background: #fff; }
          .no-print { display: none !important; }
          .agreement-page {
            width: auto; min-height: 0; box-shadow: none;
            margin: 0; padding: 0;
            page-break-after: always; break-after: page;
          }
          .agreement-page:last-child { page-break-after: auto; break-after: auto; }
        }
      `}</style>

      {/* ── COVER ─────────────────────────────────────────────── */}
      <Sheet>
        <div className="px-10 pt-10 text-center">
          <img src="/logo_only.png" alt="Chatman Security & Fire" className="h-20 w-auto mx-auto" />
          <h1 className="mt-3 text-2xl font-bold tracking-tight" style={{ color: ORANGE }}>
            CHATMAN SECURITY &amp; FIRE
          </h1>
          <p className="text-[11px] text-gray-600 mt-1">{DISCIPLINES}</p>
          <div className="my-4 h-[3px] mx-auto w-full" style={{ background: ORANGE }} />
          <h2 className="text-3xl font-bold text-gray-900">FIRE &amp; LIFE SAFETY AGREEMENT</h2>
          <p className="text-sm text-gray-600 mt-1">
            {doc.scopes.map((s) => s.title.replace(/ System.*$/, "")).join("  |  ")}
          </p>
          <p className="mt-5 text-[11px] font-bold tracking-widest" style={{ color: ORANGE }}>
            PROJECT
          </p>
          <p className="text-lg font-bold text-gray-900">{doc.project_name}</p>
          <p className="text-[11px] text-gray-600">
            {doc.project_address} • {doc.jurisdiction} • {doc.occupancy}
          </p>
        </div>

        <div className="px-10 mt-8">
          <table className="w-full text-[11px] border border-gray-200">
            <tbody>
              {Array.from({ length: Math.ceil(meta.length / 2) }, (_, r) => (
                <tr key={r} className="border-b border-gray-200 last:border-0">
                  {[meta[r * 2], meta[r * 2 + 1]].map((cell, i) =>
                    cell ? (
                      <>
                        <td key={`l${i}`} className="bg-gray-50 font-bold text-gray-700 px-3 py-2 w-[15%] align-top">
                          {cell[0]}
                        </td>
                        <td key={`v${i}`} className="px-3 py-2 w-[35%] align-top text-gray-800">
                          {cell[1]}
                        </td>
                      </>
                    ) : (
                      <td key={`e${i}`} colSpan={2} />
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 px-3 py-2 text-white font-bold text-[12px]" style={{ background: NAVY }}>
            AGREEMENT FOR FIRE &amp; LIFE SAFETY SERVICES
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-gray-700 text-justify">{doc.intro}</p>

          <div className="mt-6 px-3 py-2 text-white font-bold text-[12px]" style={{ background: NAVY }}>
            SCOPE OVERVIEW
          </div>
          <table className="w-full text-[11px] border border-gray-200 border-t-0">
            <thead>
              <tr className="text-white" style={{ background: NAVY }}>
                <th className="text-left px-3 py-2 w-[15%]">SCOPE</th>
                <th className="text-left px-3 py-2">DESCRIPTION</th>
                <th className="text-right px-3 py-2 w-[22%]">AGREEMENT PRICE</th>
              </tr>
            </thead>
            <tbody>
              {doc.scopes.map((s, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="px-3 py-2 text-gray-700">Scope {i + 1}</td>
                  <td className="px-3 py-2 text-gray-800">
                    {s.title}
                    {s.price_qualifier ? ` — ${s.price_qualifier}` : ""}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-900">{priceOrPending(s)}</td>
                </tr>
              ))}
              <tr className="text-white font-bold" style={{ background: NAVY }}>
                <td className="px-3 py-3">TOTAL AGREEMENT PRICE</td>
                <td className="px-3 py-3">Scopes {doc.scopes.map((_, i) => i + 1).join(" + ")}</td>
                <td className="px-3 py-3 text-right text-base" style={{ color: ORANGE }}>
                  {incomplete ? "PRICING INCOMPLETE" : usd(doc.total)}
                </td>
              </tr>
            </tbody>
          </table>

          {incomplete && (
            <div className="mt-3 border-2 border-red-400 bg-red-50 px-3 py-2">
              <p className="text-[11px] font-bold text-red-800">
                DRAFT — NOT FOR ISSUE
              </p>
              <p className="text-[10px] text-red-700 mt-0.5">
                One or more scopes contain work that has not been priced. Complete the pricing before
                this agreement is sent to a customer.
              </p>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 text-center text-[10px] text-gray-400">
          Chatman Security &amp; Fire | chatmansecurityandfire.com | {doc.date}
        </div>
      </Sheet>

      {/* ── ONE PAGE PER SCOPE ────────────────────────────────── */}
      {doc.scopes.map((scope, i) => (
        <Sheet key={i}>
          <PageHeader page={DISCIPLINES} />
          <div className="px-10 pt-8 flex-1 flex flex-col">
            <div className="flex items-center gap-4 border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="font-bold text-[11px] tracking-wide" style={{ color: ORANGE }}>
                SCOPE {i + 1}
              </span>
              <span className="font-bold text-gray-900 text-sm">{scope.title}</span>
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-gray-700 text-justify">
              {scope.narrative}
            </p>

            <p className="mt-4 font-bold text-[11px] text-gray-900">Scope of Work Includes:</p>
            <ul className="mt-2 space-y-1">
              {scope.inclusions.map((inc, k) => (
                <li key={k} className="text-[11px] text-gray-700 leading-snug flex gap-2">
                  <span className="text-gray-400 flex-shrink-0">•</span>
                  <span>{inc}</span>
                </li>
              ))}
            </ul>

            {scope.notes.length > 0 && (
              <div className="mt-4 border border-amber-300 bg-amber-50 px-3 py-2 space-y-1">
                {scope.notes.map((n, k) => (
                  <p key={k} className="text-[10px] leading-snug" style={{ color: "#92400e" }}>
                    • {n}
                  </p>
                ))}
              </div>
            )}

            <table className="w-full text-[11px] mt-6 border border-gray-200">
              <thead>
                <tr className="text-white" style={{ background: NAVY }}>
                  <th className="text-left px-3 py-2">
                    SCOPE {i + 1} — {scope.title.toUpperCase()} SUMMARY
                  </th>
                  <th className="text-right px-3 py-2 w-[22%]">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 text-gray-700">
                    Materials, Equipment, Labor, Permitting &amp; Commissioning — All Inclusive
                  </td>
                  <td className="px-3 py-2 text-right text-gray-900">{priceOrPending(scope)}</td>
                </tr>
                <tr className="text-white font-bold" style={{ background: NAVY }}>
                  <td className="px-3 py-2">
                    Scope {i + 1} Agreement Price
                    {scope.price_qualifier ? ` — ${scope.price_qualifier}` : ""}
                  </td>
                  <td className="px-3 py-2 text-right" style={{ color: ORANGE }}>
                    {priceOrPending(scope)}
                  </td>
                </tr>
              </tbody>
            </table>

            {(scope.unpriced?.length ?? 0) > 0 && (
              <div className="mt-3 border-2 border-red-400 bg-red-50 px-3 py-2">
                <p className="text-[10px] font-bold text-red-800">
                  Not yet priced — {scope.unpriced.length} item{scope.unpriced.length === 1 ? "" : "s"}
                </p>
                {scope.unpriced.map((u, k) => (
                  <p key={k} className="text-[10px] text-red-700">• {u}</p>
                ))}
              </div>
            )}

            <PageFooter doc={doc} n={i + 2} />
          </div>
        </Sheet>
      ))}

      {/* ── INVESTMENT SUMMARY + TERMS ────────────────────────── */}
      <Sheet>
        <PageHeader page={DISCIPLINES} />
        <div className="px-10 pt-8 flex-1 flex flex-col">
          <div className="px-3 py-2 text-white font-bold text-[12px]" style={{ background: NAVY }}>
            AGREEMENT INVESTMENT SUMMARY
          </div>
          <table className="w-full text-[11px] border border-gray-200 border-t-0">
            <thead>
              <tr className="text-white" style={{ background: NAVY }}>
                <th className="text-left px-3 py-2 w-[15%]">SCOPE</th>
                <th className="text-left px-3 py-2">DESCRIPTION</th>
                <th className="text-right px-3 py-2 w-[22%]">AGREEMENT PRICE</th>
              </tr>
            </thead>
            <tbody>
              {doc.scopes.map((s, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="px-3 py-2 text-gray-700">Scope {i + 1}</td>
                  <td className="px-3 py-2 text-gray-800">{s.title}</td>
                  <td className="px-3 py-2 text-right text-gray-900">{priceOrPending(s)}</td>
                </tr>
              ))}
              <tr className="text-white font-bold" style={{ background: NAVY }}>
                <td className="px-3 py-3">TOTAL AGREEMENT PRICE</td>
                <td className="px-3 py-3">Scopes {doc.scopes.map((_, i) => i + 1).join(" + ")}</td>
                <td className="px-3 py-3 text-right text-base" style={{ color: ORANGE }}>
                  {incomplete ? "PRICING INCOMPLETE" : usd(doc.total)}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-[10px] text-gray-500">
            This Agreement price is valid for <strong>{doc.validity_days} days</strong> from date of issue.
          </p>

          <div className="mt-5 px-3 py-2 text-white font-bold text-[12px]" style={{ background: NAVY }}>
            TERMS &amp; CONDITIONS
          </div>
          <ol className="mt-3 space-y-2">
            {STANDARD_TERMS.map((t, i) => (
              <li key={i} className="text-[10px] leading-relaxed text-gray-700 text-justify">
                <strong className="text-gray-900">
                  {i + 1}. {t.heading}.
                </strong>{" "}
                {t.body}
              </li>
            ))}
          </ol>

          <PageFooter doc={doc} n={doc.scopes.length + 2} />
        </div>
      </Sheet>

      {/* ── SIGNATURES ────────────────────────────────────────── */}
      <Sheet>
        <PageHeader page={DISCIPLINES} />
        <div className="px-10 pt-8 flex-1 flex flex-col">
          <div className="px-3 py-2 text-white font-bold text-[12px]" style={{ background: NAVY }}>
            AGREEMENT ACCEPTANCE &amp; SIGNATURES
          </div>
          <p className="mt-3 text-[11px] text-gray-700">
            By signing below, Owner and Contractor agree to the terms, scope, pricing, and conditions
            set forth in this Agreement.
          </p>

          <table className="w-full text-[11px] mt-4 border-2" style={{ borderColor: NAVY }}>
            <thead>
              <tr className="text-white" style={{ background: NAVY }}>
                <th className="text-left px-3 py-2">
                  TOTAL AGREEMENT PRICE — SCOPES {doc.scopes.map((_, i) => i + 1).join(" + ")}
                </th>
                <th className="text-right px-3 py-2 w-[25%]">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-3 text-gray-800">
                  {doc.scopes.map((s) => s.title).join(", ")}
                </td>
                <td className="px-3 py-3 text-right text-lg font-bold text-gray-900">
                  {incomplete ? (
                    <span className="text-red-700 text-sm">PRICING INCOMPLETE</span>
                  ) : (
                    usd(doc.total)
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-3 border border-amber-300 bg-amber-50 px-3 py-2">
            <p className="text-[10px]" style={{ color: "#92400e" }}>
              • This Agreement becomes binding upon execution by both parties. A signed copy shall be
              retained by each party. Work shall commence per a mutually agreed schedule following
              receipt of deposit.
            </p>
          </div>

          {[
            { role: "CONTRACTOR — CHATMAN SECURITY & FIRE", who: "Howard Chatman, Owner", sub: "Chatman Security & Fire | chatmansecurityandfire.com" },
            { role: `OWNER — ${doc.project_name.toUpperCase()}`, who: doc.client_name, sub: doc.client_email || "" },
            ...(doc.operations_manager
              ? [{ role: "OPERATIONS MANAGER", who: doc.operations_manager, sub: [doc.client_email, doc.operations_phone].filter(Boolean).join(" | ") }]
              : []),
          ].map((blk, i) => (
            <div key={i} className="mt-6">
              <p className="font-bold text-[11px] text-gray-900">{blk.role}</p>
              <div className="grid grid-cols-3 gap-6 mt-3 text-[10px] font-bold text-gray-700">
                <span>Signature</span>
                <span>Printed Name</span>
                <span>Date</span>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-6">
                {[0, 1, 2].map((k) => (
                  <div key={k} className="border-b border-gray-400" />
                ))}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">{blk.who}</p>
              {blk.sub && <p className="text-[10px] text-gray-400">{blk.sub}</p>}
              <div className="mt-4 h-[2px]" style={{ background: ORANGE }} />
            </div>
          ))}

          <PageFooter doc={doc} n={doc.scopes.length + 3} />
        </div>
      </Sheet>
    </div>
  );
}
