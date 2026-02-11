import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();

    const resp = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: body.model || "claude-sonnet-4-20250514",
        max_tokens: body.max_tokens || 4000,
        system: body.system,
        messages: body.messages,
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.text();
      console.error("[Claude API] Error:", resp.status, errorData);
      return NextResponse.json(
        { error: `Anthropic API error: ${resp.status}` },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Claude API] Request failed:", error);
    return NextResponse.json(
      { error: "Failed to process Claude API request" },
      { status: 500 }
    );
  }
}
