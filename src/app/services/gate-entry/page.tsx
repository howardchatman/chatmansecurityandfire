import type { Metadata } from "next";
import ServiceLanding, { type ServiceLandingData } from "@/components/ServiceLanding";

export const metadata: Metadata = {
  title: "Commercial Gate Entry Systems & Keypads Houston TX | Automated Gate Access",
  description:
    "Commercial gate entry systems, keypads, call boxes, and telephone entry installation in Houston and across Texas. Automated slide & swing gate operators with mobile access and fire department override. (832) 859-7009.",
  keywords: [
    "commercial gate entry system Houston",
    "gate keypad installation Texas",
    "automated gate operator commercial",
    "telephone entry system Houston",
    "gate access control installer",
    "apartment gate entry system",
  ],
  alternates: { canonical: "/services/gate-entry" },
  openGraph: {
    title: "Gate Entry Systems & Keypads | Chatman Security & Fire",
    description:
      "Automated commercial gate operators, keypads, call boxes, and telephone entry for Houston properties — with mobile access and fire department override.",
    url: "https://chatmansecurityandfire.com/services/gate-entry",
  },
};

const data: ServiceLandingData = {
  iconName: "gate",
  bgImage: "/gate_entry_wide.webp",
  kicker: "Gate Entry Systems",
  title: "Commercial Gate Entry Systems in Houston, TX",
  intro:
    "Control who drives onto your property. We install and service commercial gate entry systems for Houston businesses, apartment communities, warehouses, and gated lots — automated slide and swing gate operators, keypads, call boxes, telephone entry, and vehicle access, all tied to who you actually want to let in.",
  subIntro:
    "Every gate we install includes proper fire department access so first responders are never locked out — a fire-code requirement we handle as part of the job.",
  whatWeDo: [
    { title: "Automated Gate Operators", desc: "Slide and swing gate operators sized to your gate and traffic volume, with safety loops, photo-eyes, and reliable operation in Houston heat and weather." },
    { title: "Keypads, Call Boxes & Telephone Entry", desc: "PIN keypads for staff, call boxes and telephone-entry stations that ring your phone so you can buzz visitors in remotely, and directory systems for multi-tenant properties." },
    { title: "Vehicle & Mobile Access", desc: "RFID tags and readers for hands-free vehicle entry, plus mobile app access so you can open the gate and manage users from your phone." },
    { title: "Access Control Integration", desc: "We tie your gate into the same access control and camera systems that secure your doors, so entry is coordinated and every event is logged." },
    { title: "Fire Department Access (Code Required)", desc: "We install Knox key switches or approved override devices so the fire department can open your gate in an emergency — required by fire code and verified at inspection." },
  ],
  howItWorks: [
    { step: "Site Assessment", detail: "We evaluate your gate, driveway, power, traffic flow, and how you want visitors and staff to enter." },
    { step: "Design & Quote", detail: "You get a clear plan — operator, entry devices, safety equipment, and fire department access — with a fixed price." },
    { step: "Installation & Safety Setup", detail: "We install the operator and entry system, configure users, and set up all required safety and fire-department-access devices." },
    { step: "Training & Service", detail: "We show you how to manage access, then keep the gate running with maintenance and fast repair." },
  ],
  standardsIntro: "Automated gates are powerful equipment near people and vehicles, so safety and access codes matter. We build to:",
  standards: [
    { code: "UL 325 gate operator safety", detail: "Photo-eyes, safety edges, and entrapment protection so the gate operates safely around vehicles and pedestrians." },
    { code: "Fire department access", detail: "Knox switch or approved override so first responders can enter — required by the fire code and checked by the AHJ." },
    { code: "ADA / egress considerations", detail: "Pedestrian access and safe egress handled alongside vehicle gates." },
  ],
  pricingRows: [
    { scope: "Keypad or call box (existing gate)", range: "$1,200 – $3,500" },
    { scope: "Single automated gate operator + entry", range: "$5,000 – $12,000" },
    { scope: "Dual gate / telephone entry + directory", range: "$12,000 – $30,000+" },
    { scope: "Fire department access device", range: "$400 – $1,200" },
  ],
  pricingNote:
    "Gate projects vary widely by gate type, power availability, and entry features. We quote exactly after a site assessment.",
  faqs: [
    { question: "How much does a commercial gate entry system cost?", answer: "Adding a keypad or call box to an existing gate often runs $1,200–$3,500, while a full automated gate operator with an entry system typically runs $5,000–$12,000, and larger dual-gate or telephone-entry/directory setups more. Power availability and gate type are the biggest cost factors. We provide an exact quote after a free site assessment." },
    { question: "Can I open my gate and manage access from my phone?", answer: "Yes. We install systems with mobile app control so you can open the gate remotely, add or remove users, and see entry activity from your phone — plus RFID tags for hands-free vehicle entry and keypads or call boxes for visitors." },
    { question: "Do I need fire department access on my gate?", answer: "Yes — the fire code requires that automated gates allow emergency access so the fire department is never locked out. We install a Knox key switch or approved override device and coordinate with your local fire marshal so it passes inspection. See our Knox Box & Fire Department Access page for details." },
    { question: "What's the difference between a keypad and a call box?", answer: "A keypad lets people with a code enter themselves — ideal for staff and tenants. A call box (or telephone entry) lets a visitor call you; you can talk to them and buzz the gate open from your phone. Many properties use both, plus RFID for vehicles." },
    { question: "Can you fix or upgrade an existing gate?", answer: "Yes. We repair failing gate operators, replace obsolete entry equipment, add keypads/call boxes or mobile access to existing gates, and bring older gates up to current safety and fire-access code." },
    { question: "Do you install gate systems across the Houston area?", answer: "Yes — Houston, Katy, Sugar Land, The Woodlands, Pearland, Cypress, Spring, and the greater metro, plus statewide for larger projects. Call (832) 859-7009." },
  ],
  related: [
    { title: "Fire Department Access & Knox Box", href: "/services/fire-department-access", description: "Required emergency access for gates and buildings." },
    { title: "Access Control", href: "/services/access-control", description: "Coordinate gate and door access on one system." },
    { title: "Video Surveillance", href: "/services/video-surveillance", description: "Cameras at the gate and across your property." },
    { title: "Security Alarm", href: "/services/security-alarm", description: "Monitored protection through our Brinks partnership." },
  ],
  leadHeading: "Get a Free Gate Entry Assessment",
  leadSubtext: "Tell us about your gate and property and we'll design entry that fits — with fire department access built in. Response within one business day.",
  leadService: "Gate Entry Systems",
};

export default function GateEntryPage() {
  return <ServiceLanding data={data} />;
}
