import { NextRequest, NextResponse } from "next/server";

// Mock customer data for the assistant
const getCustomerData = () => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    today,
    system: {
      status: "armed",
      mode: "Away",
      lastArmed: "Today at 8:00 AM",
      cameras: { total: 8, online: 8 },
      doors: { total: 4, secure: 4 },
      fireDetectors: { total: 6, active: 6 },
      panelModel: "DSC PowerSeries Neo",
    },
    services: {
      monitoring: { plan: "Premium Monitoring", monthlyFee: 49.99, active: true },
      video: { storage: "30-day cloud", monthlyFee: 29.99, active: true },
      accessControl: { entryPoints: 4, monthlyFee: 0, active: true },
    },
    billing: {
      nextBillDate: "February 1, 2024",
      nextBillAmount: 79.98,
      balance: 0,
      autoPay: true,
      paymentMethod: "Visa •••• 4242",
    },
    recentAlerts: [
      { type: "arm", message: "System Armed - Away mode", time: "Today, 8:00 AM" },
      { type: "access", message: "Front door unlocked via app", time: "Yesterday, 6:15 PM" },
      { type: "motion", message: "Motion detected - Backyard", time: "Yesterday, 3:42 PM" },
    ],
    upcomingService: {
      type: "Maintenance",
      date: "January 25, 2024",
      time: "10:00 AM - 12:00 PM",
      description: "Quarterly system check",
    },
    supportHours: "24/7 for emergencies, Mon-Fri 8AM-8PM for general support",
    emergencyLine: "1-800-555-1234",
  };
};

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    return NextResponse.json({
      success: true,
      response: generateCustomerResponse(lastMessage),
    });
  } catch (error) {
    console.error("Portal assistant error:", error);
    return NextResponse.json({
      success: true,
      response: "I'm having trouble processing that request. For immediate assistance, please call our 24/7 support line at 1-800-555-1234.",
    });
  }
}

