import type { Metadata } from "next";
import ServiceLanding, { type ServiceLandingData } from "@/components/ServiceLanding";

export const metadata: Metadata = {
  title: "Knox Box & Fire Department Access Houston TX | Rapid Entry Installation",
  description:
    "Knox Box rapid-entry key box and fire department access installation in Houston and across Texas. Wall boxes, gate Knox switches, and FD override to pass fire marshal inspection. We coordinate with your AHJ. (832) 859-7009.",
  keywords: [
    "Knox Box installation Houston",
    "fire department access Texas",
    "rapid entry key box commercial",
    "Knox switch gate fire department",
    "how to get a Knox Box",
    "fire marshal Knox box requirement",
  ],
  alternates: { canonical: "/services/fire-department-access" },
  openGraph: {
    title: "Knox Box & Fire Department Access | Chatman Security & Fire",
    description:
      "Rapid-entry key box and fire department access installation for Houston commercial properties — wall boxes, gate Knox switches, and FD override, coordinated with your AHJ.",
    url: "https://chatmansecurityandfire.com/services/fire-department-access",
  },
};

const data: ServiceLandingData = {
  iconName: "firedept",
  bgImage: "/fire_dept_access_wide.webp",
  kicker: "Fire Department Access",
  title: "Knox Box & Fire Department Access in Houston, TX",
  intro:
    "When the fire department arrives, they can't wait for a key. A Knox Box (rapid-entry key box) gives first responders secure, immediate access to your building — and your local fire marshal almost certainly requires one. We install Knox wall boxes, gate Knox switches, and fire department override devices for Houston commercial properties, and coordinate the whole process with your AHJ.",
  subIntro:
    "Failed an inspection over a missing or misplaced Knox Box or gate access? We correct it fast and get you signed off.",
  whatWeDo: [
    { title: "Knox Box (Rapid-Entry Key Box) Installation", desc: "We mount the Knox Box at the location and height your fire marshal specifies, secure your keys and access cards inside, and make sure it's ready for the fire department's master key." },
    { title: "Gate Knox Switches & FD Override", desc: "Automated gates must let the fire department in. We install Knox key switches and approved override devices so first responders can open your gate in an emergency — a common inspection item." },
    { title: "Inspection Corrections", desc: "Cited for a missing, wrong-location, or non-compliant Knox Box or gate access? We fix it and coordinate re-inspection so the violation is cleared." },
    { title: "AHJ Coordination", desc: "Knox products are keyed to each fire department and ordered through the AHJ's authorization. We help you order the right box and handle the coordination so it's done correctly the first time." },
    { title: "Key & Access Management", desc: "We make sure the box holds current keys, fobs, and elevator/gate access so responders can actually reach every part of your property." },
  ],
  howItWorks: [
    { step: "Confirm the Requirement", detail: "We check what your local fire marshal requires — box type, mounting location and height, and whether gate access is needed." },
    { step: "Order Through Your AHJ", detail: "Knox boxes are authorized per fire department. We guide you through ordering the correct, fire-department-keyed box for your jurisdiction." },
    { step: "Professional Installation", detail: "We securely mount the box (and any gate Knox switch), load your keys/access, and verify placement meets the AHJ spec." },
    { step: "Inspection Sign-Off", detail: "We coordinate with the fire marshal so your rapid-entry access passes inspection and your violation, if any, is closed out." },
  ],
  standardsIntro: "Fire department access is a fire-code requirement enforced at inspection. We build to:",
  standards: [
    { code: "International Fire Code (IFC) Section 506", detail: "Requires a key box (rapid-entry) where access to or within a structure is restricted — the basis for the Knox Box requirement." },
    { code: "IFC gate access requirements", detail: "Automated and locked gates must provide approved fire department access, typically via a Knox key switch." },
    { code: "Local AHJ specifications", detail: "Each fire department sets the approved product, mounting location, and height — we install to your specific jurisdiction's spec." },
  ],
  pricingRows: [
    { scope: "Knox Box supply & installation", range: "$500 – $1,200" },
    { scope: "Gate Knox switch / FD override", range: "$400 – $1,200" },
    { scope: "Inspection correction (access-related)", range: "$500 – $2,000" },
  ],
  pricingNote:
    "The Knox product itself is ordered through your fire department's authorization. Pricing depends on the box model and mounting. We quote after confirming your AHJ's requirement.",
  faqs: [
    { question: "What is a Knox Box and do I need one?", answer: "A Knox Box is a secure rapid-entry key box mounted on your building that holds your keys and access cards; only the local fire department has the master key to open it, so they can get in fast during an emergency without breaking down doors. Most fire marshals require one for commercial buildings with restricted or after-hours access — and it's frequently cited at inspection when missing." },
    { question: "How do I get a Knox Box?", answer: "Knox boxes are keyed to each individual fire department, so they must be ordered through your local fire department's authorization — you can't just buy a generic one. We confirm your fire marshal's exact requirement, guide you through ordering the correct box for your jurisdiction, and install it to spec." },
    { question: "Does my automated gate need fire department access?", answer: "Yes. The fire code requires that locked or automated gates allow fire department entry, typically through a Knox key switch or approved override device wired to your gate operator. We install this so first responders are never locked out — and so your gate passes inspection." },
    { question: "I failed inspection over my Knox Box — can you fix it fast?", answer: "Yes. Whether the box is missing, in the wrong location or height, or your gate lacks fire department access, we correct it quickly and coordinate re-inspection with the fire marshal to close out the violation." },
    { question: "Where does the Knox Box have to be mounted?", answer: "Your fire marshal specifies the location and mounting height — usually near the main entrance at a set height, visible to responders. Because it varies by jurisdiction, we confirm the exact requirement with your AHJ before installing." },
    { question: "Do you handle Knox Box and fire department access across Houston?", answer: "Yes — Houston, Katy, Sugar Land, The Woodlands, Pearland, Cypress, Spring, and the greater metro, coordinating with each local fire marshal. Call (832) 859-7009." },
  ],
  related: [
    { title: "Gate Entry Systems", href: "/services/gate-entry", description: "Automated gates with built-in fire department access." },
    { title: "Fire Marshal Compliance", href: "/services/fire-marshal-compliance", description: "Correct any inspection violation and get signed off." },
    { title: "Fire Alarm Systems", href: "/services/fire-alarm", description: "Complete life safety from one licensed contractor." },
    { title: "Access Control", href: "/services/access-control", description: "Secure entry that still lets responders in." },
  ],
  leadHeading: "Get Knox Box & Fire Department Access Handled",
  leadSubtext: "Tell us about your property and we'll confirm the requirement, order the right box, and get you inspection-ready. Response within one business day.",
  leadService: "Fire Department Access / Knox Box",
};

export default function FireDepartmentAccessPage() {
  return <ServiceLanding data={data} />;
}
