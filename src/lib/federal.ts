// Federal contracting identity: the SAM.gov registration (all awards) and the
// NAICS codes we bid under. Public record; buyers and AI assistants use these
// to look us up. One source for the Government page, the business schema,
// and /llms.txt.

export const LEGAL_NAME = "Chatman Security & Fire, Inc.";
export const SAM_UEI = "EHW1C5DP8XX7";
export const SAM_CAGE = "262B4";

export const NAICS: [code: string, description: string][] = [
  ["238210", "Electrical & low-voltage contractors: fire alarm, security, access control, cameras, cabling"],
  ["561621", "Security systems services: installation, inspection, testing, and monitoring"],
  ["238220", "Fire sprinkler installation and repair"],
  ["811310", "Fire extinguisher inspection and service"],
  ["238990", "Fire lane striping and other specialty trade work"],
];
