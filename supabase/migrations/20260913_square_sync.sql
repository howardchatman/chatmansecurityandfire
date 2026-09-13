-- Square sync: catalog (price list) → proposal_inventory, customers → customers,
-- invoices → invoices.
--
-- Each imported row remembers its Square id so re-running the sync updates the
-- same row instead of creating a duplicate. The unique indexes are what make
-- the upserts idempotent.

alter table proposal_inventory add column if not exists square_catalog_id text;
alter table customers          add column if not exists square_customer_id text;
alter table invoices           add column if not exists square_invoice_id text;

create unique index if not exists proposal_inventory_square_id_idx
  on proposal_inventory (square_catalog_id) where square_catalog_id is not null;
create unique index if not exists customers_square_id_idx
  on customers (square_customer_id) where square_customer_id is not null;
create unique index if not exists invoices_square_id_idx
  on invoices (square_invoice_id) where square_invoice_id is not null;

-- When the last sync ran and what it did, for the Integrations page.
create table if not exists square_sync_state (
  id text primary key default 'default',
  last_synced_at timestamptz,
  customers_synced int not null default 0,
  catalog_synced int not null default 0,
  invoices_synced int not null default 0,
  errors jsonb not null default '[]'::jsonb,
  constraint square_sync_state_singleton check (id = 'default')
);
alter table square_sync_state enable row level security;
-- No policies: service role only.
