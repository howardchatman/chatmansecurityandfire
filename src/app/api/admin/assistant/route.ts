import { NextRequest, NextResponse } from "next/server";

// Mock data for the assistant to reference
// In production, this would query your Supabase database
const getMockBusinessData = () => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    today,
    appointments: [
      {
        time: "9:00 AM",
        title: "Fire alarm panel replacement",
        customer: "ABC Corporation",
        technician: "Mike Thompson",
        address: "123 Business Park Dr, Austin",
        status: "in_progress",
      },
      {
        time: "10:30 AM",
        title: "Motion sensor installation",
        customer: "Smith Residence",
        technician: "Sarah Chen",
        address: "456 Oak Lane, Dallas",
        status: "scheduled",
      },
      {
        time: "1:00 PM",
        title: "Annual system inspection",
        customer: "Tech Solutions Inc",
        technician: "David Rodriguez",
        address: "789 Tech Blvd, Houston",
        status: "scheduled",
      },
      {
        time: "3:00 PM",
        title: "Camera system upgrade",
        customer: "Medical Center West",
        technician: "Mike Thompson",
        address: "321 Health Way, Fort Worth",
        status: "scheduled",
      },
    ],
    leads: [
      { name: "John Smith", email: "john.smith@email.com", phone: "(555) 123-4567", source: "Website", status: "new", daysOld: 0 },
      { name: "Sarah Johnson", email: "sarah.j@company.com", phone: "(555) 234-5678", source: "Referral", status: "contacted", daysOld: 1 },
      { name: "Mike Davis", email: "mike.davis@business.com", phone: "(555) 345-6789", source: "AIVA Chat", status: "qualified", daysOld: 2 },
      { name: "Emily Brown", email: "emily.b@corp.com", phone: "(555) 456-7890", source: "Phone", status: "proposal", daysOld: 3 },
      { name: "David Martinez", email: "d.martinez@company.com", phone: "(555) 789-0123", source: "Referral", status: "new", daysOld: 6 },
    ],
    tickets: [
      { number: "TKT-2024-000123", title: "Fire alarm panel not responding", customer: "ABC Corporation", priority: "emergency", status: "in_progress" },
      { number: "TKT-2024-000124", title: "Motion sensor false alarms", customer: "Smith Residence", priority: "urgent", status: "assigned" },
      { number: "TKT-2024-000125", title: "Annual inspection due", customer: "Tech Solutions Inc", priority: "normal", status: "scheduled" },
      { number: "TKT-2024-000126", title: "Keypad replacement request", customer: "Downtown Retail", priority: "low", status: "open" },
      { number: "TKT-2024-000128", title: "Door sensor malfunction", customer: "Johnson Family", priority: "urgent", status: "open" },
    ],
    revenue: {
      thisMonth: 48250,
      lastMonth: 43100,
      growth: 12,
      outstanding: 12450,
      overdueInvoices: 3,
    },
    technicians: [
      { name: "Mike Thompson", status: "busy", jobsToday: 2 },
      { name: "Sarah Chen", status: "busy", jobsToday: 1 },
      { name: "David Rodriguez", status: "available", jobsToday: 1 },
      { name: "James Wilson", status: "available", jobsToday: 0 },
    ],
  };
};

const generateSystemPrompt = () => {
  const data = getMockBusinessData();

  return `You are an AI assistant for the Security Platform admin dashboard. You help administrators manage their security and fire alarm business.

CURRENT DATE: ${data.today}

TODAY'S SCHEDULE (${data.appointments.length} appointments):
${data.appointments.map((a) => `- ${a.time}: ${a.title} at ${a.customer} (${a.technician}) - ${a.status}`).join("\n")}

LEADS REQUIRING ATTENTION:
${data.leads.map((l) => `- ${l.name} (${l.status}) - ${l.source} - ${l.daysOld} days old - ${l.phone}`).join("\n")}

OPEN/URGENT TICKETS:
${data.tickets.map((t) => `- ${t.number}: ${t.title} - ${t.customer} - Priority: ${t.priority} - Status: ${t.status}`).join("\n")}

REVENUE SUMMARY:
- This Month: $${data.revenue.thisMonth.toLocaleString()}
- Last Month: $${data.revenue.lastMonth.toLocaleString()}
- Growth: ${data.revenue.growth}%
- Outstanding: $${data.revenue.outstanding.toLocaleString()}
- Overdue Invoices: ${data.revenue.overdueInvoices}

TECHNICIAN STATUS:
${data.technicians.map((t) => `- ${t.name}: ${t.status} (${t.jobsToday} jobs today)`).join("\n")}

INSTRUCTIONS:
- Be concise and helpful
- Format responses clearly with bullet points when listing items
- Prioritize urgent items when relevant
- For lead recommendations, prioritize: 1) New leads (contact within 24hrs), 2) Referrals (highest conversion), 3) Qualified leads ready for proposals
- For scheduling questions, mention the technician and location
- Always be proactive in suggesting next steps
- If asked about something not in the data, say you'd need to check the system and suggest they look at the relevant admin page`;
};

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Use Retell API for chat completion
    const RETELL_API_KEY = process.env.RETELL_API_KEY;

    if (!RETELL_API_KEY) {
      // Fallback to a simple response if no API key
      return NextResponse.json({
        success: true,
        response: generateFallbackResponse(messages[messages.length - 1]?.content || ""),
      });
    }

    // Try Retell chat API
    const response = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RETELL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: process.env.NEXT_PUBLIC_RETELL_CHAT_AGENT_ID,
      }),
    });

    if (!response.ok) {
      // If Retell fails, use fallback
      return NextResponse.json({
        success: true,
        response: generateFallbackResponse(messages[messages.length - 1]?.content || ""),
      });
    }

    // For now, use the intelligent fallback since we need proper Retell chat setup
    return NextResponse.json({
      success: true,
      response: generateFallbackResponse(messages[messages.length - 1]?.content || ""),
    });
  } catch (error) {
    console.error("Admin assistant error:", error);
    return NextResponse.json({
      success: true,
      response: "I'm having trouble processing that request. Please try again.",
    });
  }
}

