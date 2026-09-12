-- Checklists for the two inspection types added in 20260912_inspection_report_types.
-- Separate file on purpose: the enum values must be committed before a row can
-- reference them.

INSERT INTO public.inspection_checklists (inspection_type, name, description, items) VALUES
('fire_extinguisher', 'NFPA 10 Fire Extinguisher Inspection', 'Annual portable fire extinguisher inspection per NFPA 10', '[
  {"id": "ext_location", "category": "Site", "item": "Extinguishers in designated locations", "description": "Each unit is where the placement plan says it should be", "required": true},
  {"id": "ext_access", "category": "Site", "item": "Access and visibility unobstructed", "description": "Nothing blocking the extinguisher or its signage", "required": true},
  {"id": "ext_mounting", "category": "Site", "item": "Mounted at proper height", "description": "Handle no more than 5 ft (3.5 ft if over 40 lb) above the floor", "required": true},
  {"id": "ext_signage", "category": "Site", "item": "Location signage present", "description": "Signs or markings identify each extinguisher location", "required": false},
  {"id": "ext_travel", "category": "Site", "item": "Travel distance within limits", "description": "75 ft for Class A, 30 ft for Class B, 30 ft for Class K", "required": true},
  {"id": "ext_gauge", "category": "Units", "item": "Pressure gauge in operable range", "description": "Needle in the green on every stored-pressure unit", "required": true},
  {"id": "ext_seal", "category": "Units", "item": "Tamper seal and pull pin intact", "description": "No evidence of use or tampering", "required": true},
  {"id": "ext_condition", "category": "Units", "item": "No physical damage, corrosion, or leakage", "description": "Shell, hose, nozzle, and handle in good condition", "required": true},
  {"id": "ext_label", "category": "Units", "item": "Operating instructions legible and facing outward", "description": "Nameplate and instructions readable", "required": true},
  {"id": "ext_weight", "category": "Units", "item": "Fullness verified", "description": "Hefted or weighed; cartridge-operated units weighed", "required": true},
  {"id": "ext_hydro", "category": "Maintenance", "item": "Hydrostatic test current", "description": "5-year (water/CO2) or 12-year (dry chemical) hydro test within date", "required": true},
  {"id": "ext_six_year", "category": "Maintenance", "item": "Six-year maintenance current", "description": "Internal examination within date on stored-pressure dry chemical units", "required": true},
  {"id": "ext_tag", "category": "Documentation", "item": "Inspection tag attached and updated", "description": "Tag punched with month, year, and inspector", "required": true},
  {"id": "ext_records", "category": "Documentation", "item": "Inspection records current", "description": "Monthly inspection record on tag or in log", "required": false}
]'::jsonb),

('kitchen_hood', 'Pre-Engineered Restaurant Fire Suppression System Inspection', 'Semi-annual kitchen hood suppression inspection per NFPA 17A and NFPA 96', '[
  {"id": "hood_01", "category": "System Inspection", "item": "All appliances properly covered w/ correct nozzles", "required": true},
  {"id": "hood_02", "category": "System Inspection", "item": "Duct and plenum covered w/ correct nozzles", "required": true},
  {"id": "hood_03", "category": "System Inspection", "item": "Check positioning of all nozzles", "required": true},
  {"id": "hood_04", "category": "System Inspection", "item": "System installed in accordance w/ MFG UL listing", "required": true},
  {"id": "hood_05", "category": "System Inspection", "item": "Hood / duct penetrations sealed w/ weld or UL device", "required": true},
  {"id": "hood_06", "category": "System Inspection", "item": "Check if seals intact, evidence of tampering", "required": true},
  {"id": "hood_07", "category": "System Inspection", "item": "If system has been discharged, report same", "required": false},
  {"id": "hood_08", "category": "System Inspection", "item": "Pressure gauge in proper range (if gauged)", "required": true},
  {"id": "hood_09", "category": "System Inspection", "item": "Check cartridge weight (if applicable)", "required": false},
  {"id": "hood_10", "category": "System Inspection", "item": "Hydrostatic test date", "required": false},
  {"id": "hood_11", "category": "System Inspection", "item": "6 year maintenance date", "required": false},
  {"id": "hood_12", "category": "System Inspection", "item": "Inspect cylinder and mount", "required": true},
  {"id": "hood_13", "category": "System Inspection", "item": "Operate system from terminal link", "required": true},
  {"id": "hood_14", "category": "System Inspection", "item": "Test for proper operation from remote", "required": true},
  {"id": "hood_15", "category": "System Inspection", "item": "Check operation of micro switch", "required": true},
  {"id": "hood_16", "category": "System Inspection", "item": "Check operation of gas valve", "required": true},
  {"id": "hood_17", "category": "System Inspection", "item": "Clean nozzles", "required": true},
  {"id": "hood_18", "category": "System Inspection", "item": "Proper nozzle covers in place", "required": true},
  {"id": "hood_19", "category": "System Inspection", "item": "Check fuse links and clean", "required": true},
  {"id": "hood_20", "category": "System Inspection", "item": "Replaced fuse links", "required": false},
  {"id": "hood_21", "category": "System Inspection", "item": "Check travel of cable nuts / S-hooks", "required": true},
  {"id": "hood_22", "category": "System Inspection", "item": "Piping and conduit securely bracketed", "required": true},
  {"id": "hood_23", "category": "System Inspection", "item": "Proper separation between fryers and flame", "required": true},
  {"id": "hood_24", "category": "System Inspection", "item": "Proper clearance-flame to filters", "required": true},
  {"id": "hood_25", "category": "System Inspection", "item": "Exhaust fan in operating order", "required": true},
  {"id": "hood_26", "category": "System Inspection", "item": "All filters in place", "required": true},
  {"id": "hood_27", "category": "System Inspection", "item": "Fuel shut-off is in \"ON\" position", "required": true},
  {"id": "hood_28", "category": "System Inspection", "item": "Manual & remote set / seals in place", "required": true},
  {"id": "hood_29", "category": "System Inspection", "item": "Replace system covers", "required": true},
  {"id": "hood_30", "category": "System Inspection", "item": "System operational & seals in place", "required": true},
  {"id": "hood_31", "category": "System Inspection", "item": "Slave system operational", "required": false},
  {"id": "hood_32", "category": "System Inspection", "item": "Clean cylinder & mount", "required": true},
  {"id": "hood_33", "category": "System Inspection", "item": "Fan warning sign on hood", "required": true},
  {"id": "hood_34", "category": "System Inspection", "item": "Personnel instructed in manual operation of system", "required": true},
  {"id": "hood_35", "category": "System Inspection", "item": "Proper hand portable extinguishers", "required": true},
  {"id": "hood_36", "category": "System Inspection", "item": "Portable extinguishers properly serviced", "required": true},
  {"id": "hood_37", "category": "System Inspection", "item": "Service & Certification tag on system", "required": true},
  {"id": "hood_38", "category": "System Inspection", "item": "Discrepancies or deficiencies noted", "description": "Mark failed and describe any discrepancy found", "required": false}
]'::jsonb)
ON CONFLICT DO NOTHING;
