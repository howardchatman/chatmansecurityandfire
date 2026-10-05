-- Saving a proposal draft has been failing.
--
-- Both the Proposal Agent and the AI draft page insert `total` and
-- `proposal_type` into proposal_history, but the table was created without
-- them, so every save came back "Could not find the 'proposal_type' column".
-- The draft page also never linked the saved draft to a customer, so even a
-- save that worked could not show up on the customer's page.
--
-- Adds the two missing columns and a customer link, then links any draft that
-- already carries a customer id inside its proposal_data.

alter table proposal_history
  add column if not exists total numeric(12,2),
  add column if not exists proposal_type text,
  add column if not exists customer_id uuid references customers(id) on delete set null;

create index if not exists proposal_history_customer_idx on proposal_history (customer_id);

update proposal_history ph
   set customer_id = c.id
  from customers c
 where ph.customer_id is null
   and ph.proposal_data ->> 'customer_id' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
   and c.id = (ph.proposal_data ->> 'customer_id')::uuid;
