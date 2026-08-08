// The shape of a Chatman Security & Fire agreement, modelled on the
// Texas Black Gold Distillery document.
//
// The important idea is that a scope is what the customer buys. They see a
// narrative, a list of inclusions, the code notes, and ONE all-inclusive price.
// The catalogue itemisation that produced that number stays internal — it is
// how the price is built, not what is sold, and publishing it invites
// line-by-line haggling over a smoke detector.

export interface ScopeLineItem {
  /** Catalogue item name — internal only, never rendered to the customer. */
  name: string;
  quantity: number;
  unit_cost: number;
  total: number;
}

export interface ProposalScope {
  /** "Fire Alarm System" */
  title: string;
  /** Opening paragraph: what is being installed and under which codes. */
  narrative: string;
  /** "Scope of Work Includes:" — the bulleted inclusion list. */
  inclusions: string[];
  /** The amber callout: code triggers, assumptions, cross-references. */
  notes: string[];
  /** What the customer sees. Built from line_items, editable by the estimator. */
  price: number;
  /** How the price was reached. Internal. */
  line_items: ScopeLineItem[];
  /** Shown as "ESTIMATED, Pending Flow Test" style qualifier when set. */
  price_qualifier?: string;
  /**
   * Catalogue items priced at zero, or work the drafter couldn't price at all.
   *
   * A scope carrying these is NOT a finished number. On a real distillery job
   * the drafter returned $32,997 against a true price of $58,942 because the
   * pipe, bore, tap and backflow weren't in the catalogue — and the document
   * still showed a clean total. The document refuses to present a scope like
   * that as final, so an incomplete price cannot leave the building looking
   * finished.
   */
  unpriced: string[];
}

export interface ProposalDocument {
  project_name: string;
  project_address: string;
  jurisdiction: string;
  occupancy: string;
  building_size: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  operations_manager?: string;
  operations_phone?: string;
  prepared_by: string;
  date: string;
  /** The paragraph under "AGREEMENT FOR FIRE & LIFE SAFETY SERVICES". */
  intro: string;
  scopes: ProposalScope[];
  exclusions: string[];
  /** Anything the estimator still has to price. Internal — never printed. */
  gaps: string[];
  total: number;
  validity_days: number;
}

/** The disciplines strip under the company name. */
export const DISCIPLINES = "Fire Alarm • Fire Sprinkler • Underground Fire Line • Life Safety";

/**
 * Standard terms, lifted from the signed agreement so every proposal carries
 * the same protections. Exclusions and the payment schedule are the two that
 * actually get argued about, so they stay explicit.
 */
export const STANDARD_TERMS: { heading: string; body: string }[] = [
  {
    heading: "Scope Inclusions",
    body: "This Agreement includes all materials, labor, permitting, inspections, and commissioning explicitly described herein. Items not listed are excluded.",
  },
  {
    heading: "Exclusions",
    body: "The following are NOT included in this Agreement: (a) utility tap/connection fees (Owner-paid direct to utility); (b) building modifications, patching, painting, or restoration beyond work areas; (c) asbestos or hazardous material abatement; (d) fire watch services during construction; (e) hydraulic engineering fees beyond standard calculations — complex systems requiring peer review are subject to a separate change order.",
  },
  {
    heading: "Payment Schedule",
    body: "Payment shall be made according to the following schedule: (1) 30% deposit due upon execution of this Agreement prior to material procurement and scheduling; (2) 30% progress payment due upon start of work, paid within 7 days of crew mobilization to jobsite; (3) 30% completion payment due upon substantial completion of all installed systems, paid prior to final inspection scheduling; (4) 10% retainage due upon passing of final Fire Marshal inspection and receipt of approval documentation. Work may be suspended if payments are not received within the timeframes specified.",
  },
  {
    heading: "Changes in Scope",
    body: "Any changes to the scope of work must be authorized by Owner in writing prior to execution. Change orders may affect Agreement price and schedule.",
  },
  {
    heading: "Permits & Inspections",
    body: "Contractor shall obtain all required fire alarm and fire sprinkler permits. Owner shall provide access for all required inspections.",
  },
  {
    heading: "Pricing Validity",
    body: "This Agreement price is valid for 30 days from date of issue. Material price fluctuations after execution are subject to a written change order.",
  },
  {
    heading: "Warranty",
    body: "Contractor warrants all installed work against defects in materials and workmanship for one (1) year from date of final system acceptance. Equipment manufacturer warranties apply separately and are passed through to Owner.",
  },
  {
    heading: "Governing Standards",
    body: "All work shall conform to IFC 2021, NFPA 13 (2022 ed.), NFPA 72 (2022 ed.), and all local amendments.",
  },
];

export const PAYMENT_MILESTONES = [
  { pct: 30, label: "Deposit — due on execution, before material procurement" },
  { pct: 30, label: "Progress — within 7 days of crew mobilization" },
  { pct: 30, label: "Completion — at substantial completion, before final inspection" },
  { pct: 10, label: "Retainage — on passing final Fire Marshal inspection" },
];

export const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
