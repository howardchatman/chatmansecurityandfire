import { NextRequest, NextResponse } from "next/server";
import {
  getInspectionChecklists,
  InspectionType,
} from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const inspection_type = searchParams.get("type") as InspectionType | null;

    const checklists = await getInspectionChecklists(
      inspection_type || undefined
    );

    return NextResponse.json({ data: checklists });
  } catch (error) {
    console.error("Error fetching inspection checklists:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspection checklists" },
      { status: 500 }
    );
  }
}
