import { NextRequest, NextResponse } from "next/server";
import { getAssignedJobs } from "@/lib/supabase";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-min-32-chars-long!!"
);

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

// GET: Get jobs assigned to the current user
export async function GET() {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only techs and inspectors use this endpoint
    if (!["technician", "inspector"].includes(auth.role)) {
      return NextResponse.json(
        { success: false, error: "This endpoint is for technicians and inspectors" },
        { status: 403 }
      );
    }

    const jobs = await getAssignedJobs(auth.userId);

    return NextResponse.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching assigned jobs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
