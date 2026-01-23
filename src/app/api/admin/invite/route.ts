import { NextRequest, NextResponse } from "next/server";
import { inviteUser, getProfileById } from "@/lib/supabase";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-min-32-chars-long!!"
);

async function verifyAdminAuth(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Check if user is admin
    if (payload.role !== "admin") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, full_name, role, team_id, phone } = body;

    // Validate required fields
    if (!email || !full_name || !role) {
      return NextResponse.json(
        { success: false, error: "Email, full name, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["admin", "manager", "technician", "inspector"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Invite the user
    const result = await inviteUser(email, {
      full_name,
      role,
      team_id,
      phone,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: result.user,
        profile: result.profile,
      },
      message: `Invitation sent to ${email}`,
    });
  } catch (error) {
    console.error("Error inviting user:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to invite user";

    // Check for specific Supabase errors
    if (errorMessage.includes("already registered")) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// GET: List all team members (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const team_id = searchParams.get("team_id");
    const role = searchParams.get("role");
    const is_active = searchParams.get("is_active");

    const { getProfiles } = await import("@/lib/supabase");

    const profiles = await getProfiles({
      team_id: team_id || undefined,
      role: role as "admin" | "manager" | "technician" | "inspector" | undefined,
      is_active: is_active ? is_active === "true" : undefined,
    });

    return NextResponse.json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}
