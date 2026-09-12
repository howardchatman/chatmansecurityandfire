/* eslint-disable @next/next/no-img-element */
"use client";

import { Fragment, useEffect, useState } from "react";
import QRCode from "qrcode";
import SiteMap from "./SiteMap";
import {
  COMPANY,
  EquipmentRow,
  fullSiteAddress,
  hydrateEquipment,
  INSPECTION_TYPE_LABELS,
  reportStandard,
  usesEquipmentLog,
} from "@/lib/inspection-report";

// The customer-facing inspection report, laid out for paper.
//
// Cover with a map of the site and a QR code to the portal, an information
// page, a testing summary with the governing standard, then the body: a
// per-device log for extinguisher inspections, or the checklist as a
// Yes/No table for everything else. Photos follow, then a conclusion page.
//
// Print rules turn each section into its own page. A long device log simply
// runs onto extra sheets — rows never split.

export interface ReportDeficiency {
  id: string;
  category: string;
  location?: string;
  description: string;
  severity: string;
  recommended_action?: string;
  code_reference?: string;
}

export interface ReportChecklistItem {
  id: string;
  item: string;
  category: string;
  passed: boolean | null;
  notes?: string;
}

export interface ReportPhoto {
  id: string;
  photo_url: string;
  caption?: string;
  photo_type?: string;
  location?: string;
  device_tag?: string;
}

export interface ReportInspection {
  id: string;
  inspection_number?: string;
  customer_name: string;
  site_address: string;
  site_city?: string;
  site_state?: string;
  site_zip?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  inspection_type: string;
  status: string;
  scheduled_date?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  passed?: boolean | null;
  pass_with_deficiencies?: boolean;
  notes?: string;
  fire_marshal_notes?: string;
  checklist_results?: ReportChecklistItem[];
  inspector?: { full_name: string; email?: string; phone?: string } | null;
  deficiencies?: ReportDeficiency[];
  photos?: ReportPhoto[];
  equipment?: unknown;
}

const SLATE = "#5B6770";
const ORANGE = "#E85D04";
const BAND = "#EAEEF3";
const RULE = "#D6DCE4";

const categoryLabels: Record<string, string> = {
  emergency_lighting: "Emergency Lighting",
  duct_smoke: "Duct Smoke Detector",
  fire_lane: "Fire Lane",
  panel_trouble: "Panel Trouble",
  monitoring: "Monitoring",
  smoke_detector: "Smoke Detector",
  heat_detector: "Heat Detector",
  pull_station: "Pull Station",
  horn_strobe: "Horn/Strobe",
  sprinkler_head: "Sprinkler Head",
  valve: "Valve",
  signage: "Signage",
  documentation: "Documentation",
  other: "Other",
};

// ── dates ────────────────────────────────────────────────────────────────

/** "2026-09-11" is a calendar date, not an instant — keep it out of UTC. */
function parseDate(s?: string | null): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function longDate(s?: string | null): string {
  const d = parseDate(s);
  return d
    ? d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "—";
}

function shortDate(s?: string | null): string {
  const d = parseDate(s);
  return d ? d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "";
}

const dash = (v?: string | null) => (v && v.trim() ? v : "-");

// ── page chrome ──────────────────────────────────────────────────────────

function Page({ n, fixed, children }: { n: number; fixed?: boolean; children: React.ReactNode }) {
  return (
    <section
      className={`rpt-page ${fixed ? "rpt-fixed" : ""} bg-white shadow-sm mx-auto mb-6 flex flex-col relative`}
    >
      <div className="rpt-bar" style={{ background: SLATE }} />
      <div className="px-10 pt-6 pb-4 flex-1">{children}</div>
      <div className="rpt-foot mt-auto flex items-end justify-between px-10 pb-3">
        <div className="rpt-bar-b" style={{ background: SLATE }} />
        <span className="rpt-pageno" style={{ color: "#C9CFD6" }}>
          {String(n).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
}

/** The grey band with a bold caps title — every section of the report opens with one. */
function Band({ title }: { title: string }) {
  return (
    <div
      className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-900 mb-2"
      style={{ background: BAND }}
    >
      {title}
    </div>
  );
}

/** Short orange rule over a small label over a value — the cover's rhythm. */
function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="h-[2px] w-16 mb-1.5" style={{ background: ORANGE }} />
      <div className="text-[9.5px] text-gray-600 mb-0.5">{label}</div>
      <div className="text-[12.5px] text-gray-900 leading-snug">{children}</div>
    </div>
  );
}

