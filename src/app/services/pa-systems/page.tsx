import type { Metadata } from "next";
import ServiceLanding, { type ServiceLandingData } from "@/components/ServiceLanding";

export const metadata: Metadata = {
  title: "Commercial PA & Mass Notification Systems Houston TX | Paging & Intercom",
  description:
    "Commercial PA systems, intercom, paging, and mass notification installation in Houston and across Texas. Clear building-wide audio, emergency alerts, and fire alarm voice-evacuation integration. (832) 859-7009.",
  keywords: [
    "commercial PA system installation Houston",
    "mass notification system Texas",
    "school intercom paging system",
    "warehouse paging system Houston",
    "voice evacuation system",
    "overhead paging installer near me",
  ],
  alternates: { canonical: "/services/pa-systems" },
  openGraph: {
    title: "PA & Mass Notification Systems | Chatman Security & Fire",
    description:
      "Clear paging, intercom, background music, and emergency mass notification for Houston facilities — integrated with fire alarm voice evacuation.",
    url: "https://chatmansecurityandfire.com/services/pa-systems",
  },
};

const data: ServiceLandingData = {
  iconName: "pa",
  bgImage: "/pa_system_wide.webp",
  kicker: "PA & Mass Notification",
  title: "PA & Mass Notification Systems in Houston, TX",
  intro:
    "Be heard everywhere, instantly. We install commercial PA, paging, intercom, and mass notification systems for Houston schools, warehouses, offices, retail, and healthcare facilities — clear audio in every corner, plus the ability to broadcast an emergency message building-wide in seconds.",
  subIntro:
    "As a licensed fire alarm contractor, we can integrate your paging with fire alarm voice evacuation and emergency communication, so day-to-day announcements and life-safety alerts run on one coordinated system.",
  whatWeDo: [
    { title: "Overhead Paging & Announcements", desc: "Building-wide or zoned paging so a page reaches the whole facility or just the warehouse floor, front office, or a specific department — clearly, without distortion." },
    { title: "Intercom & Communication", desc: "Door intercoms, room-to-room communication, and entry stations that let staff screen visitors and communicate across the building." },
    { title: "Background Music & Zoning", desc: "Play music or messaging in customer areas, set different zones with independent volume, and schedule bells or tones for shift changes and schools." },
    { title: "Mass Notification / Emergency Alerts", desc: "Broadcast live or pre-recorded emergency messages — severe weather, lockdown, evacuation — across the entire facility instantly, with clarity that gets people moving." },
    { title: "Fire Alarm Voice Integration", desc: "Where required, we integrate paging with fire alarm voice evacuation and emergency communication systems (ECS) so life-safety messaging takes priority automatically." },
  ],
  howItWorks: [
    { step: "Acoustic Walk-Through", detail: "We assess your building's size, layout, ceiling heights, and noise levels to plan speaker placement for even, intelligible coverage." },
    { step: "System Design & Quote", detail: "You get a zoned design — speakers, amplifiers, paging stations, and any emergency integration — with a fixed price." },
    { step: "Installation & Tuning", detail: "We install and tune the system so every zone is clear and at the right volume, with no dead spots or feedback." },
    { step: "Training & Support", detail: "We train your staff on paging, zones, and emergency broadcast, and support you afterward." },
  ],
  standardsIntro: "When paging doubles as life-safety communication, it must meet the right standards. We build to:",
  standards: [
    { code: "NFPA 72 Emergency Communication Systems (ECS)", detail: "Voice evacuation and mass notification integrated with fire alarm must meet intelligibility and priority requirements." },
    { code: "Speech intelligibility (STI) targets", detail: "Emergency messages must be clearly understandable throughout the occupiable areas, not just audible." },
    { code: "Zoned notification", detail: "Systems are zoned so the right message reaches the right area — critical for phased evacuation and lockdown." },
  ],
  pricingRows: [
    { scope: "Small office / retail paging", range: "$2,000 – $6,000" },
    { scope: "School / mid-size facility", range: "$8,000 – $25,000" },
    { scope: "Warehouse / large facility", range: "$15,000 – $60,000+" },
    { scope: "Fire alarm voice evacuation (add-on)", range: "$5,000 – $20,000+" },
  ],
  pricingNote:
    "Coverage needs vary widely by building. We provide an exact quote after an on-site acoustic assessment.",
  faqs: [
    { question: "What's the difference between a PA system and mass notification?", answer: "A PA (public address) system handles everyday paging, announcements, and background music. Mass notification builds on that to broadcast urgent, high-priority alerts — weather, lockdown, evacuation — clearly and instantly across the whole facility. We can install either, or one system that does both, and integrate it with your fire alarm where required." },
    { question: "Can you cover a large warehouse with clear audio?", answer: "Yes. High-ceiling, high-noise spaces like warehouses need the right speakers, amplifier power, and zoning to stay intelligible. We do an acoustic walk-through and design coverage so pages are clear on the floor, at the docks, and in the office — no muffled dead spots." },
    { question: "Do you install school intercom and bell systems?", answer: "Yes — classroom paging, office-to-room communication, scheduled class bells, and emergency/lockdown mass notification for schools and daycares, designed to meet life-safety expectations." },
    { question: "Can the PA system tie into our fire alarm?", answer: "Yes. As a licensed fire alarm contractor, we integrate paging with fire alarm voice evacuation and emergency communication systems so a fire or emergency message automatically takes priority over normal paging — one coordinated, code-compliant system." },
    { question: "Can we play different audio in different areas?", answer: "Yes. Zoning lets you page or play music independently by area — for example, music up front, silence in the warehouse, and an all-call that reaches everyone. Volume is set per zone." },
    { question: "Do you serve the greater Houston area?", answer: "Yes — Houston, Katy, Sugar Land, The Woodlands, Pearland, Cypress, Spring, and beyond, plus statewide for larger projects. Call (832) 859-7009." },
  ],
  related: [
    { title: "Fire Alarm Systems", href: "/services/fire-alarm", description: "Voice evacuation and emergency communication integration." },
    { title: "Nurse Call Systems", href: "/services/nurse-call", description: "Communication and response for healthcare facilities." },
    { title: "Video Surveillance", href: "/services/video-surveillance", description: "Pair notification with eyes on every area." },
    { title: "Fiber Optics & Cabling", href: "/services/fiber-optics", description: "The low-voltage backbone your audio system needs." },
  ],
  leadHeading: "Get a Free PA / Notification Assessment",
  leadSubtext: "Tell us about your facility and we'll design audio and emergency notification that fits. Response within one business day.",
  leadService: "PA & Mass Notification",
};

export default function PaSystemsPage() {
  return <ServiceLanding data={data} />;
}
