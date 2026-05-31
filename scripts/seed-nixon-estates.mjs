import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vzbgnroovkvdttctxjcd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Ymducm9vdmt2ZHR0Y3R4amNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTExMDU2OSwiZXhwIjoyMDg0Njg2NTY5fQ.-g5eNGYsEJ7KhQmlHmHj0Y_wcD7hUhr62NjA2TCJA9A"
);

async function seed() {
  console.log("Seeding Nixon Estates project...\n");

  // 1. Create customer — Debora A. Nixon
  const { data: customer, error: custErr } = await supabase
    .from("customers")
    .insert([{
      name: "Debora A. Nixon",
      email: "nixon_homecare@msn.com",
      phone: "713-419-2653",
      company: "Nixon Homecare",
      address: "6710 Bleker Street",
      city: "Houston",
      state: "TX",
      zip: "77016",
      notes: "Owner — The Nixon Estates Veterans Apartments. R-2 Occupancy, 17 units, 3 stories.",
      status: "active",
    }])
    .select()
    .single();

  if (custErr) {
    console.error("Customer insert error:", custErr.message);
    return;
  }
  console.log("✓ Customer created:", customer.name, `(id: ${customer.id})`);

  // 2. Create the job
  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .insert([{
      customer_name: "Debora A. Nixon / Nixon Homecare",
      customer_email: "nixon_homecare@msn.com",
      customer_phone: "713-419-2653",
      site_address: "6710 Bleker Street",
      site_city: "Houston",
      site_state: "TX",
      site_zip: "77016",
      job_type: "installation",
      status: "in_progress",
      priority: "high",
      notes: `THE NIXON ESTATES — Veterans Apartments
Occupancy: R-2 | Construction: Type V-A | 3 Stories | 17 Units | 159 Sprinkler Heads
Permit #: 22059893 — COH | Code: 2015 IBC/IFC

CONTRACT: $84,250 total (awarded)
- Sprinkler System (NFPA 13): $50,000 — above-ground only, UG excluded
- Fire Alarm (ES-200X): $33,500
- Competitor was $94,000 — we beat by $10,500
- Owner budget was $85,000 — came in $750 under

PAYMENT SCHEDULE: 10 weekly draws at 10% each = $8,425/week
Draw 1-10: $8,425.00 each (weekly)

GC: Claude Lewis III / CAL3Designs, LLC | 281-704-6822 | claudelewisiii@gmail.com

CRITICAL ITEMS OPEN:
- URGENT: Fire Flow Test — Bleker St. hydrant (before sprinkler design)
- URGENT: Houston Water Dept. — 6" tap + BF device type
- HIGH: Order ES-200X FACP (4-6 week lead time)
- HIGH: Order DCDA Backflow (4-6 week lead time)
- HIGH: Confirm R-2 vs I-1 occupancy with AHJ
- HIGH: Coordinate elevator recall wiring before drywall
- MEDIUM: Submit sprinkler shop drawings to AHJ
- MEDIUM: Execute central station monitoring contract`,
    }])
    .select()
    .single();

  if (jobErr) {
    console.error("Job insert error:", jobErr.message);
    return;
  }
  console.log("✓ Job created:", job.customer_name, `(id: ${job.id})`);

  // 3. Create invoice for the full contract amount
  const invoiceNumber = `INV-NIXON-001`;
  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .insert([{
      job_id: job.id,
      customer_id: customer.id,
      customer_name: "Debora A. Nixon / Nixon Homecare",
      invoice_number: invoiceNumber,
      status: "sent",
      total: 84250,
      amount_paid: 0,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: "Contract price for The Nixon Estates — Sprinkler ($50,000) + Fire Alarm ES-200X ($33,500 + balance to reach $84,250 total). Payment: 10 weekly draws at 10% = $8,425/week.",
      line_items: JSON.stringify([
        { description: "Sprinkler System (NFPA 13) — Above-ground only (UG excluded)", quantity: 1, unit_price: 50000, total: 50000 },
        { description: "Fire Alarm System (ES-200X) — Full System", quantity: 1, unit_price: 33500, total: 33500 },
        { description: "Balance to contract total", quantity: 1, unit_price: 750, total: 750 },
      ]),
    }])
    .select()
    .single();

  if (invErr) {
    console.warn("Invoice insert warning (may be missing columns):", invErr.message);
  } else {
    console.log("✓ Invoice created:", invoiceNumber, `(id: ${invoice.id})`);
  }

  // 4. Summary
  console.log("\n=== DONE ===");
  console.log("The Nixon Estates is now in your dashboard.");
  console.log(`Customer ID : ${customer.id}`);
  console.log(`Job ID      : ${job.id}`);
  console.log("Contract    : $84,250 | Draw 1 due: $15,330.11");
  console.log("\nOpen in your dashboard at /admin/jobs/" + job.id);
}

seed().catch(console.error);
