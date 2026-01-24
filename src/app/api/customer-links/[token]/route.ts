import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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
    return payload as { userId: string; email: string; role: string; teamId?: string };
  } catch {
    return null;
  }
}

// Check if a link is valid (not expired, not revoked, not max uses exceeded)
function isLinkValid(link: {
  status: string;
  expires_at: string | null;
  max_uses: number | null;
  use_count: number;
}): { valid: boolean; reason?: string } {
  if (link.status === "revoked") {
    return { valid: false, reason: "This link has been revoked" };
  }
  if (link.status === "expired") {
    return { valid: false, reason: "This link has expired" };
  }
  if (link.status === "used") {
    return { valid: false, reason: "This link has already been used" };
  }
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return { valid: false, reason: "This link has expired" };
  }
  if (link.max_uses !== null && link.use_count >= link.max_uses) {
    return { valid: false, reason: "This link has reached its usage limit" };
  }
  return { valid: true };
}

// GET: Get link details (public - for customer portal) or admin view
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const auth = await verifyAuth();
    const isAdmin = auth && ["admin", "manager"].includes(auth.role);

    // Fetch the link with related data
    const { data: link, error } = await supabase
      .from("customer_links")
      .select(`
        *,
        quote:security_quotes(
          id,
          quote_number,
          status,
          totals,
          line_items,
          customer,
          site,
          template_name,
          valid_until,
          created_at,
          accepted_at,
          deposit_amount,
          payment_status
        ),
        job:jobs(
          id,
          job_number,
          status,
          job_type,
          scheduled_date,
          scheduled_time_start,
          customer_name,
          site_address,
          site_city,
          site_state,
          description
        )
      `)
      .eq("token", token)
      .single();

    if (error || !link) {
      return NextResponse.json(
        { success: false, error: "Link not found" },
        { status: 404 }
      );
    }

    // Check if link is valid
    const validity = isLinkValid(link);
    if (!validity.valid && !isAdmin) {
      // Update status if expired
      if (link.expires_at && new Date(link.expires_at) < new Date() && link.status === "active") {
        await supabase
          .from("customer_links")
          .update({ status: "expired" })
          .eq("id", link.id);
      }

      return NextResponse.json(
        { success: false, error: validity.reason },
        { status: 403 }
      );
    }

    // Record access (don't count admin views)
    if (!isAdmin) {
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
      const userAgent = request.headers.get("user-agent") || "";

      await supabase.from("customer_link_access_log").insert({
        customer_link_id: link.id,
        ip_address: ip,
        user_agent: userAgent,
        action: "view",
      });

      // Update last accessed
      await supabase
        .from("customer_links")
        .update({ last_accessed_at: new Date().toISOString() })
        .eq("id", link.id);
    }

    // For public access, filter sensitive data
    if (!isAdmin) {
      return NextResponse.json({
        success: true,
        data: {
          token: link.token,
          link_type: link.link_type,
          customer_name: link.customer_name,
          customer_email: link.customer_email,
          quote: link.quote,
          job: link.job,
          is_valid: validity.valid,
        },
      });
    }

    // Admin gets full data
    return NextResponse.json({
      success: true,
      data: link,
    });
  } catch (error) {
    console.error("Error fetching customer link:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch link" },
      { status: 500 }
    );
  }
}

// PATCH: Update link (revoke, extend, etc.) - admin only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!["admin", "manager"].includes(auth.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { token } = await params;
    const body = await request.json();
    const { action, reason, extends_days } = body;

    // Get current link
    const { data: link, error: fetchError } = await supabase
      .from("customer_links")
      .select("*")
      .eq("token", token)
      .single();

    if (fetchError || !link) {
      return NextResponse.json(
        { success: false, error: "Link not found" },
        { status: 404 }
      );
    }

    // Handle different actions
    switch (action) {
      case "revoke": {
        const { error: updateError } = await supabase
          .from("customer_links")
          .update({
            status: "revoked",
            revoked_at: new Date().toISOString(),
            revoked_by: auth.userId,
            revoke_reason: reason || "Revoked by admin",
          })
          .eq("id", link.id);

        if (updateError) {
          return NextResponse.json(
            { success: false, error: "Failed to revoke link" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Link revoked successfully",
        });
      }

      case "extend": {
        const days = extends_days || 30;
        const newExpiry = new Date(
          (link.expires_at ? new Date(link.expires_at) : new Date()).getTime() +
            days * 24 * 60 * 60 * 1000
        );

        const { error: updateError } = await supabase
          .from("customer_links")
          .update({
            expires_at: newExpiry.toISOString(),
            status: "active", // Reactivate if was expired
          })
          .eq("id", link.id);

        if (updateError) {
          return NextResponse.json(
            { success: false, error: "Failed to extend link" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: `Link extended by ${days} days`,
          data: { expires_at: newExpiry },
        });
      }

      case "reactivate": {
        if (link.status === "revoked" || link.status === "expired") {
          const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          const { error: updateError } = await supabase
            .from("customer_links")
            .update({
              status: "active",
              expires_at: newExpiry.toISOString(),
              revoked_at: null,
              revoked_by: null,
              revoke_reason: null,
            })
            .eq("id", link.id);

          if (updateError) {
            return NextResponse.json(
              { success: false, error: "Failed to reactivate link" },
              { status: 500 }
            );
          }

          return NextResponse.json({
            success: true,
            message: "Link reactivated",
            data: { expires_at: newExpiry },
          });
        }

        return NextResponse.json(
          { success: false, error: "Link is already active" },
          { status: 400 }
        );
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error updating customer link:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update link" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a link - admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (auth.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only admins can delete links" },
        { status: 403 }
      );
    }

    const { token } = await params;

    const { error } = await supabase
      .from("customer_links")
      .delete()
      .eq("token", token);

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to delete link" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Link deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer link:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete link" },
      { status: 500 }
    );
  }
}
