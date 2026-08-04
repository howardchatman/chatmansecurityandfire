-- Employee onboarding by invite link.
--
-- Previously the only way to onboard someone was for an admin to create the
-- account, read a generated temporary password off the screen, and pass it
-- along out of band. This lets us email a one-time enrollment link instead so
-- the employee sets their own password and the admin never handles it.

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS invite_token TEXT,
  ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invite_accepted_at TIMESTAMPTZ;

-- Tokens are single-use and looked up directly, so they must be unique.
-- Partial index: many rows legitimately have no pending invite.
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_invite_token
  ON admin_users(invite_token)
  WHERE invite_token IS NOT NULL;

NOTIFY pgrst, 'reload schema';
