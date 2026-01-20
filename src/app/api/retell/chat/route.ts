import { NextRequest, NextResponse } from "next/server";
import { sendChatMessage, type RetellChatMessage } from "@/lib/retell";

// Fallback responses when Retell is not configured
const fallbackResponses: Record<string, string> = {
  quote: `I'd be happy to help you get a free quote! Here's what I need from you:

1. **Property Type**: Residential or Commercial?
2. **Location**: What city/zip code?
3. **Current Security**: Do you have an existing system?

You can also call us at 1-800-555-1234 for immediate assistance, or I can have a security consultant contact you.`,

  schedule: `I can help you schedule a service appointment! We offer:

- **Emergency Service**: Available 24/7
- **Same-Day Appointments**: When available
- **Regular Service**: Next business day

What type of service do you need? Our team is ready to assist you.`,

  emergency: `🚨 **If this is a life-threatening emergency, please call 911 immediately.**

For security system emergencies:
- **Monitoring Center**: 1-800-555-0911 (24/7)
- **Technical Support**: 1-800-555-1234

How can I assist you right now?`,

  status: `I can help you check your system status! To access your full system dashboard:

1. Log in to your **Customer Portal**
2. Or use our **Mobile App**

If you're experiencing issues with your system, I can help troubleshoot or connect you with technical support.`,

  default: `Thank you for your message! I'm AIVA, your AI security assistant.

I can help you with:
- 🏠 **Getting a free security quote**
- 📅 **Scheduling service appointments**
- ❓ **Answering security questions**
- 🔧 **Technical support**

What would you like to know about our security solutions?`,
};

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("quote") || lowerMessage.includes("price") || lowerMessage.includes("cost")) {
    return fallbackResponses.quote;
  }
  if (lowerMessage.includes("schedule") || lowerMessage.includes("appointment") || lowerMessage.includes("service")) {
    return fallbackResponses.schedule;
  }
  if (lowerMessage.includes("emergency") || lowerMessage.includes("urgent") || lowerMessage.includes("help")) {
    return fallbackResponses.emergency;
  }
  if (lowerMessage.includes("status") || lowerMessage.includes("system") || lowerMessage.includes("check")) {
    return fallbackResponses.status;
  }

  return fallbackResponses.default;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: RetellChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Try Retell API first
    const retellResponse = await sendChatMessage(messages);

    if (retellResponse?.response) {
      return NextResponse.json({
        success: true,
        response: retellResponse.response,
        response_id: retellResponse.response_id,
      });
    }

    // Fallback to local responses
    const lastUserMessage = messages
      .filter((m) => m.role === "user")
      .pop();

    const fallbackResponse = getFallbackResponse(
      lastUserMessage?.content || ""
    );

    return NextResponse.json({
      success: true,
      response: fallbackResponse,
      fallback: true,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
