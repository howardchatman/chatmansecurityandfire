import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { isConnected, googleConfigured, disconnect } from "@/lib/google-calendar";

// Status + disconnect for the Google Calendar connection. Admin/manager only.

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || !["admin", "manager"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { connected, email } = await isConnected();
  return NextResponse.json({ configured: googleConfigured(), connected, email });
}

export async function DELETE(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || !["admin", "manager"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await disconnect();
  return NextResponse.json({ success: true });
}
