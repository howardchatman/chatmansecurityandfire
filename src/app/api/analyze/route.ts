import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const company = formData.get("company") as string;

    if (!file || !name || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    // Analyze with GPT-4 Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert fire safety inspector analyzer. Analyze fire inspection reports and extract deficiencies.

For each deficiency found, provide:
1. Code/Reference (e.g., "NFPA 25 4.3.1" or "IFC 901.4")
2. Category (fire_alarm, sprinkler, extinguisher, emergency_lighting, exit_signs, suppression_system, other)
3. Description of the violation
4. Severity (critical, major, minor)
5. Plain English explanation of what this means and why it matters
6. Recommended fix

Return your analysis as JSON in this exact format:
{
  "summary": "Brief overview of the inspection",
  "inspectionDate": "date if visible",
  "propertyAddress": "address if visible",
  "overallStatus": "pass" or "fail",
  "deficiencyCount": number,
  "deficiencies": [
    {
      "code": "code reference",
      "category": "category",
      "description": "official description",
      "severity": "critical/major/minor",
      "explanation": "plain English explanation",
      "recommendedFix": "what needs to be done"
    }
  ],
  "urgentItems": ["list of items that need immediate attention"],
  "estimatedComplexity": "simple/moderate/complex"
}

If the image is not a fire inspection report, return:
{
  "error": "not_inspection_report",
  "message": "This doesn't appear to be a fire inspection report. Please upload a valid inspection document."
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this fire inspection report and extract all deficiencies. Provide detailed explanations in plain English."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content || "";

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysis = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse analysis:", content);
      return NextResponse.json(
        { success: false, error: "Failed to analyze the document" },
        { status: 500 }
      );
    }

    // Check if it's not an inspection report
    if (analysis.error === "not_inspection_report") {
      return NextResponse.json(
        { success: false, error: analysis.message },
        { status: 400 }
      );
    }

    // Create lead in database with the analysis
    const leadMessage = `
Inspection Report Analysis:
- Status: ${analysis.overallStatus?.toUpperCase() || "UNKNOWN"}
- Deficiencies Found: ${analysis.deficiencyCount || 0}
- Complexity: ${analysis.estimatedComplexity || "unknown"}
${analysis.propertyAddress ? `- Property: ${analysis.propertyAddress}` : ""}

Deficiencies:
${analysis.deficiencies?.map((d: { severity: string; category: string; description: string }, i: number) =>
  `${i + 1}. [${d.severity?.toUpperCase()}] ${d.category}: ${d.description}`
).join("\n") || "None identified"}

${analysis.urgentItems?.length > 0 ? `\nURGENT ITEMS:\n${analysis.urgentItems.join("\n")}` : ""}
    `.trim();

    const { data: lead, error: leadError } = await supabase
      .from("security_leads")
      .insert({
        name,
        email,
        phone: phone || null,
        company: company || null,
        source: "inspection_analyzer",
        status: "new",
        message: leadMessage,
        metadata: {
          analysis,
          analyzedAt: new Date().toISOString(),
        }
      })
      .select()
      .single();

    if (leadError) {
      console.error("Failed to create lead:", leadError);
      // Continue anyway - we want to show results even if lead creation fails
    }

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        leadId: lead?.id,
      }
    });

  } catch (error) {
    console.error("Error analyzing inspection:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
