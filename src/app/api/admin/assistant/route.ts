import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import {
  ASSISTANT_TOOLS,
  ASSISTANT_SYSTEM_PROMPT,
  runAssistantTool,
  houstonToday,
} from "@/lib/assistant-tools";

// The admin assistant.
//
// This route previously returned canned text built from a hardcoded
// getMockBusinessData() — invented customers, invented technicians, and an
// invented $48,250 in monthly revenue, presented as fact under a "Powered by
// AI" badge. It also fired a Retell create-web-call on every message and threw
// the response away. All of that is gone.
//
// What replaces it: Claude with read-only tools over the real database. The
// model chooses which tool to call; the tools do every count and total. See
// src/lib/assistant-tools.ts for why that split matters.

const MODEL = "claude-sonnet-5";
const MAX_TOOL_ROUNDS = 5;
const MAX_HISTORY = 12;

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "thinking"; thinking: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string };

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

async function callClaude(messages: AnthropicMessage[], apiKey: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      system: ASSISTANT_SYSTEM_PROMPT.replace("{{TODAY}}", houstonToday()),
      tools: ASSISTANT_TOOLS,
      messages,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic ${res.status}: ${body.slice(0, 300)}`);
  }
  return (await res.json()) as { content: ContentBlock[]; stop_reason: string };
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth || !["admin", "manager"].includes(auth.role)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error:
        "The assistant needs ANTHROPIC_API_KEY set in the environment. It is not configured on this deployment.",
    });
  }

  try {
    const body = await req.json();
    const incoming = Array.isArray(body?.messages) ? body.messages : [];

    // Trim history so a long session doesn't grow the prompt without bound.
    // The opening greeting is ours, not the model's, so drop any leading
    // assistant turn — the API requires the conversation to start with a user.
    const history: AnthropicMessage[] = incoming
      .filter(
        (m: { role?: string; content?: string }) =>
          (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim()
      )
      .slice(-MAX_HISTORY)
      .map((m: { role: "user" | "assistant"; content: string }) => ({
        role: m.role,
        content: m.content,
      }));

    while (history.length && history[0].role !== "user") history.shift();

    if (!history.length) {
      return NextResponse.json({ success: false, error: "No message to answer." }, { status: 400 });
    }

    const toolsUsed: string[] = [];

    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const reply = await callClaude(history, apiKey);

      const toolCalls = reply.content.filter(
        (b): b is Extract<ContentBlock, { type: "tool_use" }> => b.type === "tool_use"
      );

      if (!toolCalls.length) {
        // A thinking block can precede the text, so join text blocks rather
        // than reading content[0] — that bug cost a day on the proposal agent.
        const text = reply.content
          .filter((b): b is Extract<ContentBlock, { type: "text" }> => b.type === "text")
          .map((b) => b.text)
          .join("")
          .trim();

        return NextResponse.json({
          success: true,
          response: text || "I could not find anything for that. Try rephrasing?",
          tools_used: toolsUsed,
        });
      }

      // Out of rounds but the model still wants data — say so rather than
      // letting it answer from nothing.
      if (round === MAX_TOOL_ROUNDS) {
        return NextResponse.json({
          success: true,
          response:
            "That needed more lookups than I can do in one go. Try asking about one thing at a time.",
          tools_used: toolsUsed,
        });
      }

      history.push({ role: "assistant", content: reply.content });

      const results: ContentBlock[] = [];
      for (const call of toolCalls) {
        toolsUsed.push(call.name);
        const out = await runAssistantTool(call.name, call.input ?? {});
        results.push({
          type: "tool_result",
          tool_use_id: call.id,
          content: JSON.stringify(out),
        });
      }
      history.push({ role: "user", content: results });
    }

    return NextResponse.json({ success: true, response: "Something went wrong. Try again?" });
  } catch (error) {
    console.error("[assistant]", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    // Surface the real reason. "I'm having trouble" taught nobody anything the
    // last time this route failed silently.
    return NextResponse.json({
      success: false,
      error: /401|403|authentication|credit/i.test(msg)
        ? "The assistant could not reach Claude — check ANTHROPIC_API_KEY and the account's credit balance."
        : `The assistant hit an error: ${msg.slice(0, 200)}`,
    });
  }
}
