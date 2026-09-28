// Every service the site offers, in one place.
//
// The business schema, llms.txt, and anything else that describes "what
// Chatman does" to search engines and AI assistants reads from this list, so
// adding a service page means adding one line here — not hunting down three
// hand-maintained copies that drift apart (the old schema listed 7 of 16).

export interface SiteService {
  slug: string;
  name: string;
  summary: string;
}

export const siteServices: SiteService[] = [
  { slug: "fire-marshal-compliance", name: "Fire Marshal Inspection Corrections", summary: "Correcting fire marshal violations and deficiency reports, then supporting re-inspection." },
  { slug: "fire-alarm", name: "Commercial Fire Alarm Systems", summary: "Fire alarm installation, repair, inspection, and inspection corrections (NFPA 72)." },
  { slug: "fire-sprinkler", name: "Fire Sprinkler Systems", summary: "Fire sprinkler installation, repair, and NFPA 13 compliance, including underground fire lines." },
  { slug: "fire-extinguishers", name: "Fire Extinguisher Service", summary: "Fire extinguisher inspection, sales, tagging, and kitchen hood suppression service." },
  { slug: "emergency-lighting", name: "Emergency Lighting & Exit Signs", summary: "Emergency and exit light installation, testing, and inspection corrections." },
  { slug: "fire-lane-marking", name: "Fire Lane Marking & Striping", summary: "Fire lane curb painting, striping, and signage to fire code." },
  { slug: "fire-department-access", name: "Knox Box & Fire Department Access", summary: "Knox box and rapid-entry installation for required fire department access." },
  { slug: "consulting", name: "Fire & Life-Safety Consulting", summary: "Code consulting, plan review support, and compliance planning for fire and life safety." },
  { slug: "access-control", name: "Commercial Access Control", summary: "Door access control, card and key-fob entry, and electronic locking for businesses." },
  { slug: "video-surveillance", name: "Commercial Security Cameras", summary: "Security camera and video surveillance system installation for businesses." },
  { slug: "security-alarm", name: "Brinks Security Alarm Systems", summary: "Brinks home and business security alarm systems as an authorized dealer." },
  { slug: "gate-entry", name: "Commercial Gate Entry Systems", summary: "Automated gate access, keypads, and gate entry systems." },
  { slug: "pa-systems", name: "PA & Mass Notification Systems", summary: "Commercial paging, intercom, and mass notification / voice evacuation systems." },
  { slug: "nurse-call", name: "Nurse Call Systems", summary: "Nurse call system installation for assisted living and healthcare facilities." },
  { slug: "fiber-optics", name: "Fiber Optic & Structured Cabling", summary: "Fiber optic cabling and structured cabling installation." },
  { slug: "wireless-internet", name: "Commercial WiFi & Networks", summary: "Commercial WiFi and wireless business network installation." },
];

export const SITE_URL = "https://www.chatmansecurityandfire.com";
