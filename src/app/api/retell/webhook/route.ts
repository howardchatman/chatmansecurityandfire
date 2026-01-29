/**
 * Retell Webhook API Route
 *
 * Receives webhook events from Retell and processes them:
 * - Validates request (secret header or query param)
 * - Parses call + conversation data
 * - Saves to Supabase (leads, calls, call_events tables)
 * - Returns JSON response Retell expects
 *
 * Test with curl:
 * curl -X POST http://localhost:3000/api/retell/webhook \
 *   -H "Content-Type: application/json" \
 *   -H "x-retell-secret: your_secret_here" \
 *   -d '{"call_id":"test_123","event":"call_started","from":"+18325551234"}'
 */

import { NextRequest, NextResponse } from "next/server";
import { parseRetellPayload, determineEventType } from "@/lib/retell/parse";
import { processRetellWebhook } from "@/lib/retell/db";
import { sendLeadNotification } from "@/lib/email";

const RETELL_WEBHOOK_SECRET = process.env.RETELL_WEBHOOK_SECRET;

// ============================================
// SECRET VALIDATION
// ============================================

function validateSecret(request: NextRequest): boolean {
  // Retell doesn't send a webhook secret by default
  // If RETELL_WEBHOOK_SECRET is configured, we check query param for extra security
  // Otherwise, we rely on the URL being private + payload validation

  if (!RETELL_WEBHOOK_SECRET) {
    // No secret configured - allow all requests (Retell standard behavior)
    return true;
  }

  // If secret is configured, check query param
  // Usage: https://yoursite.com/api/retell/webhook?secret=your_secret
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  if (querySecret === RETELL_WEBHOOK_SECRET) {
    return true;
  }

  // Also check header in case Retell adds support later
  const headerSecret = request.headers.get("x-retell-secret");
  if (headerSecret === RETELL_WEBHOOK_SECRET) {
    return true;
  }

  console.warn("[Retell Webhook] Secret mismatch - if using secret, add ?secret=xxx to webhook URL");
  return false;
}

// ============================================
// POST HANDLER
// ============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Validate secret
    if (!validateSecret(request)) {
      console.error("[Retell Webhook] Invalid or missing secret");
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse request body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      console.error("[Retell Webhook] Invalid JSON body");
      return NextResponse.json(
        { ok: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    // 3. Log incoming webhook
    console.log("[Retell Webhook] Received:", {
      event: body.event,
      call_id: body.call_id || (body.call as Record<string, unknown>)?.call_id,
      timestamp: new Date().toISOString(),
    });

    // 4. Parse payload defensively
    const parsed = parseRetellPayload(body);

    // 5. Determine event type
    const eventType = determineEventType(body, parsed.status);

    // 6. Process and store in database
    const result = await processRetellWebhook(parsed, eventType);

    // 7. Send email notification for new leads and callbacks
    if (result.lead && (eventType === "call_ended" || eventType === "callback_requested")) {
      const phone = parsed.extracted.callerPhone || parsed.fromNumber || undefined;
      const messageParts: string[] = [];
      if (parsed.extracted.intent) messageParts.push(`Intent: ${parsed.extracted.intent}`);
      if (parsed.extracted.urgency === "high") messageParts.push("URGENT");
      if (parsed.extracted.callbackRequested) messageParts.push("Callback requested");
      if (parsed.summary) messageParts.push(`Summary: ${parsed.summary}`);

      sendLeadNotification({
        name: result.lead.name || phone || "Unknown Caller",
        email: result.lead.email || "no-email@retell-call.local",
        phone,
        message: messageParts.join("\n") || `Retell ${eventType}`,
        source: "retell",
      }).catch((err) => console.error("[Retell Webhook] Email notification failed:", err));
    }

    // 8. Log result
    const duration = Date.now() - startTime;
    console.log("[Retell Webhook] Processed:", {
      callId: parsed.callId,
      eventType,
      leadId: result.lead?.id || null,
      callDbId: result.call?.id || null,
      urgency: parsed.extracted.urgency,
      intent: parsed.extracted.intent,
      durationMs: duration,
    });

    // 8. Return success response
    return NextResponse.json({
      ok: true,
      call_id: parsed.callId,
      lead_id: result.lead?.id || null,
      event_type: eventType,
      urgency: parsed.extracted.urgency,
    });
  } catch (error) {
    console.error("[Retell Webhook] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}

// ============================================
// GET HANDLER (Health Check)
// ============================================

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Retell webhook endpoint is active",
    timestamp: new Date().toISOString(),
    configured: {
      secret: !!RETELL_WEBHOOK_SECRET,
    },
  });
}
