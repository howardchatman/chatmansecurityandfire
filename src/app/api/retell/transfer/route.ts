/**
 * Retell Transfer API Route
 *
 * Receives transfer requests to hand off calls to a human operator.
 * Stores the transfer event and can later integrate with live transfer systems.
 *
 * Test with curl:
 * curl -X POST http://localhost:3000/api/retell/transfer \
 *   -H "Content-Type: application/json" \
 *   -d '{"call_id":"uuid-here","target_phone":"+18324301826","reason":"caller_requested"}'
 */

import { NextRequest, NextResponse } from "next/server";
import { insertCallEvent, getCallByRetellId } from "@/lib/retell/db";
import { normalizePhone } from "@/lib/retell/parse";
import { supabaseAdmin } from "@/lib/supabase";

// ============================================
// TYPES
// ============================================

interface TransferRequest {
  call_id: string; // Retell call ID or internal call UUID
  target_phone?: string; // Phone to transfer to (default: business line)
  reason?: string; // Reason for transfer
  urgency?: "high" | "normal" | "low";
  notes?: string;
}

// Default transfer number (Howard's direct line)
const DEFAULT_TRANSFER_NUMBER = process.env.TRANSFER_PHONE_NUMBER || "+18324301826";

// ============================================
// POST HANDLER
// ============================================

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    let body: TransferRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    // 2. Validate required fields
    if (!body.call_id) {
      return NextResponse.json(
        { ok: false, error: "call_id is required" },
        { status: 400 }
      );
    }

    // 3. Normalize target phone
    const targetPhone = normalizePhone(body.target_phone) || DEFAULT_TRANSFER_NUMBER;

    // 4. Resolve call ID to internal UUID if needed
    let internalCallId: string | null = null;
    let retellCallId: string | null = null;

    if (body.call_id.startsWith("call_")) {
      // It's a Retell call ID
      retellCallId = body.call_id;
      const call = await getCallByRetellId(body.call_id);
      internalCallId = call?.id || null;
    } else {
      // Assume it's an internal UUID
      internalCallId = body.call_id;
      // Look up the Retell call ID
      const { data } = await supabaseAdmin
        .from("calls")
        .select("retell_call_id")
        .eq("id", body.call_id)
        .single();
      retellCallId = data?.retell_call_id || null;
    }

    if (!internalCallId) {
      return NextResponse.json(
        { ok: false, error: "Call not found" },
        { status: 404 }
      );
    }

    // 5. Log the transfer request event
    const event = await insertCallEvent({
      callId: internalCallId,
      eventType: "transfer_requested",
      payload: {
        target_phone: targetPhone,
        reason: body.reason || "manual_request",
        urgency: body.urgency || "normal",
        notes: body.notes || null,
        retell_call_id: retellCallId,
        requested_at: new Date().toISOString(),
      },
    });

    // 6. Update call record
    await supabaseAdmin
      .from("calls")
      .update({
        transfer_requested: true,
        urgency: body.urgency || "normal",
        updated_at: new Date().toISOString(),
      })
      .eq("id", internalCallId);

    console.log("[Retell Transfer] Requested:", {
      callId: internalCallId,
      retellCallId,
      targetPhone,
      reason: body.reason,
      urgency: body.urgency,
    });

    // 7. Return success
    // NOTE: In the future, this is where you would:
    // - Initiate a live transfer via Retell API if supported
    // - Or use Twilio to bridge the call
    // - Or send SMS/notification to Howard
    // The code is structured to make this easy to add.
    return NextResponse.json({
      ok: true,
      call_id: internalCallId,
      retell_call_id: retellCallId,
      target_phone: targetPhone,
      event_id: event?.id,
      message: "Transfer request logged. Live transfer integration coming soon.",
    });
  } catch (error) {
    console.error("[Retell Transfer] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to process transfer",
      },
      { status: 500 }
    );
  }
}

// ============================================
// GET HANDLER (Recent transfer requests)
// ============================================

export async function GET() {
  try {
    // Get recent transfer events
    const { data, error } = await supabaseAdmin
      .from("call_events")
      .select(`
        *,
        call:calls(
          id,
          retell_call_id,
          from_number,
          lead_id,
          urgency,
          intent
        )
      `)
      .eq("event_type", "transfer_requested")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      transfers: data,
      count: data.length,
    });
  } catch (error) {
    console.error("[Retell Transfer] Error fetching transfers:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to fetch transfers",
      },
      { status: 500 }
    );
  }
}
