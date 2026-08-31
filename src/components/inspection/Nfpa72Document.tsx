/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Nfpa72Form,
  TRANSMISSION_TYPES,
  SERVICE_FREQUENCIES,
  BATTERY_TYPES,
  CERTIFICATION,
  NFPA_ATTRIBUTION,
} from "@/lib/nfpa72";

// The finished Inspection and Testing Form, laid out for paper.
//
// Same approach as the agreement: print rules put the page breaks where the
// NFPA figure puts them, so "Save as PDF" out of the browser produces the
// seven-page document a fire marshal expects. No PDF library, and what the
// tech sees on screen is exactly what prints.

const NAVY = "#0D1B2A";
const ORANGE = "#E85D04";

const PAGES = 7;

function PageChrome({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <section className="nfpa-page bg-white shadow-sm mx-auto mb-6 flex flex-col">
      <div
        className="flex items-center justify-between px-6 py-2.5 text-white text-[11px]"
        style={{ background: NAVY, borderBottom: `3px solid ${ORANGE}` }}
      >
        <span className="flex items-center gap-2 font-semibold tracking-wide">
          <img src="/logo_only.png" alt="" className="h-5 w-auto" />
          CHATMAN SECURITY &amp; FIRE
        </span>
        <span className="text-white/70">INSPECTION AND TESTING FORM</span>
      </div>

      <div className="px-8 pt-5 flex-1">{children}</div>

      <div className="mt-auto px-8 pt-4 pb-3 flex justify-between items-end text-[9px] text-gray-400 border-t border-gray-200 mx-8">
        <span>
          {NFPA_ATTRIBUTION} · Reproduced for individual use under NFPA&apos;s copyright notice
        </span>
        <span className="font-medium text-gray-500">
          Page {n} of {PAGES}
        </span>
      </div>
    </section>
  );
}

