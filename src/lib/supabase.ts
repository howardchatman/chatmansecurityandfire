import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Client-side Supabase client (limited access via RLS)
// Only create if we have the required env vars
let _supabase: SupabaseClient | null = null;
export const supabase: SupabaseClient = (() => {
  if (!_supabase && supabaseUrl && supabaseAnonKey) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  if (!_supabase) {
    // Return a mock client that won't crash but won't work
    // This allows the app to load even without env vars configured
    console.warn("Supabase client not initialized - missing environment variables");
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error("Supabase not configured") }),
        signUp: async () => ({ data: { user: null, session: null }, error: new Error("Supabase not configured") }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ data: null, error: new Error("Supabase not configured") }),
        insert: () => ({ select: () => ({ single: () => ({ data: null, error: new Error("Supabase not configured") }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: new Error("Supabase not configured") }) }) }) }),
        upsert: () => ({ select: () => ({ single: () => ({ data: null, error: new Error("Supabase not configured") }) }) }),
      }),
    } as unknown as SupabaseClient;
  }
  return _supabase;
})();

// Server-side Supabase client (full access for API routes)
let _supabaseAdmin: SupabaseClient | null = null;
export const supabaseAdmin: SupabaseClient = (() => {
  if (!_supabaseAdmin && supabaseUrl && supabaseServiceKey) {
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }
  return _supabaseAdmin || supabase;
})();

// ============================================
// LEAD FUNCTIONS
// ============================================

export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  preferred_contact?: "email" | "phone" | "text";
  source?: string;
  status?: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  created_at?: string;
  updated_at?: string;
}

