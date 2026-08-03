-- Link customer-role logins to a customers row so the portal can scope
-- invoices / payments / project data to "this customer only".
--
-- Until this runs, the app resolves a customer by matching admin_users.email
-- against customers.email (see src/lib/customer.ts). This column makes that
-- linkage explicit and reliable (e.g. when the login email differs from the
-- billing email).

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_admin_users_customer_id ON admin_users(customer_id);
