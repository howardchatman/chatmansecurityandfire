import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      buildingType,
      squareFootage,
      floors,
      occupancy,
      currentSystems,
      concerns,
      additionalInfo,
    } = body;

    if (!name || !email || !buildingType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build the prompt with all building details
    const buildingDescription = `
Building Type: ${buildingType}
Square Footage: ${squareFootage || "Not specified"}
Number of Floors: ${floors || "Not specified"}
Typical Occupancy: ${occupancy || "Not specified"}
Current Systems: ${currentSystems || "None specified"}
Main Concerns: ${concerns || "None specified"}
Additional Info: ${additionalInfo || "None"}
    `.trim();

    // Get AI recommendations
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a fire safety expert for Chatman Security & Fire in Houston, TX. Based on building details, recommend appropriate fire and life safety services.

Available services we offer:
1. Fire Alarm Systems - Installation, monitoring, testing, inspection, repair
2. Fire Sprinkler Systems - Installation, testing, inspection, repair, ITM services
3. Fire Extinguishers - Sales, inspection, maintenance, recharge, training
4. Emergency/Exit Lighting - Installation, testing, inspection, repair
5. Kitchen Hood Suppression - Installation, inspection, cleaning certification
6. Clean Agent Systems - FM-200, Novec, CO2 systems for server rooms/sensitive areas
7. Backflow Prevention - Testing, certification, repair
8. Fire Safety Plans - Emergency action plans, evacuation procedures
9. Annual Inspections - Comprehensive fire system testing and certification
10. 24/7 Emergency Service - Urgent repairs and system restoration

For each recommended service, provide:
- service: The service name
- priority: "essential" (required by code), "recommended" (best practice), or "optional" (nice to have)
- reason: Why this building needs this service (1-2 sentences)
- codeReference: Relevant fire code if applicable (NFPA, IFC, or Texas codes)
- frequency: How often this service is typically needed

Return JSON in this exact format:
{
  "summary": "Brief overview of the building's fire safety needs",
  "recommendations": [
    {
      "service": "service name",
      "priority": "essential/recommended/optional",
      "reason": "why needed",
      "codeReference": "code reference or null",
      "frequency": "annual/semi-annual/monthly/as-needed"
    }
  ],
  "complianceNotes": ["Important compliance notes for this building type"],
  "estimatedBudgetRange": "rough annual budget range for all essential services"
}`
        },
        {
          role: "user",
          content: `Please analyze this building and recommend appropriate fire safety services:\n\n${buildingDescription}`
        }
      ],
      max_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content || "";

    // Parse the JSON response
    let recommendations;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      recommendations = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse recommendations:", content);
      return NextResponse.json(
        { success: false, error: "Failed to generate recommendations" },
        { status: 500 }
      );
    }

    // Create lead in database
    const leadMessage = `
Service Recommendation Request:

Building Details:
- Type: ${buildingType}
- Size: ${squareFootage || "Not specified"} sq ft
- Floors: ${floors || "Not specified"}
- Occupancy: ${occupancy || "Not specified"}
- Current Systems: ${currentSystems || "None"}
- Concerns: ${concerns || "None"}
${additionalInfo ? `- Additional: ${additionalInfo}` : ""}

AI Recommendations:
${recommendations.recommendations?.map((r: { priority: string; service: string; reason: string }, i: number) =>
  `${i + 1}. [${r.priority?.toUpperCase()}] ${r.service} - ${r.reason}`
).join("\n") || "None generated"}

Estimated Budget: ${recommendations.estimatedBudgetRange || "Not calculated"}
    `.trim();

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        name,
        email,
        phone: phone || null,
        company: company || null,
        source: "service_recommender",
        status: "new",
        message: leadMessage,
        metadata: {
          buildingDetails: {
            buildingType,
            squareFootage,
            floors,
            occupancy,
            currentSystems,
            concerns,
            additionalInfo,
          },
          recommendations,
          recommendedAt: new Date().toISOString(),
        }
      })
      .select()
      .single();

    if (leadError) {
      console.error("Failed to create lead:", leadError);
    }

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        leadId: lead?.id,
      }
    });

  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Recommendation failed" },
      { status: 500 }
    );
  }
}
