-- Logins live in admin_users. But jobs, job_assignments, job_notes,
-- job_events, job_checklists, inspections, deficiencies and service ticket
-- assignment all foreign-key to profiles — which was empty. The result was that
-- creating a job from the admin panel failed outright on
-- jobs_created_by_fkey, and no employee could be assigned to work.
--
-- Mirror each staff login into profiles under the SAME id so those references
-- resolve and the existing profiles embeds keep showing names. Customers are
-- excluded: they never appear in those tables.

INSERT INTO profiles (id, full_name, email, phone, role, is_active)
SELECT au.id, au.name, au.email, au.phone, au.role, au.is_active
FROM admin_users au
WHERE au.role <> 'customer'
ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      email     = EXCLUDED.email,
      phone     = EXCLUDED.phone,
      role      = EXCLUDED.role,
      is_active = EXCLUDED.is_active;

NOTIFY pgrst, 'reload schema';