function generateCustomerResponse(query: string): string {
  const data = getCustomerData();
  const lowerQuery = query.toLowerCase();

  // System status queries
  if (lowerQuery.includes("status") || lowerQuery.includes("system") || lowerQuery.includes("armed") || lowerQuery.includes("security")) {
    let response = `🏠 **Your Security System Status**\n\n`;
    response += `**System:** ${data.system.status === "armed" ? "🟢 Armed" : "🔴 Disarmed"} (${data.system.mode} Mode)\n`;
    response += `**Last Armed:** ${data.system.lastArmed}\n\n`;
    response += `**Equipment Status:**\n`;
    response += `• 📹 Cameras: ${data.system.cameras.online}/${data.system.cameras.total} online\n`;
    response += `• 🚪 Entry Points: ${data.system.doors.secure}/${data.system.doors.total} secure\n`;
    response += `• 🔥 Fire Detectors: ${data.system.fireDetectors.active}/${data.system.fireDetectors.total} active\n`;
    response += `• 🖥️ Panel: ${data.system.panelModel}\n\n`;
    response += `✅ All systems are functioning normally.`;
    return response;
  }

  // Camera queries
  if (lowerQuery.includes("camera") || lowerQuery.includes("video") || lowerQuery.includes("view") || lowerQuery.includes("watch")) {
    let response = `📹 **Viewing Your Cameras**\n\n`;
    response += `You have ${data.system.cameras.total} cameras, all currently online.\n\n`;
    response += `**To view your cameras:**\n`;
    response += `1. Click on "My Services" in the top menu\n`;
    response += `2. Look for the "View Cameras" button on your dashboard\n`;
    response += `3. Or use our mobile app for on-the-go viewing\n\n`;
    response += `**Video Storage:** ${data.services.video.storage}\n\n`;
    response += `💡 *Tip: You can download recorded clips from the past 30 days through the mobile app.*`;
    return response;
  }

  // Billing queries
  if (lowerQuery.includes("bill") || lowerQuery.includes("payment") || lowerQuery.includes("invoice") || lowerQuery.includes("charge") || lowerQuery.includes("cost") || lowerQuery.includes("price")) {
    let response = `💳 **Your Billing Information**\n\n`;
    response += `**Account Balance:** $${data.billing.balance.toFixed(2)} ${data.billing.balance === 0 ? "✅" : ""}\n`;
    response += `**Next Bill Date:** ${data.billing.nextBillDate}\n`;
    response += `**Next Bill Amount:** $${data.billing.nextBillAmount.toFixed(2)}\n\n`;
    response += `**Monthly Charges:**\n`;
    response += `• Security Monitoring: $${data.services.monitoring.monthlyFee}/mo\n`;
    response += `• Video Surveillance: $${data.services.video.monthlyFee}/mo\n`;
    response += `• Access Control: Included\n\n`;
    response += `**Payment Method:** ${data.billing.paymentMethod}\n`;
    response += `**Auto-Pay:** ${data.billing.autoPay ? "✅ Enabled" : "❌ Disabled"}\n\n`;
    response += `To update your payment method or view past invoices, go to the "Payments" section.`;
    return response;
  }

  // Support/help queries
  if (lowerQuery.includes("help") || lowerQuery.includes("support") || lowerQuery.includes("contact") || lowerQuery.includes("talk") || lowerQuery.includes("call") || lowerQuery.includes("problem") || lowerQuery.includes("issue")) {
    let response = `🛟 **Getting Help**\n\n`;
    response += `**Emergency (24/7):** 📞 ${data.emergencyLine}\n`;
    response += `*For break-ins, fire alarms, or system failures*\n\n`;
    response += `**General Support:** Mon-Fri 8AM-8PM EST\n`;
    response += `• 📧 support@securityplatform.com\n`;
    response += `• 💬 Live chat available during business hours\n\n`;
    response += `**Self-Service Options:**\n`;
    response += `• Submit a support ticket in the "Support" section\n`;
    response += `• View FAQs and troubleshooting guides\n`;
    response += `• Schedule a service appointment\n\n`;
    response += `What specific issue can I help you with?`;
    return response;
  }

  // Service/maintenance queries
  if (lowerQuery.includes("service") || lowerQuery.includes("maintenance") || lowerQuery.includes("technician") || lowerQuery.includes("appointment") || lowerQuery.includes("schedule")) {
    let response = `🔧 **Service Information**\n\n`;
    if (data.upcomingService) {
      response += `**Upcoming Service:**\n`;
      response += `📅 ${data.upcomingService.date}\n`;
      response += `⏰ ${data.upcomingService.time}\n`;
      response += `📋 ${data.upcomingService.description}\n\n`;
    }
    response += `**Your Services:**\n`;
    response += `• ${data.services.monitoring.plan} - $${data.services.monitoring.monthlyFee}/mo\n`;
    response += `• Video Surveillance (${data.services.video.storage}) - $${data.services.video.monthlyFee}/mo\n`;
    response += `• Access Control (${data.services.accessControl.entryPoints} doors) - Included\n\n`;
    response += `**Need to schedule service?**\n`;
    response += `Go to "Support" and create a new ticket, or call us at ${data.emergencyLine}.`;
    return response;
  }

  // Alert/activity queries
  if (lowerQuery.includes("alert") || lowerQuery.includes("activity") || lowerQuery.includes("event") || lowerQuery.includes("history") || lowerQuery.includes("log")) {
    let response = `📋 **Recent Activity**\n\n`;
    data.recentAlerts.forEach((alert) => {
      const icon = alert.type === "arm" ? "🛡️" : alert.type === "access" ? "🚪" : "👁️";
      response += `${icon} ${alert.message}\n   ${alert.time}\n\n`;
    });
    response += `View all activity in the "Alerts" section of your portal.\n\n`;
    response += `💡 *Tip: You can customize which alerts you receive via email or push notification in Settings.*`;
    return response;
  }

  // Arm/disarm queries
  if (lowerQuery.includes("arm") || lowerQuery.includes("disarm") || lowerQuery.includes("lock") || lowerQuery.includes("unlock")) {
    let response = `🔐 **System Control**\n\n`;
    response += `**Current Status:** ${data.system.status === "armed" ? "Armed" : "Disarmed"} (${data.system.mode} Mode)\n\n`;
    response += `**To arm/disarm your system:**\n`;
    response += `1. Use the control panel at your home (enter your code)\n`;
    response += `2. Use our mobile app\n`;
    response += `3. Click "Arm/Disarm System" on your dashboard\n\n`;
    response += `**Available Modes:**\n`;
    response += `• **Away** - All sensors active (use when leaving home)\n`;
    response += `• **Stay** - Perimeter only (use when home at night)\n`;
    response += `• **Disarmed** - System monitoring only\n\n`;
    response += `⚠️ *For security reasons, arming/disarming requires your PIN code.*`;
    return response;
  }

  // General/fallback
  return `I can help you with:\n
• **🏠 System Status** - "What's my system status?"
• **📹 Cameras** - "How do I view my cameras?"
• **💳 Billing** - "Tell me about my bill"
• **🛟 Support** - "I need help"
• **🔧 Service** - "Schedule maintenance"
• **📋 Alerts** - "Show recent activity"
• **🔐 Control** - "How do I arm my system?"

What would you like to know?`;
}
