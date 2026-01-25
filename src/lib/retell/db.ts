/**
 * Retell Database Helper Functions
 * Handles lead, call, and event storage in Supabase
 */

import { supabaseAdmin } from "@/lib/supabase";
import { ParsedRetellPayload } from "./parse";

// ============================================
// TYPES
// ============================================

export interface RetellLead {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  property_address: string | null;
  source: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RetellCall {
  id: string;
  retell_call_id: string;
  lead_id: string | null;
  from_number: string | null;
  to_number: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  summary: string | null;
  transcript: string | null;
  urgency: string;
  intent: string | null;
  sentiment: string | null;
  callback_requested: boolean;
  transfer_requested: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RetellCallEvent {
  id: string;
  call_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface ScheduledCallback {
  id: string;
  call_id: string | null;
  lead_id: string | null;
  phone: string;
  scheduled_for: string;
  status: string;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
}

// ============================================
// LEAD FUNCTIONS
// ============================================

/**
 * Get or create a lead by phone number or email
 * Returns existing lead if found, creates new one if not
 */
export async function getOrCreateLead(data: {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  propertyAddress?: string | null;
  notes?: string | null;
}): Promise<RetellLead | null> {
  // Need at least phone or email to identify a lead
  if (!data.phone && !data.email) {
    console.log("[Retell DB] No phone or email provided, skipping lead creation");
    return null;
  }

  try {
    // Try to find existing lead by phone first
    if (data.phone) {
      const { data: existingByPhone } = await supabaseAdmin
        .from("leads")
        .select("*")
        .eq("phone", data.phone)
        .maybeSingle();

      if (existingByPhone) {
        // Update with any new info
        const updates: Record<string, unknown> = {};
        if (data.name && !existingByPhone.name) updates.name = data.name;
        if (data.email && !existingByPhone.email) updates.email = data.email;
        if (data.company && !existingByPhone.company) updates.company = data.company;
        if (data.propertyAddress && !existingByPhone.property_address) updates.property_address = data.propertyAddress;

        if (Object.keys(updates).length > 0) {
          updates.updated_at = new Date().toISOString();
          const { data: updated, error } = await supabaseAdmin
            .from("leads")
            .update(updates)
            .eq("id", existingByPhone.id)
            .select()
            .single();

          if (error) {
            console.error("[Retell DB] Error updating lead:", error);
            return existingByPhone as RetellLead;
          }
          return updated as RetellLead;
        }

        return existingByPhone as RetellLead;
      }
    }

    // Try to find by email if no phone match
    if (data.email) {
      const { data: existingByEmail } = await supabaseAdmin
        .from("leads")
        .select("*")
        .eq("email", data.email)
        .maybeSingle();

      if (existingByEmail) {
        // Update with any new info
        const updates: Record<string, unknown> = {};
        if (data.name && !existingByEmail.name) updates.name = data.name;
        if (data.phone && !existingByEmail.phone) updates.phone = data.phone;
        if (data.company && !existingByEmail.company) updates.company = data.company;
        if (data.propertyAddress && !existingByEmail.property_address) updates.property_address = data.propertyAddress;

        if (Object.keys(updates).length > 0) {
          updates.updated_at = new Date().toISOString();
          const { data: updated, error } = await supabaseAdmin
            .from("leads")
            .update(updates)
            .eq("id", existingByEmail.id)
            .select()
            .single();

          if (error) {
            console.error("[Retell DB] Error updating lead:", error);
            return existingByEmail as RetellLead;
          }
          return updated as RetellLead;
        }

        return existingByEmail as RetellLead;
      }
    }

    // Create new lead
    const { data: newLead, error } = await supabaseAdmin
      .from("leads")
      .insert([
        {
          name: data.name || null,
          phone: data.phone || null,
          email: data.email || null,
          company: data.company || null,
          property_address: data.propertyAddress || null,
          source: "retell",
          notes: data.notes || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[Retell DB] Error creating lead:", error);
      return null;
    }

    console.log("[Retell DB] Created new lead:", newLead.id);
    return newLead as RetellLead;
  } catch (error) {
    console.error("[Retell DB] Error in getOrCreateLead:", error);
    return null;
  }
}

// ============================================
// CALL FUNCTIONS
// ============================================

/**
 * Upsert a call record by retell_call_id
 * Creates new call if not exists, updates if exists
 */
export async function upsertCall(data: {
  retellCallId: string;
  leadId?: string | null;
  fromNumber?: string | null;
  toNumber?: string | null;
  status: string;
  startedAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number | null;
  summary?: string | null;
  transcript?: string | null;
  urgency?: string;
  intent?: string | null;
  sentiment?: string | null;
  callbackRequested?: boolean;
  transferRequested?: boolean;
  metadata?: Record<string, unknown>;
}): Promise<RetellCall | null> {
  try {
    // Check if call exists
    const { data: existingCall } = await supabaseAdmin
      .from("calls")
      .select("*")
      .eq("retell_call_id", data.retellCallId)
      .maybeSingle();

    if (existingCall) {
      // Update existing call
      const updates: Record<string, unknown> = {
        status: data.status,
        updated_at: new Date().toISOString(),
      };

      // Only update fields if they have values
      if (data.leadId) updates.lead_id = data.leadId;
      if (data.endedAt) updates.ended_at = data.endedAt;
      if (data.durationSeconds !== undefined) updates.duration_seconds = data.durationSeconds;
      if (data.summary) updates.summary = data.summary;
      if (data.transcript) updates.transcript = data.transcript;
      if (data.urgency) updates.urgency = data.urgency;
      if (data.intent) updates.intent = data.intent;
      if (data.sentiment) updates.sentiment = data.sentiment;
      if (data.callbackRequested !== undefined) updates.callback_requested = data.callbackRequested;
      if (data.transferRequested !== undefined) updates.transfer_requested = data.transferRequested;
      if (data.metadata) {
        // Merge metadata
        updates.metadata = {
          ...(existingCall.metadata || {}),
          ...data.metadata,
        };
      }

      const { data: updated, error } = await supabaseAdmin
        .from("calls")
        .update(updates)
        .eq("id", existingCall.id)
        .select()
        .single();

      if (error) {
        console.error("[Retell DB] Error updating call:", error);
        return null;
      }

      console.log("[Retell DB] Updated call:", updated.id);
      return updated as RetellCall;
    }

    // Create new call
    const { data: newCall, error } = await supabaseAdmin
      .from("calls")
      .insert([
        {
          retell_call_id: data.retellCallId,
          lead_id: data.leadId || null,
          from_number: data.fromNumber || null,
          to_number: data.toNumber || null,
          status: data.status,
          started_at: data.startedAt || new Date().toISOString(),
          ended_at: data.endedAt || null,
          duration_seconds: data.durationSeconds || null,
          summary: data.summary || null,
          transcript: data.transcript || null,
          urgency: data.urgency || "normal",
          intent: data.intent || null,
          sentiment: data.sentiment || null,
          callback_requested: data.callbackRequested || false,
          transfer_requested: data.transferRequested || false,
          metadata: data.metadata || {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[Retell DB] Error creating call:", error);
      return null;
    }

    console.log("[Retell DB] Created new call:", newCall.id);
    return newCall as RetellCall;
  } catch (error) {
    console.error("[Retell DB] Error in upsertCall:", error);
    return null;
  }
}

/**
 * Get a call by retell_call_id
 */
export async function getCallByRetellId(retellCallId: string): Promise<RetellCall | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("calls")
      .select("*")
      .eq("retell_call_id", retellCallId)
      .maybeSingle();

    if (error) {
      console.error("[Retell DB] Error fetching call:", error);
      return null;
    }

    return data as RetellCall | null;
  } catch (error) {
    console.error("[Retell DB] Error in getCallByRetellId:", error);
    return null;
  }
}

// ============================================
// CALL EVENT FUNCTIONS
// ============================================

/**
 * Insert a call event
 */
export async function insertCallEvent(data: {
  callId: string;
  eventType: string;
  payload: Record<string, unknown>;
}): Promise<RetellCallEvent | null> {
  try {
    const { data: event, error } = await supabaseAdmin
      .from("call_events")
      .insert([
        {
          call_id: data.callId,
          event_type: data.eventType,
          payload: data.payload,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[Retell DB] Error inserting call event:", error);
      return null;
    }

    console.log("[Retell DB] Created call event:", event.id, data.eventType);
    return event as RetellCallEvent;
  } catch (error) {
    console.error("[Retell DB] Error in insertCallEvent:", error);
    return null;
  }
}

/**
 * Get events for a call
 */
export async function getCallEvents(callId: string): Promise<RetellCallEvent[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("call_events")
      .select("*")
      .eq("call_id", callId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[Retell DB] Error fetching call events:", error);
      return [];
    }

    return data as RetellCallEvent[];
  } catch (error) {
    console.error("[Retell DB] Error in getCallEvents:", error);
    return [];
  }
}

// ============================================
// SCHEDULED CALLBACK FUNCTIONS
// ============================================

/**
 * Create a scheduled callback
 */
export async function createScheduledCallback(data: {
  callId?: string | null;
  leadId?: string | null;
  phone: string;
  scheduledFor: string;
  notes?: string | null;
}): Promise<ScheduledCallback | null> {
  try {
    const { data: callback, error } = await supabaseAdmin
      .from("scheduled_callbacks")
      .insert([
        {
          call_id: data.callId || null,
          lead_id: data.leadId || null,
          phone: data.phone,
          scheduled_for: data.scheduledFor,
          status: "pending",
          notes: data.notes || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[Retell DB] Error creating scheduled callback:", error);
      return null;
    }

    console.log("[Retell DB] Created scheduled callback:", callback.id);
    return callback as ScheduledCallback;
  } catch (error) {
    console.error("[Retell DB] Error in createScheduledCallback:", error);
    return null;
  }
}

/**
 * Get pending callbacks
 */
export async function getPendingCallbacks(): Promise<ScheduledCallback[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("scheduled_callbacks")
      .select("*")
      .eq("status", "pending")
      .order("scheduled_for", { ascending: true });

    if (error) {
      console.error("[Retell DB] Error fetching pending callbacks:", error);
      return [];
    }

    return data as ScheduledCallback[];
  } catch (error) {
    console.error("[Retell DB] Error in getPendingCallbacks:", error);
    return [];
  }
}

/**
 * Update callback status
 */
export async function updateCallbackStatus(
  callbackId: string,
  status: "pending" | "completed" | "failed" | "cancelled"
): Promise<ScheduledCallback | null> {
  try {
    const updates: Record<string, unknown> = { status };
    if (status === "completed") {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from("scheduled_callbacks")
      .update(updates)
      .eq("id", callbackId)
      .select()
      .single();

    if (error) {
      console.error("[Retell DB] Error updating callback status:", error);
      return null;
    }

    return data as ScheduledCallback;
  } catch (error) {
    console.error("[Retell DB] Error in updateCallbackStatus:", error);
    return null;
  }
}

// ============================================
// UNIFIED WEBHOOK PROCESSOR
// ============================================

/**
 * Process a parsed Retell webhook payload
 * Creates/updates lead, call, and event records
 */
export async function processRetellWebhook(
  parsed: ParsedRetellPayload,
  eventType: string
): Promise<{
  lead: RetellLead | null;
  call: RetellCall | null;
  event: RetellCallEvent | null;
}> {
  console.log("[Retell Webhook] Processing:", {
    callId: parsed.callId,
    status: parsed.status,
    eventType,
  });

  // 1. Get or create lead
  const lead = await getOrCreateLead({
    name: parsed.extracted.callerName,
    phone: parsed.extracted.callerPhone || parsed.fromNumber,
    email: parsed.extracted.callerEmail,
    company: parsed.extracted.company,
    propertyAddress: parsed.extracted.propertyAddress,
    notes: parsed.extracted.notes,
  });

  // 2. Upsert call
  const call = await upsertCall({
    retellCallId: parsed.callId,
    leadId: lead?.id || null,
    fromNumber: parsed.fromNumber,
    toNumber: parsed.toNumber,
    status: parsed.status,
    startedAt: parsed.startedAt,
    endedAt: parsed.endedAt,
    durationSeconds: parsed.durationSeconds,
    summary: parsed.summary,
    transcript: parsed.transcript,
    urgency: parsed.extracted.urgency,
    intent: parsed.extracted.intent,
    sentiment: parsed.extracted.sentiment,
    callbackRequested: parsed.extracted.callbackRequested,
    transferRequested: parsed.extracted.transferRequested,
    metadata: {
      extracted: parsed.extracted,
      raw_event: eventType,
    },
  });

  // 3. Insert event
  let event: RetellCallEvent | null = null;
  if (call) {
    event = await insertCallEvent({
      callId: call.id,
      eventType,
      payload: parsed.rawPayload,
    });
  }

  // 4. Handle special events
  if (call && parsed.extracted.callbackRequested) {
    // Create scheduled callback (default 30 minutes from now)
    const scheduledFor = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    await createScheduledCallback({
      callId: call.id,
      leadId: lead?.id,
      phone: parsed.extracted.callerPhone || parsed.fromNumber || "",
      scheduledFor,
      notes: `Callback requested during call. Intent: ${parsed.extracted.intent}`,
    });

    await insertCallEvent({
      callId: call.id,
      eventType: "callback_requested",
      payload: {
        scheduled_for: scheduledFor,
        phone: parsed.extracted.callerPhone || parsed.fromNumber,
      },
    });
  }

  if (call && parsed.extracted.transferRequested) {
    await insertCallEvent({
      callId: call.id,
      eventType: "transfer_requested",
      payload: {
        reason: "caller_requested",
        urgency: parsed.extracted.urgency,
      },
    });
  }

  return { lead, call, event };
}
