import type { Metadata } from "next";
import ServiceLanding, { type ServiceLandingData } from "@/components/ServiceLanding";

export const metadata: Metadata = {
  title: "Commercial Security Camera Installation Houston TX | Video Surveillance",
  description:
    "Professional commercial security camera & video surveillance installation in Houston and across Texas. HD/4K IP cameras, cloud or on-site recording, remote viewing, and 24/7 monitoring integration. Free assessment: (832) 859-7009.",
  keywords: [
    "commercial security camera installation Houston",
    "video surveillance Houston TX",
    "business CCTV installation Texas",
    "IP camera system commercial",
    "security camera company near me Houston",
    "cloud video surveillance business",
  ],
  alternates: { canonical: "/services/video-surveillance" },
  openGraph: {
    title: "Commercial Security Cameras & Video Surveillance | Chatman Security & Fire",
    description:
      "HD/4K IP camera systems for Houston businesses — cloud or on-site recording, remote viewing, and monitoring integration.",
    url: "https://chatmansecurityandfire.com/services/video-surveillance",
  },
};

const data: ServiceLandingData = {
  iconName: "video",
  bgImage: "/video_surveillance_wide.webp",
  kicker: "Video Surveillance",
  title: "Commercial Security Cameras in Houston, TX",
  intro:
    "See everything, from anywhere. We design and install commercial video surveillance systems for Houston businesses — crisp HD and 4K cameras, reliable recording, and live remote viewing from your phone. Whether you're protecting a storefront, warehouse, office, or multi-site operation, we build a system sized to your property and your budget.",
  subIntro:
    "As a licensed fire and security contractor, we integrate your cameras with alarms and access control so everything works together — one partner, one number to call.",
  whatWeDo: [
    { title: "System Design & Camera Selection", desc: "We walk your property, identify the coverage you actually need, and spec the right cameras — dome, bullet, turret, PTZ, or license-plate capture — with the resolution and low-light performance each area requires. No overselling, no blind spots." },
    { title: "HD & 4K IP Camera Installation", desc: "Clean, professional installation of high-resolution IP cameras with night vision, wide dynamic range, and weatherproof housings for exterior points. Cabling is run neatly and labeled." },
    { title: "Recording & Storage (Cloud or On-Site)", desc: "Choose secure cloud recording, an on-site NVR, or a hybrid. We set retention to match your needs and any insurance or compliance requirements, so the footage is there when you need it." },
    { title: "Remote Viewing & Alerts", desc: "Watch live or play back footage from your phone, tablet, or computer. Set motion alerts on the zones that matter so you know the moment something happens." },
    { title: "Integration & Monitoring", desc: "We tie your cameras into your access control and alarm system and can add professional monitoring, giving you a single, coordinated security picture across the whole property." },
  ],
  howItWorks: [
    { step: "Free On-Site Assessment", detail: "We visit your Houston property, learn your concerns, and map the coverage — entrances, registers, docks, parking, blind spots." },
    { step: "Custom Design & Quote", detail: "You get a clear proposal: camera types and placements, recording plan, and a fixed price. No surprises." },
    { step: "Professional Installation", detail: "Our technicians install and aim every camera, run and label the cabling, and configure recording and remote access." },
    { step: "Training & Support", detail: "We show you how to view, search, and export footage — and we're a phone call away afterward." },
  ],
  pricingRows: [
    { scope: "Small business (4 cameras + recorder)", range: "$2,500 – $5,000" },
    { scope: "Mid-size (8–12 cameras)", range: "$6,000 – $14,000" },
    { scope: "Warehouse / multi-building", range: "$15,000 – $50,000+" },
    { scope: "Cloud recording (per camera, monthly)", range: "$10 – $30/mo" },
  ],
  pricingNote:
    "Every property is different. These are general ranges — we provide an exact quote after a free on-site assessment.",
  faqs: [
    { question: "How many security cameras does my business need?", answer: "It depends on your layout and what you're protecting. Most small businesses start with 4–8 cameras covering entrances, points of sale, and exterior approaches, while warehouses and multi-building sites need more. During your free assessment we map every area that matters and recommend the fewest cameras that eliminate blind spots — coverage over camera count." },
    { question: "Should I use cloud recording or an on-site NVR?", answer: "Both work well — it's about your priorities. Cloud recording is offsite (safe even if hardware is stolen or damaged), needs no on-premise recorder, and is accessible anywhere, with a monthly cost. An on-site NVR has no recurring fee and keeps footage local. Many businesses choose a hybrid. We'll recommend the right fit for your budget and risk." },
    { question: "Can I watch my cameras from my phone?", answer: "Yes. Every system we install includes secure live viewing and playback from your phone, tablet, or computer, with optional motion alerts on the zones you choose. You'll be able to check in on your business anytime, from anywhere." },
    { question: "How long is footage stored?", answer: "That's configurable — commonly 14 to 90 days, depending on the number of cameras, resolution, and your storage plan. Some industries or insurers require specific retention; we'll set it to meet your needs." },
    { question: "Do you service Houston and the surrounding suburbs?", answer: "Yes — Houston, Katy, Sugar Land, The Woodlands, Pearland, Cypress, Spring, and the greater metro. We also travel across Texas for larger projects. Call (832) 859-7009." },
    { question: "Can cameras work with my alarm and door access?", answer: "Absolutely. Because we handle fire, alarm, access control, and cameras under one roof, we integrate them so a door event or alarm can be tied to the right camera view — one coordinated system instead of disconnected parts." },
  ],
  related: [
    { title: "Access Control", href: "/services/access-control", description: "Control who comes through every door and tie it to your cameras." },
    { title: "Security Alarm", href: "/services/security-alarm", description: "Monitored intrusion protection through our Brinks partnership." },
    { title: "Fire Alarm Systems", href: "/services/fire-alarm", description: "Life safety and security from one trusted contractor." },
    { title: "Fiber Optics & Cabling", href: "/services/fiber-optics", description: "The network backbone your camera system runs on." },
  ],
  leadHeading: "Get a Free Camera System Assessment",
  leadSubtext: "Tell us about your property and we'll design a video surveillance system that fits. Response within one business day.",
  leadService: "Video Surveillance",
};

export default function VideoSurveillancePage() {
  return <ServiceLanding data={data} />;
}
