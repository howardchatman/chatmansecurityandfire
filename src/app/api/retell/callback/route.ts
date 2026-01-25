/**
 * Retell Callback API Route
 *
 * Receives callback requests from the dashboard to schedule follow-up calls.
 * Stores the callback request and can later trigger outbound calls via Retell/Twilio.
 *
 * Test with curl:
 * curl -X POST http://localhost:3000/api/retell/callback \
 *   -H "Content-Type: application/json" \
 *   -d '{"phone":"+18325551234","delay_minutes":30,"call_id":"uuid-here","notes":"Follow up on inspection"}'
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createScheduledCallback,
  insertCallEvent,
  getCallByRetellId,
} from "@/lib/retell/db";
import { normalizePhone } from "@/lib/retell/parse";

// ============================================
// TYPES
// ============================================

interface CallbackRequest {
  phone: string;
  delay_minutes?: number;
  call_id?: string; // Retell call ID or internal call UUID
  lead_id?: string;
  notes?: string;
  scheduled_for?: string; // ISO timestamp (overrides delay_minutes)
}

// ============================================
// POST HANDLER
// ============================================

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    let body: CallbackRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    // 2. Validate required fields
    if (!body.phone) {
      return NextResponse.json(
        { ok: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(body.phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { ok: false, error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // 3. Calculate scheduled time
    let scheduledFor: string;
    if (body.scheduled_for) {
      scheduledFor = body.scheduled_for;
    } else {
      const delayMinutes = body.delay_minutes || 30;
      scheduledFor = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
    }

    // 4. Resolve call ID to internal UUID if needed
    let internalCallId: string | null = null;
    if (body.call_id) {
      // Check if it's already a UUID (internal) or a Retell call ID
      if (body.call_id.startsWith("call_")) {
        // It's a Retell call ID, look up the internal ID
        const call = await getCallByRetellId(body.call_id);
        internalCallId = call?.id || null;
      } else {
        // Assume it's an internal UUID
        internalCallId = body.call_id;
      }
    }

    // 5. Create scheduled callback
    const callback = await createScheduledCallback({
      callId: internalCallId,
      leadId: body.lead_id || null,
      phone: normalizedPhone,
      scheduledFor,
      notes: body.notes || null,
    });

    if (!callback) {
      return NextResponse.json(
        { ok: false, error: "Failed to create scheduled callback" },
        { status: 500 }
      );
    }

    // 6. Log event if we have a call ID
    if (internalCallId) {
      await insertCallEvent({
        callId: internalCallId,
        eventType: "callback_scheduled",
        payload: {
          callback_id: callback.id,
          scheduled_for: scheduledFor,
          phone: normalizedPhone,
          notes: body.notes || null,
        },
      });
    }

    console.log("[Retell Callback] Scheduled:", {
      callbackId: callback.id,
      phone: normalizedPhone,
      scheduledFor,
      callId: internalCallId,
    });

    // 7. Return success
    // NOTE: In the future, this is where you would trigger an outbound call
    // via Retell or Twilio API. The code is structured to make this easy to add.
    return NextResponse.json({
      ok: true,
      callback_id: callback.id,
      scheduled_for: scheduledFor,
      phone: normalizedPhone,
      message: "Callback scheduled successfully",
    });
  } catch (error) {
    console.error("[Retell Callback] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to schedule callback",
      },
      { status: 500 }
    );
  }
}

// ============================================
// GET HANDLER (List pending callbacks)
// ============================================

export async function GET() {
  try {
    // Import here to avoid circular dependency issues
    const { getPendingCallbacks } = await import("@/lib/retell/db");
    const callbacks = await getPendingCallbacks();

    return NextResponse.json({
      ok: true,
      callbacks,
      count: callbacks.length,
    });
  } catch (error) {
    console.error("[Retell Callback] Error fetching callbacks:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to fetch callbacks",
      },
      { status: 500 }
    );
  }
}