function KV({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex gap-2 text-[9.5px] leading-[1.45]">
      <span className="text-gray-600 w-[72px] shrink-0">{k}:</span>
      <span className="text-gray-900 break-words min-w-0">{dash(v)}</span>
    </div>
  );
}

function ResultDot({ result }: { result: "pass" | "fail" | "" | null | undefined }) {
  if (result === "pass")
    return (
      <span className="inline-flex items-center gap-1 text-gray-900">
        <span className="w-[6px] h-[6px] rounded-full bg-green-600" />
        Passed
      </span>
    );
  if (result === "fail")
    return (
      <span className="inline-flex items-center gap-1 text-gray-900">
        <span className="w-[6px] h-[6px] rounded-full bg-red-600" />
        Failed
      </span>
    );
  return <span className="text-gray-400">Not tested</span>;
}

function TestedBy({
  name,
  signature = false,
}: {
  name: string;
  signature?: boolean;
}) {
  return (
    <div>
      <div className="h-[2px] w-16 mb-1.5" style={{ background: ORANGE }} />
      <div className="text-[10px] text-gray-700">Tested By:</div>
      {signature && (
        <div className="h-10 mt-1 mb-1 border-b border-gray-300 w-44" />
      )}
      <div className="text-[11px] font-bold text-gray-900 mt-0.5">{name}</div>
      <div className="text-[8.5px] text-gray-700 leading-[1.4]">
        {COMPANY.name}
        <br />
        {COMPANY.address}
        <br />
        {COMPANY.city}, {COMPANY.state} {COMPANY.zip}
      </div>
    </div>
  );
}

// ── the document ─────────────────────────────────────────────────────────

