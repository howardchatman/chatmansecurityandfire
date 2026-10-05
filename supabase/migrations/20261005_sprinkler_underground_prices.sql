-- Chatman Security & Fire: sprinkler and underground prices for the proposal price list.
-- Paste into Supabase > SQL Editor and Run. Safe to run more than once.
-- Prices are SUGGESTED starting points. Edit the numbers below before running.

with prices(name, category, unit, unit_cost, description) as (values
  ('SPK-RISER-3IN', 'Fire Sprinkler', 'each', 3800.00, '3-inch wet-pipe riser assembly: alarm check valve, OS&Y gate valve, trim, gauges and drain'),
  ('SPK-MAIN-3IN', 'Fire Sprinkler', 'per ft', 28.00, '3-inch Schedule 10 black steel main, grooved, including fittings and hangers'),
  ('SPK-BRANCH-1IN', 'Fire Sprinkler', 'per ft', 9.00, '1-inch Schedule 40 branch line, threaded, including fittings and hangers'),
  ('SPK-HEAD-PENDANT', 'Fire Sprinkler', 'each', 42.00, 'Quick-response pendent sprinkler head with escutcheon and drop fittings'),
  ('SPK-HEAD-UPRIGHT', 'Fire Sprinkler', 'each', 34.00, 'Quick-response upright sprinkler head with sprig fittings'),
  ('SPK-FLOW-SWITCH', 'Fire Sprinkler', 'each', 325.00, 'Vane-type waterflow alarm switch'),
  ('SPK-TAMPER-SWITCH', 'Fire Sprinkler', 'each', 225.00, 'Supervisory tamper switch for OS&Y valve'),
  ('SPK-ITV', 'Fire Sprinkler', 'each', 285.00, 'Inspector''s test and drain valve assembly with sight glass'),
  ('SPK-HYDRO-TEST', 'Fire Sprinkler', 'each', 650.00, '200 psi two-hour hydrostatic test of the system'),
  ('SPK-HYDRAULIC-CALC', 'Fire Sprinkler', 'each', 1800.00, 'Hydraulic calculations and shop drawings for permit submittal'),
  ('SPK-PERMIT', 'Fire Sprinkler', 'each', 750.00, 'Permit and plan review fee allowance'),
  ('UG-4IN-C900', 'Underground Fire Line', 'per ft', 22.00, '4-inch C900 DR14 PVC underground fire line pipe with fittings'),
  ('UG-WETTAP-4IN', 'Underground Fire Line', 'each', 4500.00, '4-inch wet tap with tapping sleeve and tapping valve'),
  ('UG-GATE-VALVE-4IN', 'Underground Fire Line', 'each', 1200.00, '4-inch resilient wedge gate valve with valve box'),
  ('UG-THRUST-BLOCK', 'Underground Fire Line', 'each', 350.00, 'Poured concrete thrust block'),
  ('UG-FDC', 'Underground Fire Line', 'each', 1450.00, 'Fire department connection, 2.5 x 2.5 x 4-inch, with check valve'),
  ('UG-BACKFLOW-4IN', 'Underground Fire Line', 'each', 4800.00, '4-inch double check detector backflow assembly with test cocks'),
  ('UG-FLOW-TEST', 'Underground Fire Line', 'each', 650.00, 'Fire hydrant flow test for hydraulic design'),
  ('UG-HYDRO-DISINFECT', 'Underground Fire Line', 'each', 950.00, 'Hydrostatic test, flush and disinfection of the underground fire line'),
  ('UG-PERMIT', 'Underground Fire Line', 'each', 750.00, 'Underground fire line permit and plan review fee allowance')
),
updated as (
  update proposal_inventory p
     set unit_cost = v.unit_cost,
         unit = v.unit,
         category = coalesce(nullif(p.category, ''), v.category),
         description = coalesce(nullif(p.description, ''), v.description),
         updated_at = now()
    from prices v
   where lower(p.name) = lower(v.name)
  returning p.name
)
insert into proposal_inventory (name, category, unit, unit_cost, description)
select v.name, v.category, v.unit, v.unit_cost, v.description
  from prices v
 where not exists (select 1 from proposal_inventory p where lower(p.name) = lower(v.name));
