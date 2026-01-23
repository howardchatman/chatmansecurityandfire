import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface SiteInfo {
  buildingType: string;
  squareFootage: string;
  floors: string;
  existingSystem: string;
  notes: string;
}

interface AIRequest {
  action: "suggest_scope" | "generate_narrative" | "estimate_devices";
  quoteType: string;
  site: SiteInfo;
  existingItems?: Array<{ name: string; quantity: number }>;
}

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { success: false, error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  try {
    const body: AIRequest = await request.json();
    const { action, quoteType, site, existingItems } = body;

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "suggest_scope") {
      systemPrompt = `You are a fire alarm system design expert for Chatman Security and Fire in Houston, TX.
You help estimate fire alarm system requirements based on building information.
Always respond with valid JSON only, no markdown or explanation.
Base your estimates on NFPA 72 requirements and Texas fire code.`;

      userPrompt = `Given this building information:
- Building Type: ${site.buildingType || "commercial"}
- Square Footage: ${site.squareFootage || "unknown"}
- Number of Floors: ${site.floors || "1"}
- Existing System: ${site.existingSystem || "none"}
- Notes: ${site.notes || "none"}
- Quote Type: ${quoteType}

Suggest appropriate fire alarm devices and quantities. Return JSON in this exact format:
{
  "suggestions": [
    {"category": "Initiating Devices", "name": "Smoke Detector - Addressable", "quantity": 10, "reason": "Based on 900 sq ft coverage per detector"},
    {"category": "Initiating Devices", "name": "Heat Detector - Addressable", "quantity": 2, "reason": "For kitchen/mechanical areas"},
    {"category": "Notification Devices", "name": "Horn/Strobe Combination", "quantity": 8, "reason": "Coverage for common areas and corridors"}
  ],
  "notes": "Additional considerations or recommendations",
  "estimatedLaborHours": 24
}`;
    } else if (action === "generate_narrative") {
      systemPrompt = `You are a professional proposal writer for Chatman Security and Fire, a commercial fire alarm contractor in Houston, TX.
Write clear, professional scope narratives for fire alarm proposals.
Keep it concise but thorough. Use industry terminology appropriately.`;

      const itemsList = existingItems?.map(i => `${i.quantity}x ${i.name}`).join(", ") || "various fire alarm devices";

      userPrompt = `Write a professional scope of work narrative for this fire alarm project:

Building: ${site.buildingType || "Commercial"} building
Location: ${site.notes ? `Notes: ${site.notes}` : "Houston area"}
Square Footage: ${site.squareFootage || "Not specified"}
Floors: ${site.floors || "1"}
Existing System: ${site.existingSystem || "None"}
Quote Type: ${quoteType}
Equipment: ${itemsList}

Write 2-3 paragraphs describing the scope of work professionally. Include:
1. Overview of what will be installed/serviced
2. Key deliverables
3. Compliance statement (NFPA 72, Texas fire code)

Return JSON: {"narrative": "your narrative text here"}`;
    } else if (action === "estimate_devices") {
      systemPrompt = `You are a fire alarm system designer. Calculate device counts based on NFPA 72 spacing requirements.
Smoke detectors: 900 sq ft coverage, 30 ft spacing
Heat detectors: 50 ft spacing
Horn/strobes: 75 dBA coverage, typically one per 4,000 sq ft or per floor
Pull stations: At each exit
Always respond with valid JSON only.`;

      userPrompt = `Calculate recommended device counts for:
- Square Footage: ${site.squareFootage || "5000"}
- Floors: ${site.floors || "1"}
- Building Type: ${site.buildingType || "office"}

Return JSON:
{
  "devices": {
    "smokeDetectors": {"count": 0, "calculation": "explanation"},
    "heatDetectors": {"count": 0, "calculation": "explanation"},
    "hornStrobes": {"count": 0, "calculation": "explanation"},
    "pullStations": {"count": 0, "calculation": "explanation"},
    "ductDetectors": {"count": 0, "calculation": "explanation"}
  },
  "laborHours": 0,
  "notes": "any special considerations"
}`;
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return NextResponse.json(
        { success: false, error: "AI service unavailable" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { success: false, error: "No response from AI" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleanContent);
      return NextResponse.json({ success: true, data: parsed });
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return NextResponse.json(
        { success: false, error: "Invalid AI response format", raw: content },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("AI suggestion error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get AI suggestions" },
      { status: 500 }
    );
  }
}
