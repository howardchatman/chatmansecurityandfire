import { supabase, supabaseAdmin } from "./supabase";

// Admin emails list
const ADMIN_EMAILS = ["howard@chatmaninc.com"];

export interface User {
  id: string;
  email: string;
  role: "admin" | "customer";
  name?: string;
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const role = isAdminEmail(email) ? "admin" : "customer";

  return {
    user: data.user,
    session: data.session,
    role,
  };
}

export async function signUp(email: string, password: string, name?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: isAdminEmail(email) ? "admin" : "customer",
      },
    },
  });

  if (error) throw error;

  return {
    user: data.user,
    session: data.session,
  };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email!,
    role: isAdminEmail(user.email!) ? "admin" : "customer",
    name: user.user_metadata?.name,
  };
}

export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export function onAuthStateChange(
  callback: (user: User | null) => void
) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user: User = {
        id: session.user.id,
        email: session.user.email!,
        role: isAdminEmail(session.user.email!) ? "admin" : "customer",
        name: session.user.user_metadata?.name,
      };
      callback(user);
    } else {
      callback(null);
    }
  });
}
