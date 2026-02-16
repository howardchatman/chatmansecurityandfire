import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Simple in-memory rate limiting
const rateLimiter = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimiter.get(ip);
  if (!entry || now > entry.reset) {
    rateLimiter.set(ip, { count: 1, reset: now + 60000 }); // 1 minute window
    return true;
  }
  if (entry.count >= 20) return false; // 20 requests per minute
  entry.count++;
  return true;
}

// GET: Fetch proposal data for the viewer page (public, no auth)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("proposal_history")
    .select("id, client_name, proposal_type, total, status, proposal_data, created_at")
    .eq("share_token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

// POST: AI chat about the proposal (public, rate-limited)
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
  }

  const body = await request.json();
  const { token, messages } = body;
  if (!token || !messages) {
    return NextResponse.json({ error: "Missing token or messages" }, { status: 400 });
  }

  // Fetch proposal data
  const { data: proposal } = await supabaseAdmin
    .from("proposal_history")
    .select("client_name, proposal_type, total, proposal_data")
    .eq("share_token", token)
    .single();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const pd = proposal.proposal_data || {};
  const isVE = proposal.proposal_type === "voice_evac";

  const systemPrompt = `You are the Chatman Security & Fire proposal assistant. You're speaking directly with a potential client who has received a fire alarm proposal. Your goal is to answer their questions confidently, address concerns, and encourage them to approve the proposal.

PROPOSAL DETAILS:
- Client: ${proposal.client_name}
- System Type: ${isVE ? "Voice Evacuation + Fire Alarm" : "Standard Fire Alarm"}
- Total Investment: $${(proposal.total || 0).toLocaleString()}
- Deposit (30%): $${Math.round((proposal.total || 0) * 0.3).toLocaleString()}
${pd.facility ? `- Facility: ${pd.facility.address || "TBD"}, ${pd.facility.sqft || "TBD"} sqft` : ""}
${pd.facility ? `- AHJ: ${pd.facility.ahj || "Local Fire Marshal"}` : ""}
${pd.facility ? `- Occupancy: ${pd.facility.occupancy || "Commercial"}` : ""}
${pd.devices ? `- Devices: ${pd.devices.filter((d: { qty: number }) => d.qty > 0).map((d: { label: string; qty: number }) => `${d.qty} ${d.label}`).join(", ")}` : ""}

PRICING CATEGORIES:
${pd.categories ? Object.entries(pd.categories).map(([k, v]) => `- ${k}: $${(v as number).toLocaleString()}`).join("\n") : "See proposal document for category breakdown."}

WHAT YOU GET AS A CHATMAN CUSTOMER:
1. **Personal attention from the owner** — Howard Chatman personally oversees every project. You're not handed off to a subcontractor you'll never see again.
2. **1-Year warranty on ALL parts AND labor** — Most competitors only cover parts. We cover everything from the date of final inspection.
3. **24/7 fire alarm monitoring** with UL-listed central station — your building is protected around the clock.
4. **Fire Marshal representation** — We attend the inspection FOR you, handle any punch list items same-day, and deliver all documentation.
5. **Priority service for existing customers** — Need a service call or annual inspection? Chatman customers get priority scheduling.
6. **Complete compliance documentation** — As-built drawings, O&M manuals, and test reports delivered to you and your tenants.
7. **Deep code expertise** — We know NFPA 72, IFC, NEC, and local amendments inside and out. No guesswork, no failed inspections.
8. **One point of contact** — From permit to inspection to monitoring, you deal with Howard. No runaround between departments.
9. **Consulting fee offset** — If you already paid for an assessment/consulting, that fee is credited toward the project cost.
10. **NICET-certified technicians** with full liability insurance and bonding — complete peace of mind.
11. **Tenant coordination** — We handle tenant fire alarm orientation and training so you don't have to.

NFPA 72 COMPLIANCE:
- All systems designed per NFPA 72 (National Fire Alarm and Signaling Code)
- Smoke detectors: 30ft spacing, 15ft radius per NFPA 72 §17.7.3
- Horn/Strobes or Speaker/Strobes: ADA compliant placement per NFPA 72 §18.4
- Pull stations: Within 5ft of exits per NFPA 72 §17.14
${isVE ? "- Voice evacuation per NFPA 72 §24.4 with STI intelligibility testing" : ""}

TERMS:
- Proposal valid 60 days
- 30% deposit to begin
- Balance due upon Fire Marshal inspection approval
- Net 30 payment terms

PRICING & DISCOUNT STRATEGY:
- ALWAYS try to close at the proposed price FIRST. Lead with value, not discounts.
- When asked about price, emphasize everything they get (see list above). Paint the full picture.
- Compare to competitors: "Other companies may quote lower, but do they attend the inspection for you? Do they warranty labor? Do they handle tenant training?"
- If the client pushes HARD on price and seems ready to walk, you may offer up to 5% off as a "project commitment discount" — but ONLY if they commit to moving forward TODAY.
- Frame it as: "I can check with Howard about a project commitment discount of up to 5% if you're ready to get started today. That would bring your investment to $${Math.round((proposal.total || 0) * 0.95).toLocaleString()}."
- NEVER offer the discount unprompted or early in the conversation. It's a last resort to close.
- After offering the discount, push for immediate action: "Shall I have Howard call you to finalize the paperwork?"

INSTRUCTIONS:
- Be professional, knowledgeable, and confident — you represent Howard and Chatman Security & Fire
- Answer technical questions with authority (you know NFPA 72, IFC, and fire alarm systems)
- When asked about pricing, ALWAYS lead with VALUE first — the warranty, the service, the expertise
- For complex or unusual questions, encourage them to speak with Howard directly
- Always mention they can call Howard at (832) 430-1826 or schedule through our AI assistant Chad
- Push toward approval — ask "Are you ready to get started?" or "Want me to have Howard call you?"
- Keep responses concise (2-4 sentences unless a detailed technical answer is needed)
- Never make up information not in the proposal data
- If unsure, say "Great question — let me have Howard reach out with the specifics. Can I have him call you?"
- Use urgency: "Schedule fills up fast — securing your deposit locks in your timeline and pricing"
- Be warm and personable, like you're looking out for their best interest`;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 600,
        system: systemPrompt,
        messages: messages.slice(-10), // Last 10 messages for context
      }),
    });

    const data = await resp.json();
    const reply = data.content?.map((b: { type: string; text?: string }) => b.type === "text" ? b.text : "").filter(Boolean).join("\n") || "I'm having trouble connecting. Please call Howard at (832) 430-1826.";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: "I'm having trouble connecting right now. Please call Howard directly at (832) 430-1826 — he'd love to discuss your proposal!" });
  }
}
