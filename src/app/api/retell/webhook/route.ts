import { NextRequest, NextResponse } from "next/server";
import { saveCallLog } from "@/lib/supabase";
import type { RetellWebhookEvent } from "@/lib/retell";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RetellWebhookEvent;
    const { event, call } = body;

    console.log(`Received Retell webhook: ${event}`, call.call_id);

    if (event === "call_ended" || event === "call_analyzed") {
      // Extract call details
      const sentiment = call.call_analysis?.sentiment as
        | "positive"
        | "neutral"
        | "negative"
        | undefined;

      // Save call log to database
      await saveCallLog({
        retell_call_id: call.call_id,
        caller_name: call.metadata?.caller_name,
        caller_phone: call.metadata?.caller_phone,
        duration_seconds: call.duration_ms
          ? Math.round(call.duration_ms / 1000)
          : undefined,
        call_type: "inbound",
        sentiment: sentiment || "neutral",
        summary: call.call_analysis?.summary,
        transcript: call.transcript_object,
      });

      console.log(`Saved call log for call ${call.call_id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Vercel requires GET for health checks
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Retell webhook endpoint is active",
  });
}
