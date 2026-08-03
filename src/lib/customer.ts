import { supabaseAdmin } from "@/lib/supabase";
import type { JWTPayload } from "@/lib/auth";

/**
 * Resolve the customers.id that a logged-in user is allowed to see.
 *
 * Prefers the explicit `customer_id` carried on the auth token (populated once the
 * admin_users.customer_id column exists). Falls back to matching the user's login
 * email against customers.email, so scoping works even before that migration is run.
 *
 * Returns null when no customer record can be linked — callers MUST treat null as
 * "show nothing" for role === "customer", never as "show everything".
 */
export async function getCustomerIdForUser(
  user: JWTPayload
): Promise<string | null> {
  if (user.customer_id) {
    return user.customer_id;
  }

  if (!user.email) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("id")
    .ilike("email", user.email)
    .maybeSingle();

  if (error) {
    console.error("getCustomerIdForUser: lookup failed", error);
    return null;
  }

  return data?.id ?? null;
}