// Intelligent fallback that uses the business data
function generateFallbackResponse(query: string): string {
  const data = getMockBusinessData();
  const lowerQuery = query.toLowerCase();

  // Schedule queries
  if (lowerQuery.includes("schedule") || lowerQuery.includes("today") || lowerQuery.includes("appointment")) {
    const appts = data.appointments;
    let response = `📅 **Today's Schedule (${data.today})**\n\nYou have ${appts.length} appointments:\n\n`;
    appts.forEach((a) => {
      const statusIcon = a.status === "in_progress" ? "🔄" : "⏰";
      response += `${statusIcon} **${a.time}** - ${a.title}\n   📍 ${a.customer} (${a.address})\n   👷 ${a.technician}\n\n`;
    });
    response += `\n💡 *Mike Thompson has 2 jobs today and will be busy until late afternoon.*`;
    return response;
  }

  // Lead queries
  if (lowerQuery.includes("lead") || lowerQuery.includes("call") || lowerQuery.includes("sales") || lowerQuery.includes("contact")) {
    const newLeads = data.leads.filter((l) => l.status === "new");
    const referrals = data.leads.filter((l) => l.source === "Referral");

    let response = `📞 **Priority Leads to Contact**\n\n`;
    response += `**🔥 Hot Leads (New - Contact Today):**\n`;
    newLeads.forEach((l) => {
      response += `• ${l.name} - ${l.phone}\n  Source: ${l.source} | ${l.daysOld === 0 ? "Just received" : `${l.daysOld} days old`}\n\n`;
    });

    if (referrals.length > 0) {
      response += `\n**⭐ Referral Leads (High Conversion):**\n`;
      referrals.forEach((l) => {
        response += `• ${l.name} - ${l.phone} (${l.status})\n`;
      });
    }

    response += `\n💡 *Tip: Referral leads convert at 2x the rate. Sarah Johnson was referred and has been contacted - follow up for qualification.*`;
    return response;
  }

  // Ticket queries
  if (lowerQuery.includes("ticket") || lowerQuery.includes("urgent") || lowerQuery.includes("emergency") || lowerQuery.includes("service")) {
    const urgent = data.tickets.filter((t) => t.priority === "emergency" || t.priority === "urgent");
    const open = data.tickets.filter((t) => t.status === "open");

    let response = `🎫 **Tickets Requiring Attention**\n\n`;

    if (urgent.length > 0) {
      response += `**🚨 Urgent/Emergency (${urgent.length}):**\n`;
      urgent.forEach((t) => {
        const icon = t.priority === "emergency" ? "🔴" : "🟠";
        response += `${icon} ${t.number}: ${t.title}\n   Customer: ${t.customer} | Status: ${t.status}\n\n`;
      });
    }

    if (open.length > 0) {
      response += `**📋 Unassigned/Open (${open.length}):**\n`;
      open.forEach((t) => {
        response += `• ${t.number}: ${t.title} (${t.customer})\n`;
      });
    }

    response += `\n💡 *James Wilson is available and can be assigned to the open tickets.*`;
    return response;
  }

  // Revenue queries
  if (lowerQuery.includes("revenue") || lowerQuery.includes("money") || lowerQuery.includes("sales") || lowerQuery.includes("invoice") || lowerQuery.includes("financial")) {
    const rev = data.revenue;
    let response = `💰 **Revenue Summary**\n\n`;
    response += `**This Month:** $${rev.thisMonth.toLocaleString()} (+${rev.growth}% from last month)\n`;
    response += `**Last Month:** $${rev.lastMonth.toLocaleString()}\n\n`;
    response += `**⚠️ Outstanding:** $${rev.outstanding.toLocaleString()}\n`;
    response += `**Overdue Invoices:** ${rev.overdueInvoices}\n\n`;
    response += `💡 *Consider following up on overdue invoices - Medical Center West has the largest outstanding balance.*`;
    return response;
  }

  // Technician queries
  if (lowerQuery.includes("technician") || lowerQuery.includes("tech") || lowerQuery.includes("available") || lowerQuery.includes("dispatch")) {
    let response = `👷 **Technician Status**\n\n`;
    data.technicians.forEach((t) => {
      const statusIcon = t.status === "available" ? "🟢" : t.status === "busy" ? "🟡" : "⚫";
      response += `${statusIcon} **${t.name}** - ${t.status}\n   Jobs today: ${t.jobsToday}\n\n`;
    });
    response += `💡 *James Wilson and David Rodriguez are available for new assignments.*`;
    return response;
  }

  // General help
  return `I can help you with:\n
• **📅 Schedule** - "What's on the schedule today?"
• **📞 Leads** - "Which leads should I call?"
• **🎫 Tickets** - "Show urgent tickets"
• **💰 Revenue** - "How are we doing this month?"
• **👷 Technicians** - "Who's available?"

What would you like to know?`;
}
