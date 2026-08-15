import type { Metadata } from "next";
import ServiceLanding, { type ServiceLandingData } from "@/components/ServiceLanding";

export const metadata: Metadata = {
  title: "Commercial Access Control Systems Houston TX | Door Access & Key Fobs",
  description:
    "Commercial access control installation in Houston and across Texas. Key fobs, keypads, mobile credentials, and cloud-managed door access with audit trails. Secure your doors and stay code-compliant. (832) 859-7009.",
  keywords: [
    "access control systems Houston",
    "commercial door access control Texas",
    "key fob entry system business",
    "cloud access control Houston",
    "keyless entry commercial building",
    "access control installer near me",
  ],
  alternates: { canonical: "/services/access-control" },
  openGraph: {
    title: "Commercial Access Control Systems | Chatman Security & Fire",
    description:
      "Key fob, keypad, and mobile-credential door access for Houston businesses — cloud-managed, with audit trails and fire-code-compliant egress.",
    url: "https://www.chatmansecurityandfire.com/services/access-control",
  },
};

const data: ServiceLandingData = {
  iconName: "access",
  bgImage: "/access_control_wide.webp",
  kicker: "Access Control",
  title: "Commercial Access Control in Houston, TX",
  intro:
    "Know exactly who can open every door — and when. We install commercial access control systems for Houston businesses using key fobs, keypads, mobile phone credentials, and biometrics. Replace lost keys and rekeying headaches with instant control: grant access in seconds, revoke it just as fast, and see a full record of every entry.",
  subIntro:
    "We design access control that keeps you secure and keeps your exits code-compliant — because a locked door still has to let people out safely in an emergency.",
  whatWeDo: [
    { title: "Door Hardware & Reader Installation", desc: "Electric strikes, magnetic locks, request-to-exit devices, and readers installed cleanly on your entry, interior, server-room, and after-hours doors — sized to how your business actually operates." },
    { title: "Credentials That Fit Your Team", desc: "Key fobs and cards, PIN keypads, mobile credentials (unlock with a phone), or biometric readers. Mix and match by door and by role." },
    { title: "Cloud-Managed Control", desc: "Add or remove employees, set schedules, and lock down the building from your phone or laptop — from anywhere. No more rekeying when someone leaves." },
    { title: "Audit Trails & Reporting", desc: "Every unlock is logged — who, which door, and when. Pull reports for security investigations, HR, or compliance in a few clicks." },
    { title: "Integration with Cameras & Alarm", desc: "Tie access events to your video surveillance and intrusion alarm so a door opening pulls up the right camera, and forced-door or after-hours entry triggers an alert." },
  ],
  howItWorks: [
    { step: "Free Site Walk", detail: "We review your doors, traffic flow, and who needs access to what, then identify the right hardware for each opening." },
    { step: "Design & Quote", detail: "You get a clear plan — doors, readers, credential types, and software — with a fixed price." },
    { step: "Installation & Setup", detail: "We install hardware, configure users and schedules, and verify safe, code-compliant egress on every door." },
    { step: "Training & Handoff", detail: "We train your team on adding users and running reports, and we're here for support as you grow." },
  ],
  standardsIntro: "Access control has to balance security with life safety — locked doors must never trap people inside. We build to:",
  standards: [
    { code: "NFPA 101 Life Safety Code / IBC egress", detail: "Doors on the means of egress must allow free exit and release on fire alarm, so people can always get out." },
    { code: "Fire alarm interface", detail: "Mag-locked egress doors are tied to the fire alarm to release automatically on activation." },
    { code: "ADA accessibility", detail: "Hardware and operation meet accessibility requirements for entry." },
  ],
  pricingRows: [
    { scope: "Single door (reader + strike/lock)", range: "$1,500 – $3,500" },
    { scope: "Small business (2–4 doors)", range: "$4,000 – $10,000" },
    { scope: "Multi-door / multi-site", range: "$12,000 – $40,000+" },
    { scope: "Cloud software (per door, monthly)", range: "$10 – $25/mo" },
  ],
  pricingNote:
    "Pricing depends on door count, hardware, and whether existing wiring can be reused. We quote exactly after a free site walk.",
  faqs: [
    { question: "What types of access control credentials are available?", answer: "Key fobs and cards, PIN keypads, mobile credentials (unlock with a smartphone), and biometrics (fingerprint). You can use different methods on different doors — for example, fobs for staff entrances and mobile credentials for managers. We'll recommend the best mix for your workflow and budget." },
    { question: "Can I manage access from my phone?", answer: "Yes. Cloud-managed systems let you add or remove users, change schedules, unlock a door remotely, and lock down the building from your phone or computer, anywhere. When an employee leaves, you disable their credential instantly — no rekeying." },
    { question: "Is access control safe in a fire or emergency?", answer: "Yes, when it's installed correctly. Code requires that doors on your means of egress always allow free exit, and magnetically locked doors must release automatically when the fire alarm activates. Because we're also a fire alarm contractor, we build this integration in — security and life safety working together." },
    { question: "Can I keep a log of who entered and when?", answer: "Every unlock is recorded — the person, the door, and the time. You can pull reports for investigations, HR questions, or compliance in seconds." },
    { question: "Will it work with my existing cameras or alarm?", answer: "Yes. We integrate access control with video surveillance and intrusion alarms so door events link to camera views and unusual activity (forced or after-hours entry) triggers alerts. One coordinated system from one contractor." },
    { question: "Do you install access control in the Houston suburbs?", answer: "Yes — Houston, Katy, Sugar Land, The Woodlands, Pearland, Cypress, Spring, and the wider metro, plus statewide for larger projects. Call (832) 859-7009." },
  ],
  related: [
    { title: "Video Surveillance", href: "/services/video-surveillance", description: "Pair door access with cameras for a complete picture." },
    { title: "Security Alarm", href: "/services/security-alarm", description: "Monitored intrusion protection via our Brinks partnership." },
    { title: "Fire Alarm Systems", href: "/services/fire-alarm", description: "Egress release and life safety, handled by the same team." },
    { title: "Fiber Optics & Cabling", href: "/services/fiber-optics", description: "Structured cabling that ties your systems together." },
  ],
  leadHeading: "Get a Free Access Control Assessment",
  leadSubtext: "Tell us about your doors and team, and we'll design access control that fits. Response within one business day.",
  leadService: "Access Control",
};

export default function AccessControlPage() {
  return <ServiceLanding data={data} />;
}
