/**
 * Retell Integration Module
 *
 * Exports all Retell-related utilities:
 * - Parsing utilities for webhook payloads
 * - Database helpers for leads, calls, and events
 * - Core Retell API functions
 */

// Re-export parsing utilities
export {
  parseRetellPayload,
  determineEventType,
  normalizePhone,
  detectHighUrgency,
  detectIntent,
  detectSentiment,
  type ParsedRetellPayload,
  type ExtractedFields,
} from "./parse";

// Re-export database helpers
export {
  getOrCreateLead,
  upsertCall,
  getCallByRetellId,
  insertCallEvent,
  getCallEvents,
  createScheduledCallback,
  getPendingCallbacks,
  updateCallbackStatus,
  processRetellWebhook,
  type RetellLead,
  type RetellCall,
  type RetellCallEvent,
  type ScheduledCallback,
} from "./db";

// Re-export core Retell API functions (from the main retell.ts)
export {
  sendChatMessage,
  createWebCall,
  getCallDetails,
  verifyWebhookSignature,
  type RetellChatMessage,
  type RetellChatResponse,
  type RetellWebCallResponse,
  type RetellCallDetails,
  type RetellWebhookEvent,
} from "../retell";