export default function InspectionReportDocument({
  inspection,
  portalUrl,
}: {
  inspection: ReportInspection;
  /** Where the cover QR code points. Omit to leave the QR off. */
  portalUrl?: string;
}) {
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => {
    if (!portalUrl) return;
    QRCode.toDataURL(portalUrl, { margin: 0, width: 220, color: { dark: "#1F2937", light: "#FFFFFF" } })
      .then(setQr)
      .catch(() => setQr(null));
  }, [portalUrl]);

  const std = reportStandard(inspection.inspection_type);
  const typeLabel = INSPECTION_TYPE_LABELS[inspection.inspection_type] || inspection.inspection_type;
  const address = fullSiteAddress(inspection);
  const inspectorName = inspection.inspector?.full_name || COMPANY.name;
  const completedOn = inspection.actual_end_time || inspection.scheduled_date;
  const equipment: EquipmentRow[] = hydrateEquipment(inspection.equipment);
  const checklist = inspection.checklist_results || [];
  const deficiencies = inspection.deficiencies || [];
  const photos = inspection.photos || [];
  const isEquipment = usesEquipmentLog(inspection.inspection_type);

  const overall: "pass" | "fail" | "" =
    inspection.passed === true ? "pass" : inspection.passed === false ? "fail" : "";
  const statusText =
    overall === "pass"
      ? inspection.pass_with_deficiencies
        ? "Passed with deficiencies"
        : "Passed"
      : overall === "fail"
        ? "Failed"
        : inspection.status === "completed"
          ? "Completed"
          : "In progress";

  // Testing summary — counts from the device log or from the checklist.
  const summary = isEquipment
    ? {
        total: equipment.length,
        tested: equipment.filter((e) => e.result).length,
        passed: equipment.filter((e) => e.result === "pass").length,
        failed: equipment.filter((e) => e.result === "fail").length,
      }
    : {
        total: checklist.length,
        tested: checklist.filter((c) => c.passed !== null).length,
        passed: checklist.filter((c) => c.passed === true).length,
        failed: checklist.filter((c) => c.passed === false).length,
      };
  const pct = (n: number) => (summary.total ? `${Math.round((n / summary.total) * 100)}%` : "0%");

  // Checklist grouped by category, in first-seen order.
  const groups: Array<{ category: string; items: ReportChecklistItem[] }> = [];
  for (const item of checklist) {
    let g = groups.find((x) => x.category === item.category);
    if (!g) {
      g = { category: item.category, items: [] };
      groups.push(g);
    }
    g.items.push(item);
  }

  // Assemble the pages, then number them.
  const pages: Array<{ fixed: boolean; content: React.ReactNode }> = [];
  // Cover, information, summary and conclusion are one sheet each and keep
  // their footer at the bottom; the log, checklist and photo pages flow.
  const fixedPage = (content: React.ReactNode) => pages.push({ fixed: true, content });
  const flowPage = (content: React.ReactNode) => pages.push({ fixed: false, content });

  // 1 — cover
  fixedPage(
    <div className="flex flex-col h-full">
      <img src="/csf_wide_logo.png" alt={COMPANY.name} className="h-14 w-auto mb-8 mt-2" />
      <h1 className="text-[24px] font-bold text-gray-900 mb-6">Inspection Report</h1>

      <div className="space-y-5 mb-8">
        <Labeled label="Presented To">{inspection.customer_name}</Labeled>
        <Labeled label="For">
          {inspection.customer_name}
          <br />
          {inspection.site_address}
          <br />
          {[inspection.site_city, [inspection.site_state, inspection.site_zip].filter(Boolean).join(" ")]
            .filter(Boolean)
            .join(", ")}
        </Labeled>
      </div>

      <div className="-mx-10 px-10 py-5 flex gap-6 items-stretch" style={{ background: BAND }}>
        <SiteMap address={address} width={300} height={190} className="shrink-0 rounded-sm" />
        <div className="flex-1 flex flex-col justify-center gap-4 text-[10.5px] text-gray-900">
          <p className="font-bold leading-snug">
            This site has been inspected
            <br />
            and tested in compliance
            <br />
            with applicable standards.
          </p>
          <div>
            <div className="text-gray-600">Completed:</div>
            <div className="font-bold">{longDate(completedOn)}</div>
          </div>
          <div>
            <div className="text-gray-600">Inspection Status:</div>
            <div className="font-bold">{statusText}</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <TestedBy name={inspectorName} />
      </div>

      {qr && (
        <div className="mt-auto flex items-end justify-end gap-3 pt-10">
          <div className="text-right text-[8px] leading-[1.35] text-gray-700">
            Scan Code to Access
            <br />
            <span className="font-bold">Customer Portal</span>
          </div>
          <div
            className="w-[86px] h-[86px] rounded-full border-2 flex items-center justify-center bg-white"
            style={{ borderColor: SLATE }}
          >
            <img src={qr} alt="QR code to customer portal" className="w-[50px] h-[50px]" />
          </div>
        </div>
      )}
    </div>
  );

  // 2 — inspection information
  fixedPage(
    <div>
      <h2 className="text-[16px] font-bold text-gray-900 mb-5">Inspection Information</h2>

      <Band title="Customer Information" />
      <div className="grid grid-cols-2 gap-x-8 px-2 mb-6">
        <div>
          <KV k="Name" v={inspection.customer_name} />
          <KV k="City" v={inspection.site_city} />
          <KV k="ZIP" v={inspection.site_zip} />
          <KV k="Contact" v={inspection.contact_name} />
        </div>
        <div>
          <KV k="Address" v={inspection.site_address} />
          <KV k="State" v={inspection.site_state} />
          <KV k="Phone" v={inspection.contact_phone} />
          <KV k="Email" v={inspection.contact_email} />
        </div>
      </div>

      <Band title="Building Information" />
      <div className="grid grid-cols-2 gap-x-8 px-2 mb-6">
        <div>
          <KV k="Name" v={inspection.customer_name} />
          <KV k="Address" v={inspection.site_address} />
          <KV k="State" v={inspection.site_state} />
        </div>
        <div>
          <KV k="Inspection" v={typeLabel} />
          <KV k="City" v={inspection.site_city} />
          <KV k="ZIP" v={inspection.site_zip} />
        </div>
      </div>

      <Band title="Inspection Details" />
      <div className="grid grid-cols-2 gap-x-8 px-2 mb-6">
        <div>
          <KV k="Report #" v={inspection.inspection_number} />
          <KV k="Scheduled" v={shortDate(inspection.scheduled_date)} />
          <KV k="Inspector" v={inspectorName} />
        </div>
        <div>
          <KV k="Standard" v={std.standard} />
          <KV k="Completed" v={shortDate(completedOn)} />
          <KV k="Status" v={statusText} />
        </div>
      </div>

      <Band title="Company Information" />
      <div className="grid grid-cols-2 gap-x-8 px-2">
        <div>
          <KV k="Name" v={COMPANY.name} />
          <KV k="City" v={COMPANY.city} />
          <KV k="Zip" v={COMPANY.zip} />
          <KV k="Email" v={COMPANY.email} />
        </div>
        <div>
          <KV k="Address" v={COMPANY.address} />
          <KV k="State" v={COMPANY.state} />
          <KV k="License" v={COMPANY.license} />
          <KV k="Phone" v={COMPANY.phone} />
        </div>
      </div>
    </div>
  );

  // 3 — testing summary + standard
  fixedPage(
    <div className="flex flex-col h-full">
      <Band title="Testing Summary" />
      <table className="w-full text-[9.5px] mb-6 rpt-table">
        <thead>
          <tr className="text-gray-700 uppercase text-[8.5px]">
            <th className="text-left px-2 py-1 font-medium">Equipment Type</th>
            <th className="text-left px-2 py-1 font-medium">Total</th>
            <th className="text-left px-2 py-1 font-medium">Tested</th>
            <th className="text-left px-2 py-1 font-medium">Passed</th>
            <th className="text-left px-2 py-1 font-medium">Failed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-2 py-1">{std.equipment}</td>
            <td className="px-2 py-1">{summary.total}</td>
            <td className="px-2 py-1">
              {summary.tested} ({pct(summary.tested)})
            </td>
            <td className="px-2 py-1">
              {summary.passed} ({pct(summary.passed)})
            </td>
            <td className="px-2 py-1">
              {summary.failed} ({pct(summary.failed)})
            </td>
          </tr>
        </tbody>
      </table>

      <Band title={`${COMPANY.name} - ${std.serviceName} Report`} />
      <p className="text-[9.5px] text-gray-800 leading-[1.5] px-2">
        This inspection was conducted in accordance with <b>{std.standard} Standards</b>
        {std.alsoPer ? `, ${std.alsoPer},` : ""} and the codes established by the local Authorities
        Having Jurisdiction for the site inspected. According to law governing fire codes,{" "}
        <b>{COMPANY.name}</b> is required by the State of Texas to report any deficiencies found during
        this inspection to the Authorities Having Jurisdiction. If you have any questions regarding this
        report or require additional services, please contact our Service Team at{" "}
        <b>{COMPANY.phone}</b> or <b className="underline">{COMPANY.email}</b>.
      </p>

      {deficiencies.length > 0 && (
        <div className="mt-6">
          <Band title={`Deficiencies Found (${deficiencies.length})`} />
          <table className="w-full text-[9px] rpt-table">
            <thead>
              <tr className="text-gray-700 uppercase text-[8px]">
                <th className="text-left px-2 py-1 font-medium w-6">#</th>
                <th className="text-left px-2 py-1 font-medium">Category</th>
                <th className="text-left px-2 py-1 font-medium">Severity</th>
                <th className="text-left px-2 py-1 font-medium">Location</th>
                <th className="text-left px-2 py-1 font-medium">Description</th>
                <th className="text-left px-2 py-1 font-medium">Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {deficiencies.map((d, i) => (
                <tr key={d.id} className="rpt-row">
                  <td className="px-2 py-1 align-top">{i + 1}</td>
                  <td className="px-2 py-1 align-top">{categoryLabels[d.category] || d.category}</td>
                  <td className="px-2 py-1 align-top capitalize">
                    <span
                      className={
                        d.severity === "critical"
                          ? "text-red-700 font-semibold"
                          : d.severity === "major"
                            ? "text-orange-700 font-semibold"
                            : "text-yellow-700 font-semibold"
                      }
                    >
                      {d.severity}
                    </span>
                  </td>
                  <td className="px-2 py-1 align-top">{dash(d.location)}</td>
                  <td className="px-2 py-1 align-top">{d.description}</td>
                  <td className="px-2 py-1 align-top">{dash(d.recommended_action)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-auto pt-10 pl-40">
        <TestedBy name={inspectorName} signature />
      </div>
    </div>
  );

  // 4 — equipment log (extinguishers)
  if (isEquipment) {
    const cols = ["Location", "Specification", "Information", "Dates", "Service", "Result", "Notes"];
    flowPage(
      <div>
        <h2 className="text-[15px] font-bold mb-2" style={{ color: SLATE }}>
          {std.equipment}
        </h2>
        {equipment.length === 0 ? (
          <p className="text-[10px] text-gray-500 px-2">No devices were logged for this inspection.</p>
        ) : (
          <table className="w-full text-[8.5px] rpt-table rpt-equip">
            <thead>
              <tr className="text-[8px] font-semibold" style={{ color: SLATE, background: BAND }}>
                {cols.map((c) => (
                  <th key={c} className="text-left px-1.5 py-1 font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {equipment.map((e) => (
                <tr key={e.id} className="rpt-row align-top">
                  <td className="px-1.5 py-1.5 w-[15%]">
                    <Mini label="Location" value={e.location} big />
                  </td>
                  <td className="px-1.5 py-1.5 w-[15%]">
                    <Mini label="Type/Make/Model" value={e.make_model} big />
                  </td>
                  <td className="px-1.5 py-1.5 w-[15%]">
                    <Mini label="Serial #" value={e.serial} />
                    <Mini label="Size" value={e.size} />
                    <Mini label="Type" value={e.type} />
                    <Mini label="Mfg Date" value={e.mfg_date} />
                  </td>
                  <td className="px-1.5 py-1.5 w-[15%]">
                    <Mini label="Last Hydro Date" value={e.last_hydro} />
                    <Mini label="Next Hydro Date" value={e.next_hydro} />
                    <Mini label="Next Six Year" value={e.next_six_year} />
                  </td>
                  <td className="px-1.5 py-1.5 w-[15%]">
                    <Mini label="Serviced" value={e.serviced} />
                    <Mini label="Parts Required" value={e.parts_required} />
                  </td>
                  <td className="px-1.5 py-1.5 w-[12%]">
                    <div className="text-[7.5px] text-gray-500">Result</div>
                    <div className="text-[9px]">
                      <ResultDot result={e.result} />
                    </div>
                  </td>
                  <td className="px-1.5 py-1.5 w-[13%]">
                    <Mini label="Number" value={e.number} />
                    {e.notes && <Mini label="Notes" value={e.notes} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // 5 — checklist as a Yes/No table (every type that has one)
  if (checklist.length > 0) {
    let n = 0;
    flowPage(
      <div>
        <h2 className="text-[15px] font-bold mb-2" style={{ color: SLATE }}>
          {isEquipment ? "Site Inspection" : `${std.serviceName}`}
        </h2>
        <table className="w-full text-[9px] rpt-table">
          <tbody>
            {groups.map((g) => (
              <Fragment key={g.category}>
                <tr>
                  <td colSpan={2} className="px-2 py-1 text-[11px] font-bold" style={{ background: BAND, color: SLATE }}>
                    {g.category}
                  </td>
                </tr>
                {g.items.map((item) => {
                  n += 1;
                  return (
                    <tr key={item.id} className="rpt-row">
                      <td className="px-2 py-[3px]">
                        {n}. {item.item}
                        {item.notes && <span className="text-gray-500"> — {item.notes}</span>}
                      </td>
                      <td className="px-2 py-[3px] w-[30%]">
                        {item.passed === true ? "Yes" : item.passed === false ? "No" : "-"}
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
            <tr>
              <td colSpan={2} className="px-2 py-1 text-[11px] font-bold" style={{ background: BAND, color: SLATE }}>
                Result
              </td>
            </tr>
            <tr className="rpt-row">
              <td className="px-2 py-[3px]" />
              <td className="px-2 py-[3px]">
                <ResultDot result={overall} />
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="px-2 py-1 text-[11px] font-bold" style={{ background: BAND, color: SLATE }}>
                Notes
              </td>
            </tr>
            <tr className="rpt-row">
              <td className="px-2 py-[3px]">Comments</td>
              <td className="px-2 py-[3px] whitespace-pre-wrap">{dash(inspection.notes)}</td>
            </tr>
            {inspection.fire_marshal_notes && (
              <tr className="rpt-row">
                <td className="px-2 py-[3px]">Fire Marshal Notes</td>
                <td className="px-2 py-[3px] whitespace-pre-wrap">{inspection.fire_marshal_notes}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  } else if (!isEquipment) {
    flowPage(
      <div>
        <h2 className="text-[15px] font-bold mb-2" style={{ color: SLATE }}>
          {std.serviceName}
        </h2>
        <p className="text-[10px] text-gray-500 px-2">No checklist was recorded for this inspection.</p>
        {inspection.notes && (
          <p className="text-[9.5px] text-gray-800 px-2 mt-3 whitespace-pre-wrap">{inspection.notes}</p>
        )}
      </div>
    );
  }

  // 6 — photos
  if (photos.length > 0) {
    flowPage(
      <div>
        <h2 className="text-[15px] font-bold text-gray-900 mb-2">Comments</h2>
        <table className="w-full text-[9px] rpt-table">
          <thead>
            <tr className="text-[8.5px] font-bold uppercase" style={{ background: BAND }}>
              <th className="text-left px-2 py-1 w-[10%]">Number</th>
              <th className="text-left px-2 py-1">Comment</th>
              <th className="text-left px-2 py-1 w-[30%]">Image</th>
            </tr>
          </thead>
          <tbody>
            {photos.map((p, i) => (
              <tr key={p.id} className="rpt-row align-middle">
                <td className="px-2 py-2">{p.device_tag || i + 1}</td>
                <td className="px-2 py-2">
                  {p.caption || ""}
                  {p.location && <div className="text-gray-500">{p.location}</div>}
                </td>
                <td className="px-2 py-2">
                  <img
                    src={p.photo_url}
                    alt={p.caption || "Inspection photo"}
                    className="w-[150px] h-[150px] object-cover"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 7 — conclusion
  fixedPage(
    <div className="flex flex-col h-full">
      <img src="/csf_wide_logo.png" alt={COMPANY.name} className="h-14 w-auto mb-8 mt-2" />
      <h2 className="text-[22px] font-bold text-gray-900 mb-5">Conclusion</h2>
      <div className="text-[9.5px] text-gray-800 leading-[1.55] space-y-4 max-w-[92%]">
        <p>
          Thank you for trusting <b>{COMPANY.name}</b> to provide the <b>{std.serviceName}</b> for
          your site. Please see the attached report for detailed information on your system, each
          device inspected, its &ldquo;Pass or Fail&rdquo; status, and any applicable comments or
          recommendations. All of the inspection information has been stored on our secure servers and
          is also available to you through the customer portal linked by the QR code on the cover of
          this report. If you have any questions regarding our findings, please contact us.
        </p>
        <p>
          The proper design and installation of fire protection and other life safety systems is the
          first step in protecting lives and property. {COMPANY.name} delivers a new caliber of
          professionalism and expertise to every client, no matter the size of the company or the
          project at hand. We offer competitive pricing backed by years of expertise and knowledge,
          without sacrificing the quality and service that has been our standard since 2009.
        </p>
        <p>
          With a commitment to meeting our customers&apos; needs, {COMPANY.name} provides a
          comprehensive range of inspection services tailored to ensure the ongoing effectiveness of
          these critical systems, including the installation, inspection, maintenance and repair of:
        </p>
        <ul className="list-disc pl-6 space-y-0.5">
          <li>Fire alarm systems</li>
          <li>Fire sprinkler systems</li>
          <li>Fire extinguishers</li>
          <li>Kitchen hood suppression systems</li>
          <li>Emergency lighting and exit signs</li>
          <li>Fire lane marking and fire marshal compliance</li>
          <li>Security, access control, and video surveillance</li>
        </ul>
        <p>
          For more information on any of our services, please call <b>{COMPANY.phone}</b> or visit us
          online at <b className="underline">{COMPANY.website}</b>. We appreciate your business and
          look forward to serving you again.
        </p>
      </div>

      <div className="mt-auto pt-12">
        <TestedBy name={inspectorName} signature />
      </div>
    </div>
  );

  return (
    <div className="rpt-root">
      <style>{`
        .rpt-page { width: 8.5in; min-height: 11in; }
        .rpt-bar { height: 7px; margin: 0 6px; }
        .rpt-bar-b { height: 7px; flex: 1; margin-right: 18px; margin-bottom: 8px; }
        .rpt-pageno { font-size: 26px; font-weight: 700; line-height: 1; }
        .rpt-table { border-collapse: collapse; }
        .rpt-table thead tr { border-bottom: 1px solid ${RULE}; }
        .rpt-table .rpt-row { border-bottom: 1px solid #EDF0F3; break-inside: avoid; page-break-inside: avoid; }
        .rpt-equip tbody tr:nth-child(odd) { background: #F7F8FA; }
        @media print {
          @page { size: letter; margin: 0.3in; }
          body { background: #fff; }
          .no-print { display: none !important; }
          /* Hide the app chrome around the document; bring the document back. */
          body * { visibility: hidden; }
          .rpt-root, .rpt-root * { visibility: visible; }
          .rpt-root { position: absolute; left: 0; top: 0; width: 100%; }
          .rpt-page {
            width: auto; min-height: 0; box-shadow: none; margin: 0;
            page-break-after: always; break-after: page;
          }
          /* Letter less the 0.3in page margins is 10.4in; stay safely under
             it so a fixed page never spills a blank sheet. */
          .rpt-fixed { min-height: 10.1in; }
          .rpt-page:last-child { page-break-after: auto; break-after: auto; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      {pages.map((p, i) => (
        <Page key={i} n={i + 1} fixed={p.fixed}>
          {p.content}
        </Page>
      ))}
    </div>
  );
}

/** A tiny grey label over its value — the cell style of the device log. */
function Mini({ label, value, big = false }: { label: string; value?: string; big?: boolean }) {
  return (
    <div className="mb-1">
      <div className="text-[7.5px] text-gray-500 leading-tight">{label}</div>
      <div className={`${big ? "text-[9.5px]" : "text-[9px]"} text-gray-900 leading-snug break-words`}>
        {dash(value)}
      </div>
    </div>
  );
}