/** Orange rule + heading — the section marker used throughout the document. */
function Section({ title, className = "" }: { title: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 mb-2 ${className}`}>
      <span className="h-[3px] w-4 rounded-full" style={{ background: ORANGE }} />
      <h3 className="text-[10px] font-bold tracking-[0.12em] text-gray-900 uppercase">{title}</h3>
      <span className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

/** Label above a filled value on a ruled line — reads like a form, prints clean. */
function Field({
  label,
  value,
  className = "",
}: {
  label: string;
  value?: string;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="text-[8px] font-semibold uppercase tracking-wider text-gray-400">{label}</div>
      <div className="text-[10.5px] text-gray-900 border-b border-gray-300 pb-[2px] min-h-[15px] break-words">
        {value || <span className="text-gray-300">—</span>}
      </div>
    </div>
  );
}

function Check({ on }: { on?: boolean }) {
  return (
    <span
      className="inline-block w-[9px] h-[9px] rounded-[2px] border align-middle"
      style={
        on
          ? { background: ORANGE, borderColor: ORANGE }
          : { background: "#fff", borderColor: "#9CA3AF" }
      }
    />
  );
}

/** A "☐ Label" pair used for the option strips (transmission type, battery, etc.). */
function Option({ on, label }: { on?: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 mr-4">
      <Check on={on} />
      <span className={`text-[10px] ${on ? "font-semibold text-gray-900" : "text-gray-500"}`}>
        {label}
      </span>
    </span>
  );
}

const TH = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => (
  <th
    className={`text-[8px] font-bold uppercase tracking-wider text-gray-500 px-2 py-1.5 text-left ${className}`}
  >
    {children}
  </th>
);

const TD = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => (
  <td className={`px-2 py-[5px] text-[10px] text-gray-900 align-middle ${className}`}>{children}</td>
);

const Table = ({ children }: { children: React.ReactNode }) => (
  <table className="w-full border-collapse nfpa-table">{children}</table>
);

const val = (s?: string) => (s ? s : <span className="text-gray-300">—</span>);

export default function Nfpa72Document({
  form,
  inspectionNumber,
}: {
  form: Nfpa72Form;
  inspectionNumber?: string;
}) {
  return (
    <div className="nfpa-root">
      <style>{`
        .nfpa-page { width: 8.5in; min-height: 11in; padding-bottom: 0.35in; }
        .nfpa-table tbody tr { border-bottom: 1px solid #F1F3F5; }
        .nfpa-table tbody tr:last-child { border-bottom: 0; }
        .nfpa-table thead tr { border-bottom: 1.5px solid #E5E7EB; }
        .nfpa-table tbody tr:nth-child(even) { background: #FAFBFC; }
        @media print {
          @page { size: letter; margin: 0.35in; }
          body { background: #fff; }
          .no-print { display: none !important; }
          /* The admin sidebar and chrome live outside this component and know
             nothing about printing. Hide everything, then bring the document
             back — the same technique the older report page uses. */
          body * { visibility: hidden; }
          .nfpa-root, .nfpa-root * { visibility: visible; }
          .nfpa-root { position: absolute; left: 0; top: 0; width: 100%; }
          .nfpa-page {
            width: auto; min-height: 0; box-shadow: none; margin: 0; padding: 0;
            page-break-after: always; break-after: page;
          }
          .nfpa-page:last-child { page-break-after: auto; break-after: auto; }
          .nfpa-table tbody tr:nth-child(even) { background: #FAFBFC !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* ── PAGE 1 — identification ─────────────────────────────── */}
      <PageChrome n={1}>
        <div className="text-center pb-4 mb-4" style={{ borderBottom: `2px solid ${ORANGE}` }}>
          <h1 className="text-[19px] font-bold tracking-tight text-gray-900">
            FIRE ALARM SYSTEM INSPECTION &amp; TESTING
          </h1>
          <p className="text-[9.5px] text-gray-500 mt-1 tracking-wide">
            Fire Alarm • Fire Sprinkler • Underground Fire Line • Life Safety
            {inspectionNumber ? ` · Report ${inspectionNumber}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-5">
          <Field label="Date" value={form.date} />
          <Field label="Time" value={form.time} />
        </div>

        <div className="grid grid-cols-2 gap-x-8">
          {/* left column */}
          <div className="space-y-4">
            <div>
              <Section title="Service Organization" />
              <div className="space-y-2">
                <Field label="Name" value={form.service_org.name} />
                <Field label="Address" value={form.service_org.address} />
                <Field label="Representative" value={form.service_org.representative} />
                <div className="grid grid-cols-2 gap-x-4">
                  <Field label="License No." value={form.service_org.license_no} />
                  <Field label="Telephone" value={form.service_org.telephone} />
                </div>
              </div>
            </div>

            <div>
              <Section title="Monitoring Entity" />
              <div className="space-y-2">
                <Field label="Contact" value={form.monitoring.contact} />
                <div className="grid grid-cols-2 gap-x-4">
                  <Field label="Telephone" value={form.monitoring.telephone} />
                  <Field label="Account Ref. No." value={form.monitoring.account_ref} />
                </div>
              </div>
            </div>

            <div>
              <Section title="Type of Transmission" />
              <div className="leading-6 mb-2">
                {TRANSMISSION_TYPES.map((t) => (
                  <Option key={t} on={form.transmission.includes(t)} label={t} />
                ))}
              </div>
              <Field label="Other (Specify)" value={form.transmission_other} />
            </div>
          </div>

          {/* right column */}
          <div className="space-y-4">
            <div>
              <Section title="Property Name (User)" />
              <div className="space-y-2">
                <Field label="Name" value={form.property.name} />
                <Field label="Address" value={form.property.address} />
                <Field label="Owner Contact" value={form.property.owner_contact} />
                <Field label="Telephone" value={form.property.telephone} />
              </div>
            </div>

            <div>
              <Section title="Approving Agency" />
              <div className="space-y-2">
                <Field label="Contact" value={form.approving_agency.contact} />
                <Field label="Telephone" value={form.approving_agency.telephone} />
              </div>
            </div>

            <div>
              <Section title="Service" />
              <div className="leading-6 mb-2">
                {SERVICE_FREQUENCIES.map((s) => (
                  <Option key={s} on={form.service_frequency === s} label={s} />
                ))}
              </div>
              <Field label="Other (Specify)" value={form.service_other} />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <Section title="Fire Alarm Control Unit" />
          <div className="grid grid-cols-3 gap-x-5 gap-y-2">
            <Field label="Manufacturer" value={form.control_unit.manufacturer} />
            <Field label="Model No." value={form.control_unit.model_no} />
            <Field label="Circuit Styles" value={form.control_unit.circuit_styles} />
            <Field label="Number of Circuits" value={form.control_unit.number_of_circuits} />
            <Field label="Software Rev." value={form.control_unit.software_rev} />
          </div>
          <div className="grid grid-cols-2 gap-x-5 mt-3">
            <Field label="Last Date System Had Any Service Performed" value={form.last_service_date} />
            <Field
              label="Last Date Software or Configuration Was Revised"
              value={form.last_config_revision_date}
            />
          </div>
        </div>
      </PageChrome>

      {/* ── PAGE 2 — initiating devices + notification appliances ─── */}
      <PageChrome n={2}>
        <Section title="Alarm-Initiating Devices and Circuit Information" />
        <Table>
          <thead>
            <tr>
              <TH className="w-[38%]">Device Type</TH>
              <TH className="w-[20%] text-center">Qty Installed</TH>
              <TH className="w-[20%] text-center">Circuit Style</TH>
              <TH className="w-[22%] text-center">Qty Tested</TH>
            </tr>
          </thead>
          <tbody>
            {form.initiating.map((r, i) => (
              <tr key={i}>
                <TD className="font-medium">
                  {r.label}
                  {r.specify ? <span className="text-gray-500"> — {r.specify}</span> : null}
                </TD>
                <TD className="text-center">{val(r.qty_installed)}</TD>
                <TD className="text-center">{val(r.circuit_style)}</TD>
                <TD className="text-center">{val(r.qty_tested)}</TD>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="mt-3 mb-5 text-[10px]">
          <span className="font-semibold text-gray-700 mr-3">Alarm verification feature is</span>
          <Option on={form.alarm_verification === "disabled"} label="Disabled" />
          <Option on={form.alarm_verification === "enabled"} label="Enabled" />
        </div>

        <Section title="Alarm Notification Appliances and Circuit Information" />
        <Table>
          <thead>
            <tr>
              <TH className="w-[38%]">Appliance Type</TH>
              <TH className="w-[20%] text-center">Qty Installed</TH>
              <TH className="w-[20%] text-center">Circuit Style</TH>
              <TH className="w-[22%] text-center">Qty Tested</TH>
            </tr>
          </thead>
          <tbody>
            {form.notification.map((r, i) => (
              <tr key={i}>
                <TD className="font-medium">
                  {r.label}
                  {r.specify ? <span className="text-gray-500"> — {r.specify}</span> : null}
                </TD>
                <TD className="text-center">{val(r.qty_installed)}</TD>
                <TD className="text-center">{val(r.circuit_style)}</TD>
                <TD className="text-center">{val(r.qty_tested)}</TD>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="mt-4 grid grid-cols-2 gap-x-8 items-end">
          <Field
            label="No. of Alarm Notification Appliance Circuits"
            value={form.nac_circuit_count}
          />
          <div className="text-[10px] pb-[2px]">
            <span className="font-semibold text-gray-700 mr-3">
              Are circuits monitored for integrity?
            </span>
            <Option on={form.circuits_monitored === "yes"} label="Yes" />
            <Option on={form.circuits_monitored === "no"} label="No" />
          </div>
        </div>
      </PageChrome>

      {/* ── PAGE 3 — supervisory devices, SLC, power ──────────────── */}
      <PageChrome n={3}>
        <Section title="Supervisory Signal-Initiating Devices and Circuit Information" />
        <Table>
          <thead>
            <tr>
              <TH className="w-[46%]">Device Type</TH>
              <TH className="w-[18%] text-center">Qty Installed</TH>
              <TH className="w-[18%] text-center">Circuit Style</TH>
              <TH className="w-[18%] text-center">Qty Tested</TH>
            </tr>
          </thead>
          <tbody>
            {form.supervisory.map((r, i) => (
              <tr key={i}>
                <TD className="font-medium">
                  {r.label}
                  {r.specify ? <span className="text-gray-500"> — {r.specify}</span> : null}
                </TD>
                <TD className="text-center">{val(r.qty_installed)}</TD>
                <TD className="text-center">{val(r.circuit_style)}</TD>
                <TD className="text-center">{val(r.qty_tested)}</TD>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="mt-5">
          <Section title="Signaling Line Circuits" />
          <p className="text-[9px] text-gray-500 mb-2 italic">
            Quantity and style of signaling line circuits connected to system (see NFPA 72, Table
            6.6.1)
          </p>
          <div className="grid grid-cols-2 gap-x-8">
            <Field label="Quantity" value={form.slc.quantity} />
            <Field label="Style(s)" value={form.slc.styles} />
          </div>
        </div>

        <div className="mt-5">
          <Section title="System Power Supplies" />
          <p className="text-[9px] font-semibold text-gray-600 mb-2">(a) Primary (Main)</p>
          <div className="grid grid-cols-4 gap-x-4 gap-y-2">
            <Field label="Nominal Voltage" value={form.power.primary_voltage} />
            <Field label="Amps" value={form.power.primary_amps} />
            <Field label="Overcurrent Protection Type" value={form.power.overcurrent_type} />
            <Field label="Overcurrent Amps" value={form.power.overcurrent_amps} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 mt-2">
            <Field label="Location of Primary Supply Panelboard" value={form.power.panelboard_location} />
            <Field label="Disconnecting Means Location" value={form.power.disconnect_location} />
          </div>

          <p className="text-[9px] font-semibold text-gray-600 mt-4 mb-2">(b) Secondary (Standby)</p>
          <div className="grid grid-cols-4 gap-x-4 gap-y-2">
            <Field label="Nominal Voltage" value={form.power.secondary_voltage} />
            <Field label="Storage Battery Amp-Hr Rating" value={form.power.battery_amp_hr} />
            <Field label="Calculated Capacity (Amp-Hrs)" value={form.power.calculated_capacity} />
            <Field label="To Operate System For (Hours)" value={form.power.capacity_hours} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 mt-2">
            <Field
              label="Engine-Driven Generator Dedicated to Fire Alarm System"
              value={form.power.generator}
            />
            <Field label="Location of Fuel Storage" value={form.power.fuel_storage} />
          </div>

          <div className="mt-4">
            <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Type of Battery
            </p>
            <div className="leading-6">
              {BATTERY_TYPES.map((b) => (
                <Option key={b} on={form.battery_type === b} label={b} />
              ))}
            </div>
            {form.battery_type === "Other" && (
              <div className="mt-1">
                <Field label="Other (Specify)" value={form.battery_other} />
              </div>
            )}
          </div>
        </div>
      </PageChrome>

      {/* ── PAGE 4 — standby article, pre-test notices, system tests ─ */}
      <PageChrome n={4}>
        <Section title="Emergency or Standby System Used as Backup to Primary Power" />
        <p className="text-[9px] text-gray-500 mb-2 italic">
          Used instead of a secondary power supply, where applicable.
        </p>
        <div className="space-y-1.5 text-[10px] mb-5">
          {[
            ["700", "Emergency system described in NFPA 70, Article 700"],
            ["701", "Legally required standby described in NFPA 70, Article 701"],
            [
              "702",
              "Optional standby system described in NFPA 70, Article 702, which also meets the performance requirements of Article 700 or 701",
            ],
          ].map(([code, label]) => (
            <div key={code} className="flex items-start gap-2">
              <span className="mt-[3px]">
                <Check on={form.standby_article === code} />
              </span>
              <span
                className={form.standby_article === code ? "font-semibold text-gray-900" : "text-gray-600"}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <Section title="Prior to Any Testing — Notifications Made" />
        <Table>
          <thead>
            <tr>
              <TH className="w-[36%]">Notified</TH>
              <TH className="w-[8%] text-center">Yes</TH>
              <TH className="w-[8%] text-center">No</TH>
              <TH className="w-[26%]">Who</TH>
              <TH className="w-[22%]">Time</TH>
            </tr>
          </thead>
          <tbody>
            {form.pre_test_notifications.map((r, i) => (
              <tr key={i}>
                <TD className="font-medium">{r.label}</TD>
                <TD className="text-center">
                  <Check on={r.answer === "yes"} />
                </TD>
                <TD className="text-center">
                  <Check on={r.answer === "no"} />
                </TD>
                <TD>{val(r.who)}</TD>
                <TD>{val(r.time)}</TD>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="mt-5">
          <Section title="System Tests and Inspections" />
          <Table>
            <thead>
              <tr>
                <TH className="w-[30%]">Type</TH>
                <TH className="w-[10%] text-center">Visual</TH>
                <TH className="w-[12%] text-center">Functional</TH>
                <TH className="w-[48%]">Comments</TH>
              </tr>
            </thead>
            <tbody>
              {form.system_tests.map((r, i) => (
                <tr key={i}>
                  <TD className="font-medium">{r.label}</TD>
                  <TD className="text-center">
                    <Check on={r.visual} />
                  </TD>
                  <TD className="text-center">
                    <Check on={r.functional} />
                  </TD>
                  <TD className="text-gray-600">{val(r.comments)}</TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </PageChrome>

      {/* ── PAGE 5 — secondary power + device test log ─────────────── */}
      <PageChrome n={5}>
        <Section title="Secondary Power and Appliance Tests" />
        <Table>
          <thead>
            <tr>
              <TH className="w-[34%]">Type</TH>
              <TH className="w-[10%] text-center">Visual</TH>
              <TH className="w-[12%] text-center">Functional</TH>
              <TH className="w-[44%]">Comments</TH>
            </tr>
          </thead>
          <tbody>
            {form.secondary_power_tests.map((r, i) => (
              <tr key={i}>
                <TD className="font-medium">{r.label}</TD>
                <TD className="text-center">
                  <Check on={r.visual} />
                </TD>
                <TD className="text-center">
                  <Check on={r.functional} />
                </TD>
                <TD className="text-gray-600">{val(r.comments)}</TD>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="mt-5">
          <Section title="Initiating and Supervisory Device Tests and Inspections" />
          <Table>
            <thead>
              <tr>
                <TH className="w-[16%]">Loc. &amp; S/N</TH>
                <TH className="w-[20%]">Device Type</TH>
                <TH className="w-[9%] text-center">Visual</TH>
                <TH className="w-[10%] text-center">Functional</TH>
                <TH className="w-[15%] text-center">Factory Setting</TH>
                <TH className="w-[15%] text-center">Measured Setting</TH>
                <TH className="w-[7%] text-center">Pass</TH>
                <TH className="w-[8%] text-center">Fail</TH>
              </tr>
            </thead>
            <tbody>
              {form.device_tests.map((r, i) => (
                <tr key={i}>
                  <TD>{val(r.location)}</TD>
                  <TD className="font-medium">{val(r.device_type)}</TD>
                  <TD className="text-center">
                    <Check on={r.visual} />
                  </TD>
                  <TD className="text-center">
                    <Check on={r.functional} />
                  </TD>
                  <TD className="text-center">{val(r.factory_setting)}</TD>
                  <TD className="text-center">{val(r.measured_setting)}</TD>
                  <TD className="text-center">
                    <Check on={r.result === "pass"} />
                  </TD>
                  <TD className="text-center">
                    <Check on={r.result === "fail"} />
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="mt-3">
            <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Comments
            </p>
            <div className="border border-gray-200 rounded-md p-2.5 min-h-[52px] text-[10px] text-gray-800 whitespace-pre-wrap bg-gray-50/60">
              {form.device_tests_comments}
            </div>
          </div>
        </div>
      </PageChrome>

      {/* ── PAGE 6 — emergency comms, combination + special systems ── */}
      <PageChrome n={6}>
        <Section title="Emergency Communications Equipment" />
        <Table>
          <thead>
            <tr>
              <TH className="w-[30%]">Equipment</TH>
              <TH className="w-[10%] text-center">Visual</TH>
              <TH className="w-[12%] text-center">Functional</TH>
              <TH className="w-[48%]">Comments</TH>
            </tr>
          </thead>
          <tbody>
            {form.emergency_comms.map((r, i) => (
              <tr key={i}>
                <TD className="font-medium">{r.label}</TD>
                <TD className="text-center">
                  <Check on={r.visual} />
                </TD>
                <TD className="text-center">
                  <Check on={r.functional} />
                </TD>
                <TD className="text-gray-600">{val(r.comments)}</TD>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="mt-5">
          <Section title="Combination Systems" />
          <Table>
            <thead>
              <tr>
                <TH className="w-[46%]">System</TH>
                <TH className="w-[10%] text-center">Visual</TH>
                <TH className="w-[22%] text-center">Device Operation</TH>
                <TH className="w-[22%] text-center">Simulated Operation</TH>
              </tr>
            </thead>
            <tbody>
              {form.combination_systems.map((r, i) => (
                <tr key={i}>
                  <TD className="font-medium">
                    {r.label}
                    {r.specify ? <span className="text-gray-500"> — {r.specify}</span> : null}
                  </TD>
                  <TD className="text-center">
                    <Check on={r.visual} />
                  </TD>
                  <TD className="text-center">{val(r.device_operation)}</TD>
                  <TD className="text-center">{val(r.simulated_operation)}</TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="grid grid-cols-2 gap-x-8 mt-5">
          <div>
            <Section title="Interface Equipment" />
            <div className="space-y-2">
              {form.interface_equipment.map((s, i) => (
                <Field key={i} label={`(Specify) ${i + 1}`} value={s} />
              ))}
            </div>
          </div>
          <div>
            <Section title="Special Hazard Systems" />
            <div className="space-y-2">
              {form.special_hazard_systems.map((s, i) => (
                <Field key={i} label={`(Specify) ${i + 1}`} value={s} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-8">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Special Procedures
            </p>
            <div className="border border-gray-200 rounded-md p-2.5 min-h-[56px] text-[10px] text-gray-800 whitespace-pre-wrap bg-gray-50/60">
              {form.special_procedures}
            </div>
          </div>
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Comments
            </p>
            <div className="border border-gray-200 rounded-md p-2.5 min-h-[56px] text-[10px] text-gray-800 whitespace-pre-wrap bg-gray-50/60">
              {form.page6_comments}
            </div>
          </div>
        </div>
      </PageChrome>

      {/* ── PAGE 7 — supervising station, sign-off ─────────────────── */}
      <PageChrome n={7}>
        <Section title="Supervising Station Monitoring" />
        <Table>
          <thead>
            <tr>
              <TH className="w-[30%]">Signal</TH>
              <TH className="w-[8%] text-center">Yes</TH>
              <TH className="w-[8%] text-center">No</TH>
              <TH className="w-[18%]">Time</TH>
              <TH className="w-[36%]">Comments</TH>
            </tr>
          </thead>
          <tbody>
            {form.supervising_station.map((r, i) => (
              <tr key={i}>
                <TD className="font-medium">{r.label}</TD>
                <TD className="text-center">
                  <Check on={r.answer === "yes"} />
                </TD>
                <TD className="text-center">
                  <Check on={r.answer === "no"} />
                </TD>
                <TD>{val(r.time)}</TD>
                <TD className="text-gray-600">{val(r.comments)}</TD>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="mt-5">
          <Section title="Notifications That Testing Is Complete" />
          <Table>
            <thead>
              <tr>
                <TH className="w-[36%]">Notified</TH>
                <TH className="w-[8%] text-center">Yes</TH>
                <TH className="w-[8%] text-center">No</TH>
                <TH className="w-[26%]">Who</TH>
                <TH className="w-[22%]">Time</TH>
              </tr>
            </thead>
            <tbody>
              {form.post_test_notifications.map((r, i) => (
                <tr key={i}>
                  <TD className="font-medium">{r.label}</TD>
                  <TD className="text-center">
                    <Check on={r.answer === "yes"} />
                  </TD>
                  <TD className="text-center">
                    <Check on={r.answer === "no"} />
                  </TD>
                  <TD>{val(r.who)}</TD>
                  <TD>{val(r.time)}</TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="mt-5">
          <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
            The Following Did Not Operate Correctly
          </p>
          <div className="border border-gray-200 rounded-md p-2.5 min-h-[52px] text-[10px] text-gray-800 whitespace-pre-wrap bg-gray-50/60">
            {form.did_not_operate}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 mt-4">
          <Field label="System Restored to Normal Operation — Date" value={form.restored.date} />
          <Field label="Time" value={form.restored.time} />
        </div>

        <div
          className="mt-6 text-center py-2.5 rounded-md text-[10.5px] font-bold tracking-wide text-white"
          style={{ background: NAVY, borderLeft: `4px solid ${ORANGE}` }}
        >
          {CERTIFICATION}
        </div>

        <div className="mt-5 space-y-5">
          {[
            { who: "Inspector", data: form.inspector },
            { who: "Owner or Representative", data: form.owner_rep },
          ].map(({ who, data }) => (
            <div key={who}>
              <div className="grid grid-cols-4 gap-x-4">
                <Field label={`Name of ${who}`} value={data.name} className="col-span-2" />
                <Field label="Date" value={data.date} />
                <Field label="Time" value={data.time} />
              </div>
              <div className="mt-2">
                <div className="text-[8px] font-semibold uppercase tracking-wider text-gray-400">
                  Signature
                </div>
                <div
                  className="border-b border-gray-400 pb-[1px] min-h-[26px] text-[17px] text-gray-900"
                  style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive" }}
                >
                  {data.signature}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageChrome>
    </div>
  );
}
