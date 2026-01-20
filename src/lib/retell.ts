// Retell.ai API integration for AIVA voice and chat

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_BASE_URL = "https://api.retellai.com/v2";

export interface RetellChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface RetellChatRequest {
  agent_id: string;
  messages: RetellChatMessage[];
  metadata?: Record<string, string>;
}

export interface RetellChatResponse {
  response: string;
  response_id: string;
}

export interface RetellWebCallRequest {
  agent_id: string;
  metadata?: Record<string, string>;
}

export interface RetellWebCallResponse {
  call_id: string;
  access_token: string;
}

// ============================================
// CHAT API
// ============================================

export async function sendChatMessage(
  messages: RetellChatMessage[],
  metadata?: Record<string, string>
): Promise<RetellChatResponse | null> {
  const agentId = process.env.NEXT_PUBLIC_RETELL_CHAT_AGENT_ID;

  if (!RETELL_API_KEY || !agentId) {
    console.warn("Retell API key or Chat Agent ID not configured");
    return null;
  }

  try {
    const response = await fetch(`${RETELL_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RETELL_API_KEY}`,
      },
      body: JSON.stringify({
        agent_id: agentId,
        messages,
        metadata,
      }),
    });

    if (!response.ok) {
      console.error("Retell chat error:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Retell chat error:", error);
    return null;
  }
}

// ============================================
// WEB CALL API
// ============================================

export async function createWebCall(
  metadata?: Record<string, string>
): Promise<RetellWebCallResponse | null> {
  const agentId = process.env.NEXT_PUBLIC_RETELL_AGENT_ID;

  if (!RETELL_API_KEY || !agentId) {
    console.warn("Retell API key or Agent ID not configured");
    return null;
  }

  try {
    const response = await fetch(`${RETELL_BASE_URL}/create-web-call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RETELL_API_KEY}`,
      },
      body: JSON.stringify({
        agent_id: agentId,
        metadata,
      }),
    });

    if (!response.ok) {
      console.error("Retell web call error:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Retell web call error:", error);
    return null;
  }
}

// ============================================
// CALL DETAILS API
// ============================================

export interface RetellCallDetails {
  call_id: string;
  agent_id: string;
  call_status: string;
  start_timestamp?: number;
  end_timestamp?: number;
  duration_ms?: number;
  transcript?: string;
  transcript_object?: Array<{
    role: string;
    content: string;
    timestamp: number;
  }>;
  call_analysis?: {
    sentiment?: string;
    summary?: string;
    custom_analysis?: Record<string, unknown>;
  };
  metadata?: Record<string, string>;
}

export async function getCallDetails(
  callId: string
): Promise<RetellCallDetails | null> {
  if (!RETELL_API_KEY) {
    console.warn("Retell API key not configured");
    return null;
  }

  try {
    const response = await fetch(`${RETELL_BASE_URL}/get-call/${callId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${RETELL_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error("Retell get call error:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Retell get call error:", error);
    return null;
  }
}

// ============================================
// WEBHOOK TYPES
// ============================================

export interface RetellWebhookEvent {
  event: "call_started" | "call_ended" | "call_analyzed";
  call: RetellCallDetails;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // In production, verify the webhook signature
  // For now, return true for demo purposes
  if (!secret) return true;

  // Implement HMAC verification here
  console.log("Webhook verification:", { payload: payload.slice(0, 50), signature });
  return true;
}
