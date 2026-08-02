import type { Metadata } from "next";
import ServiceLanding, { type ServiceLandingData } from "@/components/ServiceLanding";

export const metadata: Metadata = {
  title: "Nurse Call System Installation Houston TX | Assisted Living & Healthcare",
  description:
    "Nurse call system installation, upgrades, and service in Houston and across Texas. For assisted living, senior care, clinics, and hospitals — reliable call stations, dome lights, and reporting built to UL 1069. (832) 859-7009.",
  keywords: [
    "nurse call system installation Houston",
    "assisted living nurse call system Texas",
    "senior living call system",
    "healthcare nurse call installer",
    "UL 1069 nurse call",
    "wireless nurse call system",
  ],
  alternates: { canonical: "/services/nurse-call" },
  openGraph: {
    title: "Nurse Call Systems | Chatman Security & Fire",
    description:
      "Reliable nurse call systems for Houston assisted living, senior care, and healthcare facilities — call stations, dome lights, and reporting built to UL 1069.",
    url: "https://chatmansecurityandfire.com/services/nurse-call",
  },
};

const data: ServiceLandingData = {
  iconName: "nurse",
  bgImage: "/nurse_call_wide.png",
  kicker: "Nurse Call Systems",
  title: "Nurse Call Systems in Houston, TX",
  intro:
    "When a resident or patient needs help, every second counts. We install and service nurse call systems for Houston-area assisted living communities, senior care homes, clinics, and healthcare facilities — dependable call stations, corridor dome lights, and clear reporting that get staff to the right room, fast.",
  subIntro:
    "From a small residential care home to a multi-wing facility, we design systems that meet healthcare standards and give families and surveyors confidence that residents are safe.",
  whatWeDo: [
    { title: "New Nurse Call Installation", desc: "Room call stations, bathroom pull cords, bed-side calls, and corridor dome lights installed throughout your facility so a call is raised and located instantly." },
    { title: "System Upgrades & Replacements", desc: "Aging or failing nurse call system? We replace outdated equipment with modern, reliable systems — including wireless options that reduce disruption and cost." },
    { title: "Wireless & Wander Management", desc: "Wireless pendants and pull stations for flexibility, plus optional wander-management and door alerts for memory-care residents." },
    { title: "Reporting & Accountability", desc: "Systems that log calls and response times, giving administrators the documentation they need for quality assurance and state survey readiness." },
    { title: "Service, Testing & Support", desc: "Ongoing testing, maintenance, and fast repair — because a nurse call system has to work every single time. We keep yours dependable." },
  ],
  howItWorks: [
    { step: "Facility Assessment", detail: "We review your rooms, corridors, bathrooms, and staffing workflow to design coverage that fits how your team actually responds." },
    { step: "Design & Quote", detail: "You get a clear plan — call points, dome lights, annunciation, and reporting — with a fixed price, wired or wireless." },
    { step: "Installation with Minimal Disruption", detail: "We install carefully around residents and operations, often using wireless to keep disruption low, and verify every call point works." },
    { step: "Training & Ongoing Support", detail: "We train your staff and provide testing and service so the system stays reliable and survey-ready." },
  ],
  standardsIntro: "Nurse call is life-safety-critical equipment held to healthcare standards. We build to:",
  standards: [
    { code: "UL 1069 (Hospital Signaling & Nurse Call)", detail: "The core standard covering nurse call equipment performance and reliability." },
    { code: "FGI Guidelines & state licensing", detail: "Design aligned with healthcare facility guidelines and Texas assisted-living/care-facility requirements." },
    { code: "Documented response reporting", detail: "Call and response logging to support quality assurance and state survey readiness." },
  ],
  pricingRows: [
    { scope: "Small residential care home", range: "$3,000 – $8,000" },
    { scope: "Assisted living (per wing/unit)", range: "$10,000 – $30,000" },
    { scope: "Large / multi-wing facility", range: "$30,000 – $100,000+" },
    { scope: "Wireless retrofit (per room)", range: "$300 – $700" },
  ],
  pricingNote:
    "Cost depends on facility size, wired vs. wireless, and features like wander management. We quote exactly after a facility assessment.",
  faqs: [
    { question: "What is a nurse call system and who needs one?", answer: "A nurse call system lets residents or patients signal for help from their room, bed, or bathroom, alerting staff and showing exactly where the call came from via corridor dome lights and a central annunciator. Assisted living communities, senior care homes, memory care, clinics, and hospitals rely on them — and they're typically required for licensing." },
    { question: "Do you install wired or wireless nurse call systems?", answer: "Both. Wired systems are robust for new construction and major renovations; wireless systems are ideal for retrofits and existing buildings because they install faster with far less disruption to residents and less cost. We'll recommend the right approach for your facility." },
    { question: "Can you replace or upgrade our old nurse call system?", answer: "Yes — this is a big part of what we do. If your current system is unreliable, obsolete, or failing survey, we replace it with a modern system, often using wireless components to minimize downtime and keep residents safe throughout the transition." },
    { question: "Does the system meet state survey and licensing requirements?", answer: "We design to UL 1069 and align with FGI guidelines and Texas care-facility requirements, including call/response documentation many surveyors look for. We help you stay survey-ready." },
    { question: "Can it include fall pendants or wander management?", answer: "Yes. We can add wearable pendants so residents can call for help anywhere, plus wander-management and door alerts for memory-care residents who are at risk of leaving safely-monitored areas." },
    { question: "Do you serve assisted living facilities across the Houston area?", answer: "Yes — Houston, Katy, Sugar Land, The Woodlands, Pearland, Cypress, Spring, and the greater metro, plus statewide for larger facilities. Call (832) 859-7009." },
  ],
  related: [
    { title: "Fire Alarm Systems", href: "/services/fire-alarm", description: "Life safety for care facilities from the same trusted team." },
    { title: "PA & Mass Notification", href: "/services/pa-systems", description: "Facility-wide communication and emergency alerts." },
    { title: "Access Control", href: "/services/access-control", description: "Secure entry and wander-management door control." },
    { title: "Video Surveillance", href: "/services/video-surveillance", description: "Eyes on common areas and entrances." },
  ],
  leadHeading: "Get a Free Nurse Call Assessment",
  leadSubtext: "Tell us about your facility and we'll design a nurse call system that keeps residents safe. Response within one business day.",
  leadService: "Nurse Call Systems",
};

export default function NurseCallPage() {
  return <ServiceLanding data={data} />;
}
