import { NextRequest, NextResponse } from "next/server";
import { sendChatMessage, type RetellChatMessage } from "@/lib/retell";

// Fallback responses when Retell is not configured
// Each response includes descriptive text AND ends with a question that triggers reply buttons
const fallbackResponses: Record<string, string> = {
  quote: `I'd be happy to help you get a free quote! We provide quotes for all fire & life-safety systems including alarms, sprinklers, extinguishers, emergency lighting, and fire lane marking.

What type of property is this?`,

  schedule: `I can help you schedule a service appointment! We offer:

- **Emergency Service**: Available 24/7
- **Same-Day Appointments**: When available
- **Regular Service**: Next business day

What services are you needing?`,

  inspection: `Got it — we handle failed inspection corrections every day. We'll get you back in compliance and reinspection-ready.

What system failed inspection?`,

  marshal: `We work with fire marshals across the Houston area regularly. We'll get the violations corrected and handle the reinspection.

What system is the violation for?`,

  urgent: `We understand tight deadlines. We prioritize urgent corrections and can often get crews out same-day or next-day.

What system do you need work on?`,

  emergency: `If this is a life-threatening emergency, please call **911** immediately.

For urgent fire safety system service, call us directly at **(832) 430-1826** — available 24/7.

What system is the issue with?`,

  // System type selected → ask property type
  fire_alarm: `Fire alarm — got it. We handle installs, repairs, monitoring, and inspection corrections for all fire alarm systems.

What type of property is this?`,

  sprinkler: `Sprinkler system — got it. We service wet, dry, and pre-action sprinkler systems for inspections, repairs, and new installs.

What type of property is this?`,

  emergency_lights: `Emergency lights — got it. We install and service emergency and exit lighting to keep you code-compliant.

What type of property is this?`,

  extinguishers: `Fire extinguishers — got it. We handle inspections, servicing, recharging, and new installations.

What type of property is this?`,

  fire_lane: `Fire lane / compliance — got it. We do fire lane striping, signage, and markings to meet fire code requirements.

What type of property is this?`,

  // Property type selected → ask for address
  commercial: `Commercial property — we work with offices, retail, restaurants, warehouses, and more across Houston.

What's the address?`,

  residential: `Residential property — we service single-family, multi-family, and apartment complexes.

What's the address?`,

  institutional: `Institutional property — we service schools, hospitals, government buildings, and churches.

What's the address?`,

  industrial: `Industrial property — we service manufacturing plants, refineries, and industrial facilities.

What's the address?`,

  // Timing selected → collect contact info
  today: `We'll do our best to get someone out today. Howard or a team member will confirm shortly.

What's the best email to send the confirmation to?`,

  this_week: `We'll get you on the schedule this week.

What's the best email to send the confirmation to?`,

  next_week: `We'll schedule you for next week.

What's the best email to send the confirmation to?`,

  default: `Chatman Security & Fire. This is Howard's office. I'm Chad, his AI operations assistant. How can we help you today?`,
};

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

  // Exact button matches first (from reply buttons)
  const exactMatches: Record<string, string> = {
    "failed inspection": "inspection",
    "schedule service": "schedule",
    "get a quote": "quote",
    "emergency": "emergency",
    "fire alarm": "fire_alarm",
    "sprinkler": "sprinkler",
    "emergency lights": "emergency_lights",
    "fire extinguishers": "extinguishers",
    "fire lane  compliance": "fire_lane",
    "fire lane marking": "fire_lane",
    "monitoring": "schedule",
    "other": "schedule",
    "commercial": "commercial",
    "residential": "residential",
    "institutional": "institutional",
    "industrial": "industrial",
    "today": "today",
    "this week": "this_week",
    "next week": "next_week",
  };

  for (const [match, key] of Object.entries(exactMatches)) {
    if (lower === match || lower === match.replace(/\s+/g, " ")) {
      return fallbackResponses[key];
    }
  }

  // Keyword matching for free-text input
  if (lower.includes("failed") && lower.includes("inspection")) return fallbackResponses.inspection;
  if (lower.includes("fire marshal") || lower.includes("marshal")) return fallbackResponses.marshal;
  if (lower.includes("deadline") || lower.includes("urgent")) return fallbackResponses.urgent;
  if (lower.includes("quote") || lower.includes("price") || lower.includes("cost") || lower.includes("estimate")) return fallbackResponses.quote;
  if (lower.includes("schedule") || lower.includes("appointment") || lower.includes("service")) return fallbackResponses.schedule;
  if (lower.includes("emergency")) return fallbackResponses.emergency;

  return fallbackResponses.default;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: RetellChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Try Retell API first
    const retellResponse = await sendChatMessage(messages);

    if (retellResponse?.response) {
      return NextResponse.json({
        success: true,
        response: retellResponse.response,
        response_id: retellResponse.response_id,
      });
    }

    // Fallback to local responses
    const lastUserMessage = messages
      .filter((m) => m.role === "user")
      .pop();

    const fallbackResponse = getFallbackResponse(
      lastUserMessage?.content || ""
    );

    return NextResponse.json({
      success: true,
      response: fallbackResponse,
      fallback: true,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