export async function createLead(lead: Lead) {
  const { data, error } = await supabaseAdmin
    .from("security_leads")
    .insert([
      {
        name: lead.name,
        email: lead.email,
        phone: lead.phone || null,
        message: lead.message || null,
        preferred_contact: lead.preferred_contact || "email",
        source: lead.source || "website",
        status: "new",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLeads(status?: string) {
  let query = supabaseAdmin
    .from("security_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateLeadStatus(id: string, status: string) {
  const { data, error } = await supabaseAdmin
    .from("security_leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// CUSTOMER FUNCTIONS
// ============================================

export interface Customer {
  id?: string;
  auth_user_id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  status?: "active" | "inactive" | "prospect";
  created_at?: string;
  updated_at?: string;
}

export async function createCustomer(customer: Customer) {
  const { data, error } = await supabaseAdmin
    .from("security_customers")
    .insert([customer])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCustomers() {
  const { data, error } = await supabaseAdmin
    .from("security_customers")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getCustomerById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("security_customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// SERVICE TICKET FUNCTIONS
// ============================================

export interface ServiceTicket {
  id?: string;
  customer_id: string;
  property_id?: string;
  title: string;
  description?: string;
  priority?: "emergency" | "urgent" | "normal" | "low";
  status?: "open" | "assigned" | "scheduled" | "in_progress" | "completed" | "cancelled";
  assigned_to?: string;
  scheduled_date?: string;
  completed_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export async function createServiceTicket(ticket: ServiceTicket) {
  const { data, error } = await supabaseAdmin
    .from("security_service_tickets")
    .insert([
      {
        ...ticket,
        status: ticket.status || "open",
        priority: ticket.priority || "normal",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getServiceTickets(status?: string) {
  let query = supabaseAdmin
    .from("security_service_tickets")
    .select(`
      *,
      customer:security_customers(id, name, email, phone)
    `)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ============================================
// CHAT CONVERSATION FUNCTIONS
// ============================================

export interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface ChatConversation {
  id?: string;
  lead_id?: string;
  customer_id?: string;
  session_id: string;
  messages: ChatMessage[];
  created_at?: string;
  updated_at?: string;
}

export async function saveConversation(conversation: ChatConversation) {
  const { data, error } = await supabaseAdmin
    .from("security_chat_conversations")
    .upsert(
      {
        session_id: conversation.session_id,
        lead_id: conversation.lead_id,
        customer_id: conversation.customer_id,
        messages: conversation.messages,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// CALL LOG FUNCTIONS
// ============================================

export interface CallLog {
  id?: string;
  lead_id?: string;
  customer_id?: string;
  caller_name?: string;
  caller_phone?: string;
  duration_seconds?: number;
  call_type?: "inbound" | "outbound";
  sentiment?: "positive" | "neutral" | "negative";
  summary?: string;
  transcript?: object;
  retell_call_id?: string;
  created_at?: string;
}

export async function saveCallLog(callLog: CallLog) {
  const { data, error } = await supabaseAdmin
    .from("security_call_logs")
    .insert([callLog])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCallLogs() {
  const { data, error } = await supabaseAdmin
    .from("security_call_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ============================================
// QUOTE FUNCTIONS
// ============================================

export interface Quote {
  id?: string;
  quote_number: string;
  quote_type: string;
  template_name?: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired" | "paid";
  customer: {
    name: string;
    company?: string;
    email?: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  site: {
    name?: string;
    address: string;
    city: string;
    state?: string;
    zip?: string;
    buildingType?: string;
    squareFootage?: string;
    floors?: string;
    existingSystem?: string;
    notes?: string;
  };
  line_items: Array<{
    id: string;
    category: string;
    name: string;
    description?: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    laborHours?: number;
    laborRate?: number;
    allowanceLow?: number;
    allowanceHigh?: number;
    isAllowance?: boolean;
    markup?: number;
    taxable?: boolean;
  }>;
  totals: {
    subtotal: number;
    subtotalLow: number;
    subtotalHigh: number;
    laborTotal: number;
    materialsTotal: number;
    tax: number;
    taxRate: number;
    total: number;
    totalLow: number;
    totalHigh: number;
  };
  terms: {
    paymentTerms: string;
    warranty: string;
    validDays: number;
    assumptions: string[];
    disclaimers: string[];
  };
  expires_at?: string;
  sent_at?: string;
  viewed_at?: string;
  accepted_at?: string;
  created_at?: string;
  updated_at?: string;
}

export async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const { data, error } = await supabaseAdmin
    .from("security_quotes")
    .select("quote_number")
    .like("quote_number", `QT-${year}-%`)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching quotes for number generation:", error);
    // Fallback to timestamp-based number
    return `QT-${year}-${Date.now().toString().slice(-6)}`;
  }

  if (data && data.length > 0) {
    const lastNumber = data[0].quote_number;
    const match = lastNumber.match(/QT-\d{4}-(\d+)/);
    if (match) {
      const nextNumber = (parseInt(match[1]) + 1).toString().padStart(3, "0");
      return `QT-${year}-${nextNumber}`;
    }
  }

  return `QT-${year}-001`;
}

export async function createQuote(quote: Omit<Quote, "id" | "quote_number" | "created_at" | "updated_at">) {
  const quote_number = await generateQuoteNumber();

  const { data, error } = await supabaseAdmin
    .from("security_quotes")
    .insert([
      {
        ...quote,
        quote_number,
        status: quote.status || "draft",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateQuote(id: string, updates: Partial<Quote>) {
  const { data, error } = await supabaseAdmin
    .from("security_quotes")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getQuotes(status?: string) {
  let query = supabaseAdmin
    .from("security_quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getQuoteById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("security_quotes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getQuoteByNumber(quoteNumber: string) {
  const { data, error } = await supabaseAdmin
    .from("security_quotes")
    .select("*")
    .eq("quote_number", quoteNumber)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteQuote(id: string) {
  const { error } = await supabaseAdmin
    .from("security_quotes")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

export async function duplicateQuote(id: string) {
  const original = await getQuoteById(id);
  if (!original) throw new Error("Quote not found");

  const { id: _id, quote_number: _qn, created_at: _ca, updated_at: _ua, ...quoteData } = original;

  return createQuote({
    ...quoteData,
    status: "draft",
    sent_at: undefined,
    viewed_at: undefined,
    accepted_at: undefined,
  });
}

// ============================================
// TEAM PORTAL TYPES
// ============================================

export type UserRole = "admin" | "manager" | "technician" | "inspector";
export type JobStatus =
  | "lead"
  | "quoted"
  | "approved"
  | "pending"
  | "scheduled"
  | "in_progress"
  | "awaiting_inspection"
  | "corrections_required"
  | "passed"
  | "on_hold"
  | "completed"
  | "invoiced"
  | "paid"
  | "closed"
  | "cancelled";
export type JobType = "inspection" | "installation" | "service" | "repair" | "maintenance" | "emergency";
export type JobPriority = "low" | "normal" | "high" | "urgent" | "emergency";

export interface Team {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  team_id?: string;
  team?: Team;
  is_active: boolean;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  job_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  site_address: string;
  site_city?: string;
  site_state?: string;
  site_zip?: string;
  job_type: JobType;
  priority: JobPriority;
  status: JobStatus;
  description?: string;
  notes?: string;
  scheduled_date?: string;
  scheduled_time_start?: string;
  scheduled_time_end?: string;
  estimated_duration_hours?: number;
  actual_start_time?: string;
  actual_end_time?: string;
  completion_notes?: string;
  customer_signature_url?: string;
  completed_at?: string;
  created_by?: string;
  team_id?: string;
  team?: Team;
  creator?: Profile;
  assignments?: JobAssignment[];
  created_at?: string;
  updated_at?: string;
}

export interface JobAssignment {
  id: string;
  job_id: string;
  user_id: string;
  assigned_by?: string;
  role: "lead" | "technician" | "helper" | "inspector";
  assigned_at?: string;
  acknowledged_at?: string;
  user?: Profile;
  job?: Job;
}

export interface JobPhoto {
  id: string;
  job_id: string;
  uploaded_by: string;
  photo_url: string;
  thumbnail_url?: string;
  caption?: string;
  photo_type: "before" | "during" | "after" | "issue" | "general" | "signature";
  taken_at?: string;
  created_at?: string;
  uploader?: Profile;
}

export interface JobNote {
  id: string;
  job_id: string;
  user_id: string;
  note: string;
  note_type: "general" | "issue" | "customer" | "internal" | "completion";
  is_customer_visible: boolean;
  created_at?: string;
  updated_at?: string;
  user?: Profile;
}

// ============================================
// TEAM FUNCTIONS
// ============================================

export async function getTeams() {
  const { data, error } = await supabaseAdmin
    .from("teams")
    .select("*")
    .order("name");

  if (error) throw error;
  return data as Team[];
}

export async function createTeam(team: Omit<Team, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabaseAdmin
    .from("teams")
    .insert([team])
    .select()
    .single();

  if (error) throw error;
  return data as Team;
}

export async function updateTeam(id: string, updates: Partial<Team>) {
  const { data, error } = await supabaseAdmin
    .from("teams")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Team;
}

// ============================================
// PROFILE FUNCTIONS
// ============================================

export async function getProfiles(filters?: { team_id?: string; role?: UserRole; is_active?: boolean }) {
  let query = supabaseAdmin
    .from("profiles")
    .select(`
      *,
      team:teams(id, name)
    `)
    .order("full_name");

  if (filters?.team_id) {
    query = query.eq("team_id", filters.team_id);
  }
  if (filters?.role) {
    query = query.eq("role", filters.role);
  }
  if (filters?.is_active !== undefined) {
    query = query.eq("is_active", filters.is_active);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Profile[];
}

export async function getProfileById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(`
      *,
      team:teams(id, name)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function createProfile(profile: Omit<Profile, "created_at" | "updated_at">) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .insert([profile])
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(id: string, updates: Partial<Profile>) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

// ============================================
// JOB FUNCTIONS
// ============================================

export async function getJobs(filters?: {
  status?: JobStatus;
  team_id?: string;
  created_by?: string;
  scheduled_date?: string;
}) {
  let query = supabaseAdmin
    .from("jobs")
    .select(`
      *,
      team:teams(id, name),
      creator:profiles!jobs_created_by_fkey(id, full_name),
      assignments:job_assignments(
        id,
        role,
        user:profiles(id, full_name, phone)
      )
    `)
    .order("scheduled_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.team_id) {
    query = query.eq("team_id", filters.team_id);
  }
  if (filters?.created_by) {
    query = query.eq("created_by", filters.created_by);
  }
  if (filters?.scheduled_date) {
    query = query.eq("scheduled_date", filters.scheduled_date);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Job[];
}

export async function getJobById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select(`
      *,
      team:teams(id, name),
      creator:profiles!jobs_created_by_fkey(id, full_name, email),
      assignments:job_assignments(
        id,
        role,
        assigned_at,
        acknowledged_at,
        user:profiles(id, full_name, email, phone)
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Job;
}

export async function getAssignedJobs(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("job_assignments")
    .select(`
      id,
      role,
      assigned_at,
      acknowledged_at,
      job:jobs(
        *,
        team:teams(id, name)
      )
    `)
    .eq("user_id", userId)
    .order("assigned_at", { ascending: false });

  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((a: any) => ({ ...a.job, assignment: { id: a.id, role: a.role, assigned_at: a.assigned_at, acknowledged_at: a.acknowledged_at } })) as (Job & { assignment: Partial<JobAssignment> })[];
}

export async function createJob(job: Omit<Job, "id" | "job_number" | "created_at" | "updated_at">) {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .insert([job])
    .select()
    .single();

  if (error) throw error;
  return data as Job;
}

export async function updateJob(id: string, updates: Partial<Job>) {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Job;
}

// ============================================
// JOB ASSIGNMENT FUNCTIONS
// ============================================

export async function assignUserToJob(assignment: Omit<JobAssignment, "id" | "assigned_at">) {
  const { data, error } = await supabaseAdmin
    .from("job_assignments")
    .insert([assignment])
    .select(`
      *,
      user:profiles(id, full_name, email)
    `)
    .single();

  if (error) throw error;
  return data as JobAssignment;
}

export async function removeJobAssignment(jobId: string, userId: string) {
  const { error } = await supabaseAdmin
    .from("job_assignments")
    .delete()
    .eq("job_id", jobId)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

export async function acknowledgeAssignment(assignmentId: string) {
  const { data, error } = await supabaseAdmin
    .from("job_assignments")
    .update({ acknowledged_at: new Date().toISOString() })
    .eq("id", assignmentId)
    .select()
    .single();

  if (error) throw error;
  return data as JobAssignment;
}

// ============================================
// JOB PHOTO FUNCTIONS
// ============================================

export async function getJobPhotos(jobId: string) {
  const { data, error } = await supabaseAdmin
    .from("job_photos")
    .select(`
      *,
      uploader:profiles(id, full_name)
    `)
    .eq("job_id", jobId)
    .order("taken_at", { ascending: false });

  if (error) throw error;
  return data as JobPhoto[];
}

export async function addJobPhoto(photo: Omit<JobPhoto, "id" | "created_at">) {
  const { data, error } = await supabaseAdmin
    .from("job_photos")
    .insert([photo])
    .select()
    .single();

  if (error) throw error;
  return data as JobPhoto;
}

export async function deleteJobPhoto(id: string) {
  const { error } = await supabaseAdmin
    .from("job_photos")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

// ============================================
// JOB NOTE FUNCTIONS
// ============================================

export async function getJobNotes(jobId: string) {
  const { data, error } = await supabaseAdmin
    .from("job_notes")
    .select(`
      *,
      user:profiles(id, full_name)
    `)
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as JobNote[];
}

export async function addJobNote(note: Omit<JobNote, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabaseAdmin
    .from("job_notes")
    .insert([note])
    .select(`
      *,
      user:profiles(id, full_name)
    `)
    .single();

  if (error) throw error;
  return data as JobNote;
}

export async function updateJobNote(id: string, updates: Partial<JobNote>) {
  const { data, error } = await supabaseAdmin
    .from("job_notes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as JobNote;
}

// ============================================
// USER INVITATION (Admin only)
// ============================================

export async function inviteUser(email: string, userData: { full_name: string; role: UserRole; team_id?: string; phone?: string }) {
  // Invite user via Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: userData.full_name,
      role: userData.role,
    },
  });

  if (authError) throw authError;

  // Create profile for the invited user
  if (authData.user) {
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          id: authData.user.id,
          email: email,
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role,
          team_id: userData.team_id,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (profileError) {
      console.error("Error creating profile for invited user:", profileError);
      // Don't throw here - user is already created in auth
    }

    return { user: authData.user, profile: profileData };
  }

  return { user: authData.user, profile: null };
}

export async function deactivateUser(userId: string) {
  // Update profile to inactive
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ is_active: false })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function reactivateUser(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ is_active: true })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

// ============================================
// JOB LIFECYCLE EXTENDED TYPES
// ============================================

export type JobLifecycleStatus =
  | "lead"
  | "quoted"
  | "approved"
  | "pending"
  | "scheduled"
  | "in_progress"
  | "awaiting_inspection"
  | "corrections_required"
  | "passed"
  | "on_hold"
  | "completed"
  | "invoiced"
  | "paid"
  | "closed"
  | "cancelled";

export type JobPhotoCategory =
  | "before"
  | "during"
  | "after"
  | "deficiency"
  | "fire_lane"
  | "panel"
  | "rtu"
  | "device"
  | "issue"
  | "general"
  | "signature"
  | "other";

export type ChecklistType =
  | "service"
  | "installation"
  | "inspection"
  | "fire_marshal"
  | "commissioning"
  | "maintenance"
  | "custom";

export type ChecklistItemStatus = "pending" | "passed" | "failed" | "na";

export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  status: ChecklistItemStatus;
  note?: string;
  completed_at?: string;
  completed_by?: string;
}

export interface JobChecklist {
  id: string;
  job_id: string;
  checklist_type: ChecklistType;
  name: string;
  items: ChecklistItem[];
  completed_at?: string;
  completed_by?: string;
  completer?: Profile;
  created_at?: string;
  updated_at?: string;
}

export interface JobChecklistTemplate {
  id: string;
  checklist_type: ChecklistType;
  name: string;
  description?: string;
  items: Array<{
    id: string;
    label: string;
    description?: string;
    required?: boolean;
  }>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type JobEventType =
  | "created"
  | "status_change"
  | "assignment_added"
  | "assignment_removed"
  | "photo_uploaded"
  | "note_added"
  | "checklist_updated"
  | "checklist_completed"
  | "scheduled"
  | "rescheduled"
  | "started"
  | "paused"
  | "completed"
  | "invoiced"
  | "paid"
  | "converted_from_quote"
  | "custom";

export interface JobEvent {
  id: string;
  job_id: string;
  event_type: JobEventType;
  payload: Record<string, unknown>;
  created_by?: string;
  creator?: Profile;
  created_at?: string;
}

// Extended Job interface with lifecycle fields
export interface JobExtended extends Job {
  quote_id?: string;
  contact_name?: string;
  scope_summary?: string;
  billing_notes?: string;
  total_amount?: number;
  invoiced_at?: string;
  paid_at?: string;
  checklists?: JobChecklist[];
  events?: JobEvent[];
}

// ============================================
// JOB LIFECYCLE FUNCTIONS
// ============================================

export async function getJobWithDetails(id: string): Promise<JobExtended> {
  // Get job with relations
  const { data: job, error: jobError } = await supabaseAdmin
    .from("jobs")
    .select(`
      *,
      team:teams(id, name),
      creator:profiles!jobs_created_by_fkey(id, full_name, email),
      assignments:job_assignments(
        id,
        role,
        assigned_at,
        acknowledged_at,
        user:profiles(id, full_name, email, phone)
      )
    `)
    .eq("id", id)
    .single();

  if (jobError) throw jobError;

  // Get checklists
  const { data: checklists } = await supabaseAdmin
    .from("job_checklists")
    .select(`
      *,
      completer:profiles!job_checklists_completed_by_fkey(id, full_name)
    `)
    .eq("job_id", id)
    .order("created_at", { ascending: true });

  // Get events
  const { data: events } = await supabaseAdmin
    .from("job_events")
    .select(`
      *,
      creator:profiles!job_events_created_by_fkey(id, full_name)
    `)
    .eq("job_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    ...job,
    checklists: checklists || [],
    events: events || [],
  } as JobExtended;
}

export async function convertQuoteToJob(quoteId: string, userId: string): Promise<Job> {
  // Get the quote
  const quote = await getQuoteById(quoteId);
  if (!quote) throw new Error("Quote not found");

  // Build scope summary from line items
  const scopeSummary = quote.line_items
    .map((item: { name: string; quantity: number; unit: string }) => `${item.quantity} ${item.unit} - ${item.name}`)
    .join("\n");

  // Create the job
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .insert([{
      quote_id: quoteId,
      customer_name: quote.customer.name,
      contact_name: quote.customer.name,
      customer_email: quote.customer.email,
      customer_phone: quote.customer.phone,
      site_address: quote.site.address,
      site_city: quote.site.city,
      site_state: quote.site.state || "TX",
      site_zip: quote.site.zip,
      job_type: quote.quote_type === "service_repair" ? "service" : "installation",
      priority: "normal",
      status: "approved",
      description: quote.site.notes || "",
      scope_summary: scopeSummary,
      total_amount: quote.totals.total,
      notes: `Converted from Quote ${quote.quote_number}`,
      created_by: userId,
    }])
    .select()
    .single();

  if (error) throw error;

  // Log the conversion event
  await createJobEvent({
    job_id: data.id,
    event_type: "converted_from_quote",
    payload: {
      quote_id: quoteId,
      quote_number: quote.quote_number,
      total_amount: quote.totals.total,
    },
    created_by: userId,
  });

  // Update quote status
  await updateQuote(quoteId, { status: "accepted" });

  return data as Job;
}

export async function updateJobStatus(
  jobId: string,
  newStatus: JobLifecycleStatus,
  notes?: string
): Promise<Job> {
  const updates: Partial<Job> = { status: newStatus as JobStatus };

  // Set timestamps based on status
  if (newStatus === "in_progress") {
    updates.actual_start_time = new Date().toISOString();
  } else if (newStatus === "completed" || newStatus === "passed") {
    updates.actual_end_time = new Date().toISOString();
    updates.completed_at = new Date().toISOString();
    if (notes) updates.completion_notes = notes;
  } else if (newStatus === "invoiced") {
    // @ts-expect-error - extended field
    updates.invoiced_at = new Date().toISOString();
  } else if (newStatus === "paid") {
    // @ts-expect-error - extended field
    updates.paid_at = new Date().toISOString();
  }

  return updateJob(jobId, updates);
}

// ============================================
// JOB CHECKLIST FUNCTIONS
// ============================================

export async function getJobChecklistTemplates(checklistType?: ChecklistType) {
  let query = supabaseAdmin
    .from("job_checklist_templates")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (checklistType) {
    query = query.eq("checklist_type", checklistType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as JobChecklistTemplate[];
}

export async function addChecklistToJob(
  jobId: string,
  templateId: string
): Promise<JobChecklist> {
  // Get the template
  const { data: template, error: templateError } = await supabaseAdmin
    .from("job_checklist_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (templateError) throw templateError;

  // Convert template items to checklist items with status
  const items = template.items.map((item: { id: string; label: string; description?: string; required?: boolean }) => ({
    ...item,
    status: "pending",
    note: "",
  }));

  // Create the checklist
  const { data, error } = await supabaseAdmin
    .from("job_checklists")
    .insert([{
      job_id: jobId,
      checklist_type: template.checklist_type,
      name: template.name,
      items,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as JobChecklist;
}

export async function getJobChecklists(jobId: string): Promise<JobChecklist[]> {
  const { data, error } = await supabaseAdmin
    .from("job_checklists")
    .select(`
      *,
      completer:profiles!job_checklists_completed_by_fkey(id, full_name)
    `)
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as JobChecklist[];
}

export async function updateJobChecklist(
  checklistId: string,
  items: ChecklistItem[],
  userId?: string
): Promise<JobChecklist> {
  // Check if all required items are complete
  const allComplete = items.every(
    (item) => !item.required || item.status !== "pending"
  );

  const updates: Partial<JobChecklist> = { items };

  if (allComplete && items.every((item) => item.status !== "pending")) {
    updates.completed_at = new Date().toISOString();
    updates.completed_by = userId;
  }

  const { data, error } = await supabaseAdmin
    .from("job_checklists")
    .update(updates)
    .eq("id", checklistId)
    .select()
    .single();

  if (error) throw error;
  return data as JobChecklist;
}

export async function deleteJobChecklist(checklistId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("job_checklists")
    .delete()
    .eq("id", checklistId);

  if (error) throw error;
  return true;
}

// ============================================
// JOB EVENT FUNCTIONS
// ============================================

export async function getJobEvents(
  jobId: string,
  limit: number = 50
): Promise<JobEvent[]> {
  const { data, error } = await supabaseAdmin
    .from("job_events")
    .select(`
      *,
      creator:profiles!job_events_created_by_fkey(id, full_name)
    `)
    .eq("job_id", jobId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as JobEvent[];
}

export async function createJobEvent(event: Omit<JobEvent, "id" | "created_at">): Promise<JobEvent> {
  const { data, error } = await supabaseAdmin
    .from("job_events")
    .insert([event])
    .select()
    .single();

  if (error) throw error;
  return data as JobEvent;
}

// ============================================
// INSPECTION & DEFICIENCY TYPES
// ============================================

export type InspectionType = "fire_alarm" | "sprinkler_monitoring" | "reinspection" | "fire_marshal_pre";
export type InspectionStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type DeficiencySeverity = "minor" | "major" | "critical";
export type DeficiencyStatus = "open" | "quoted" | "approved" | "in_progress" | "completed";
export type DeficiencyCategory =
  | "emergency_lighting"
  | "duct_smoke"
  | "fire_lane"
  | "panel_trouble"
  | "monitoring"
  | "smoke_detector"
  | "heat_detector"
  | "pull_station"
  | "horn_strobe"
  | "sprinkler_head"
  | "valve"
  | "signage"
  | "documentation"
  | "other";

export interface Inspection {
  id: string;
  inspection_number?: string;
  customer_id?: string;
  customer_name: string;
  site_address: string;
  site_city?: string;
  site_state?: string;
  site_zip?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  inspection_type: InspectionType;
  inspector_id?: string;
  inspector?: Profile;
  scheduled_date?: string;
  scheduled_time?: string;
  duration_minutes?: number;
  actual_start_time?: string;
  actual_end_time?: string;
  status: InspectionStatus;
  passed?: boolean;
  pass_with_deficiencies?: boolean;
  notes?: string;
  internal_notes?: string;
  fire_marshal_notes?: string;
  checklist_results?: ChecklistResult[];
  job_id?: string;
  quote_id?: string;
  created_by?: string;
  creator?: Profile;
  deficiencies?: Deficiency[];
  photos?: InspectionPhoto[];
  customer?: Customer;
  created_at?: string;
  updated_at?: string;
}

export interface ChecklistResult {
  id: string;
  item: string;
  category: string;
  passed: boolean | null;
  notes?: string;
  photo_id?: string;
}

export interface Deficiency {
  id: string;
  inspection_id: string;
  category: DeficiencyCategory;
  location?: string;
  description: string;
  severity: DeficiencySeverity;
  recommended_action?: string;
  code_reference?: string;
  estimated_cost_low?: number;
  estimated_cost_high?: number;
  actual_cost?: number;
  status: DeficiencyStatus;
  quoted_at?: string;
  approved_at?: string;
  completed_at?: string;
  quote_id?: string;
  quote_line_item_id?: string;
  created_by?: string;
  creator?: Profile;
  photos?: InspectionPhoto[];
  created_at?: string;
  updated_at?: string;
}

export interface InspectionPhoto {
  id: string;
  inspection_id: string;
  deficiency_id?: string;
  photo_url: string;
  thumbnail_url?: string;
  caption?: string;
  photo_type: "general" | "deficiency" | "before" | "after" | "panel" | "device";
  location?: string;
  device_tag?: string;
  uploaded_by?: string;
  uploader?: Profile;
  taken_at?: string;
  created_at?: string;
}

export interface InspectionChecklistItem {
  id: string;
  category: string;
  item: string;
  description?: string;
  required: boolean;
}

export interface InspectionChecklist {
  id: string;
  inspection_type: InspectionType;
  name: string;
  description?: string;
  items: InspectionChecklistItem[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// INSPECTION FUNCTIONS
// ============================================

export async function getInspections(filters?: {
  status?: InspectionStatus;
  inspection_type?: InspectionType;
  inspector_id?: string;
  customer_id?: string;
  scheduled_date?: string;
}) {
  let query = supabaseAdmin
    .from("inspections")
    .select(`
      *,
      inspector:profiles!inspections_inspector_id_fkey(id, full_name, email, phone),
      creator:profiles!inspections_created_by_fkey(id, full_name),
      customer:security_customers(id, name, email, phone)
    `)
    .order("scheduled_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.inspection_type) {
    query = query.eq("inspection_type", filters.inspection_type);
  }
  if (filters?.inspector_id) {
    query = query.eq("inspector_id", filters.inspector_id);
  }
  if (filters?.customer_id) {
    query = query.eq("customer_id", filters.customer_id);
  }
  if (filters?.scheduled_date) {
    query = query.eq("scheduled_date", filters.scheduled_date);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Inspection[];
}

export async function getInspectionById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("inspections")
    .select(`
      *,
      inspector:profiles!inspections_inspector_id_fkey(id, full_name, email, phone),
      creator:profiles!inspections_created_by_fkey(id, full_name, email),
      customer:security_customers(id, name, email, phone, address, city, state, zip)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Inspection;
}

export async function getInspectionWithDetails(id: string) {
  // Get inspection
  const inspection = await getInspectionById(id);

  // Get deficiencies
  const deficiencies = await getDeficienciesByInspection(id);

  // Get photos
  const photos = await getInspectionPhotos(id);

  return {
    ...inspection,
    deficiencies,
    photos,
  } as Inspection;
}

export async function createInspection(inspection: Omit<Inspection, "id" | "inspection_number" | "created_at" | "updated_at">) {
  const { data, error } = await supabaseAdmin
    .from("inspections")
    .insert([{
      ...inspection,
      status: inspection.status || "scheduled",
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Inspection;
}

export async function updateInspection(id: string, updates: Partial<Inspection>) {
  const { data, error } = await supabaseAdmin
    .from("inspections")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Inspection;
}

export async function deleteInspection(id: string) {
  const { error } = await supabaseAdmin
    .from("inspections")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

// ============================================
// DEFICIENCY FUNCTIONS
// ============================================

export async function getDeficienciesByInspection(inspectionId: string) {
  const { data, error } = await supabaseAdmin
    .from("deficiencies")
    .select(`
      *,
      creator:profiles!deficiencies_created_by_fkey(id, full_name)
    `)
    .eq("inspection_id", inspectionId)
    .order("severity", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as Deficiency[];
}

export async function getDeficiencyById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("deficiencies")
    .select(`
      *,
      creator:profiles!deficiencies_created_by_fkey(id, full_name)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Deficiency;
}

export async function getOpenDeficiencies(customerId?: string) {
  let query = supabaseAdmin
    .from("deficiencies")
    .select(`
      *,
      inspection:inspections(
        id,
        inspection_number,
        customer_id,
        customer_name,
        site_address
      )
    `)
    .in("status", ["open", "quoted", "approved", "in_progress"])
    .order("severity", { ascending: false })
    .order("created_at", { ascending: false });

  if (customerId) {
    query = query.eq("inspection.customer_id", customerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as (Deficiency & { inspection: Partial<Inspection> })[];
}

export async function createDeficiency(deficiency: Omit<Deficiency, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabaseAdmin
    .from("deficiencies")
    .insert([{
      ...deficiency,
      status: deficiency.status || "open",
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Deficiency;
}

export async function updateDeficiency(id: string, updates: Partial<Deficiency>) {
  const updateData: Partial<Deficiency> & { updated_at: string } = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // Set timestamp fields based on status changes
  if (updates.status === "quoted" && !updates.quoted_at) {
    updateData.quoted_at = new Date().toISOString();
  }
  if (updates.status === "approved" && !updates.approved_at) {
    updateData.approved_at = new Date().toISOString();
  }
  if (updates.status === "completed" && !updates.completed_at) {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from("deficiencies")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Deficiency;
}

export async function deleteDeficiency(id: string) {
  const { error } = await supabaseAdmin
    .from("deficiencies")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

// Link deficiencies to a quote
export async function linkDeficienciesToQuote(deficiencyIds: string[], quoteId: string) {
  const { data, error } = await supabaseAdmin
    .from("deficiencies")
    .update({
      quote_id: quoteId,
      status: "quoted",
      quoted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .in("id", deficiencyIds)
    .select();

  if (error) throw error;
  return data as Deficiency[];
}

// ============================================
// INSPECTION PHOTO FUNCTIONS
// ============================================

export async function getInspectionPhotos(inspectionId: string) {
  const { data, error } = await supabaseAdmin
    .from("inspection_photos")
    .select(`
      *,
      uploader:profiles!inspection_photos_uploaded_by_fkey(id, full_name)
    `)
    .eq("inspection_id", inspectionId)
    .order("taken_at", { ascending: false });

  if (error) throw error;
  return data as InspectionPhoto[];
}

export async function getDeficiencyPhotos(deficiencyId: string) {
  const { data, error } = await supabaseAdmin
    .from("inspection_photos")
    .select(`
      *,
      uploader:profiles!inspection_photos_uploaded_by_fkey(id, full_name)
    `)
    .eq("deficiency_id", deficiencyId)
    .order("taken_at", { ascending: false });

  if (error) throw error;
  return data as InspectionPhoto[];
}

export async function addInspectionPhoto(photo: Omit<InspectionPhoto, "id" | "created_at">) {
  const { data, error } = await supabaseAdmin
    .from("inspection_photos")
    .insert([photo])
    .select()
    .single();

  if (error) throw error;
  return data as InspectionPhoto;
}

export async function updateInspectionPhoto(id: string, updates: Partial<InspectionPhoto>) {
  const { data, error } = await supabaseAdmin
    .from("inspection_photos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as InspectionPhoto;
}

export async function deleteInspectionPhoto(id: string) {
  const { error } = await supabaseAdmin
    .from("inspection_photos")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

// ============================================
// INSPECTION CHECKLIST FUNCTIONS
// ============================================

export async function getInspectionChecklists(inspectionType?: InspectionType) {
  let query = supabaseAdmin
    .from("inspection_checklists")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (inspectionType) {
    query = query.eq("inspection_type", inspectionType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as InspectionChecklist[];
}

export async function getInspectionChecklistById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("inspection_checklists")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as InspectionChecklist;
}

// ============================================
// ASSIGNED INSPECTIONS (for Tech Portal)
// ============================================

export async function getAssignedInspections(inspectorId: string) {
  const { data, error } = await supabaseAdmin
    .from("inspections")
    .select(`
      *,
      customer:security_customers(id, name, email, phone)
    `)
    .eq("inspector_id", inspectorId)
    .in("status", ["scheduled", "in_progress"])
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data as Inspection[];
}

export async function getCompletedInspections(inspectorId: string, limit: number = 20) {
  const { data, error } = await supabaseAdmin
    .from("inspections")
    .select(`
      *,
      customer:security_customers(id, name, email, phone)
    `)
    .eq("inspector_id", inspectorId)
    .eq("status", "completed")
    .order("actual_end_time", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Inspection[];
}
