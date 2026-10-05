// The blog, hosted on our own domain at /blog. Each post is written here and
// rendered by src/app/blog/[slug]/page.tsx; the same list powers /blog, the
// RSS feed at /rss.xml, the sitemap, and llms.txt.
//
// To publish a post, add an entry to the TOP of `blogPosts` (newest first).
//
// Inline formatting inside any text: **bold** and [link text](/path or https://…).

import { SITE_URL } from "@/lib/site-services";

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; text: string };

export interface BlogPost {
  slug: string;
  title: string;
  description: string; // meta description and card summary
  date: string; // ISO date published
  category: string;
  readMinutes: number;
  body: BlogBlock[];
  faqs?: { question: string; answer: string }[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "do-i-need-a-knox-box-texas",
    title: "Do I Need a Knox Box? Fire Department Access Rules for Texas Businesses",
    description:
      "What a Knox Box is, when the fire code requires one, how to order one through your fire department, and the access rules for gated properties in Texas.",
    date: "2026-10-05T15:30:00.000Z",
    category: "Fire Department Access",
    readMinutes: 6,
    body: [
      {
        type: "p",
        text: "If a fire marshal has told you that you need a Knox Box, or you're opening a new business and see it on a checklist, here is what it is, why fire departments want one, and how to get the right one installed without buying the wrong box.",
      },
      { type: "h2", text: "What is a Knox Box?" },
      {
        type: "p",
        text: "A Knox Box is a high-security key box mounted on the outside of your building. Inside, you keep the keys firefighters need to get in. Only your local fire department carries the master key that opens it. When there's an alarm at 2 a.m. and nobody is there to unlock the door, firefighters open the box, take your keys, and walk in instead of breaking down your door or window.",
      },
      {
        type: "p",
        text: "That protects you as much as it helps them. A forced entry means a damaged door and a building that can't be secured until it's repaired, and the alarm may turn out to be a false one.",
      },
      { type: "h2", text: "When is a Knox Box required?" },
      {
        type: "p",
        text: "Most Texas cities, including Houston, build their fire code on the **International Fire Code (IFC)** with local amendments. IFC Section 506.1 lets the fire code official require a key box wherever getting into or through a building is restricted by locked doors or gates, or where immediate access is needed for life-saving or firefighting.",
      },
      { type: "p", text: "In practice, you should expect to need one if your building:" },
      {
        type: "ul",
        items: [
          "Has a fire alarm or fire sprinkler system",
          "Is locked or unoccupied after hours",
          "Sits behind a locked gate, fence, or controlled entry",
          "Has a fire alarm panel, sprinkler riser, or elevator equipment behind a locked door",
          "Is a new building or a tenant finish-out going through a fire marshal final inspection",
        ],
      },
      {
        type: "callout",
        text: "Requirements vary from city to city. Your fire marshal's inspection report or plan review comments are the final word. If they call for a key box, it's required.",
      },
      { type: "h2", text: "How to order the right box" },
      {
        type: "p",
        text: "You can't buy a generic lockbox at a hardware store and call it done. A Knox Box has to be keyed to **your** fire department's master key, so it's ordered through the Knox Company with your department's authorization. Many fire departments have their own Knox ordering page that sends the order to the right key code.",
      },
      {
        type: "ol",
        items: [
          "Confirm what your fire department requires: box size, surface or recessed mount, and location.",
          "Order through your department's authorized Knox page so the box is keyed to their master key.",
          "Install it where the department specifies, usually beside the main entrance or fire alarm annunciator, at a height firefighters can reach.",
          "Have the fire department come out to lock your keys inside. In many cities, only they can do that step.",
        ],
      },
      { type: "h2", text: "What goes inside" },
      {
        type: "ul",
        items: [
          "Keys to the main entrance and any other exterior doors firefighters may need",
          "Keys to the fire alarm panel room, sprinkler riser room, and electrical rooms",
          "Elevator keys, if you have elevators",
          "Gate keys or access codes, labeled",
        ],
      },
      {
        type: "p",
        text: "Label every key. And when you rekey a lock, call the fire department to update the box. A Knox Box full of keys that no longer work is the same as not having one.",
      },
      { type: "h2", text: "Gates and fire lanes" },
      {
        type: "p",
        text: "Gated properties get extra attention. Under IFC Section 503.6, gates across fire apparatus access roads need fire code official approval, and electric gates must have an approved way for the fire department to open them in an emergency. Depending on your jurisdiction, that means a **Knox key switch** on the gate operator, a Knox padlock on a manual gate, or a siren- or radio-activated opener.",
      },
      {
        type: "p",
        text: "Fire departments may also call for **locking caps** on your fire department connection (FDC) to keep debris and vandals out of the sprinkler inlet.",
      },
      { type: "h2", text: "We handle the whole thing" },
      {
        type: "p",
        text: "We install Knox Boxes, gate key switches, and FDC locking caps across the Houston area, coordinated with your fire department so it passes the first time. See our [fire department access services](/services/fire-department-access), or [request a quote](/request-quote) and tell us what your inspector asked for.",
      },
    ],
    faqs: [
      {
        question: "Who has the key to a Knox Box?",
        answer:
          "Only your local fire department. The box is keyed to that department's master key, which is why it has to be ordered with their authorization.",
      },
      {
        question: "How much does a Knox Box cost?",
        answer:
          "The box usually costs a few hundred dollars depending on size and mounting style, plus installation. Recessed boxes in masonry and gate key switches take more labor than a surface-mount box on a wall.",
      },
      {
        question: "What happens if I change my locks?",
        answer:
          "Call your fire department to open the box so you can swap in the new keys. Keys that no longer work defeat the purpose of the box.",
      },
    ],
  },
  {
    slug: "houston-commercial-fire-inspection-checklist",
    title: "Houston Commercial Fire Inspection Checklist: Pass the First Time",
    description:
      "A practical pre-inspection checklist for Houston businesses: the items fire marshals check, from fire alarms and extinguishers to exit lighting, sprinklers, electrical hazards, and paperwork.",
    date: "2026-10-05T15:20:00.000Z",
    category: "Fire Inspections",
    readMinutes: 8,
    body: [
      {
        type: "p",
        text: "Most failed fire inspections come down to a handful of items that are cheap and quick to fix before the inspector arrives. Walk your building with this checklist a couple of weeks ahead, so anything that needs a licensed contractor still has time to get done.",
      },
      {
        type: "callout",
        text: "Want a printable version? Use our [interactive fire inspection checklist](/checklist).",
      },
      { type: "h2", text: "1. Exits and exit paths" },
      {
        type: "ul",
        items: [
          "Every exit, corridor, and stairway is clear. No boxes, carts, or furniture in the path.",
          "Exit doors open from the inside without a key, code, or special knowledge.",
          "No chains, padlocks, or deadbolts on exit doors during business hours.",
          "Exit signs are lit and visible from the path of travel.",
          "Emergency lights come on when you press the test button.",
        ],
      },
      {
        type: "p",
        text: "Exit signs and emergency lights need a quick **30-second test every month** and a full **90-minute test every year**, with a log showing it was done. Dead batteries are one of the most common write-ups we see. See [emergency lighting service](/services/emergency-lighting).",
      },
      { type: "h2", text: "2. Fire extinguishers" },
      {
        type: "ul",
        items: [
          "Each extinguisher has an annual service tag dated within the last 12 months.",
          "Monthly visual checks are initialed on the tag.",
          "The pressure gauge needle is in the green.",
          "Extinguishers are mounted, visible, and not blocked. For units 40 lb or lighter, the top sits no higher than 5 feet off the floor.",
          "For ordinary hazards, nobody should have to walk more than 75 feet to reach one.",
          "Commercial kitchens have a Class K extinguisher near the cooking line.",
        ],
      },
      {
        type: "p",
        text: "These standards come from **NFPA 10**. If your tags are expired, see [extinguisher service](/services/fire-extinguishers).",
      },
      { type: "h2", text: "3. Fire alarm system" },
      {
        type: "ul",
        items: [
          "The panel shows normal. No trouble, supervisory, or alarm lights.",
          "You have a written annual inspection and test report under **NFPA 72**, and it's on site.",
          "Monitoring works, and the monitoring company has your current contact list.",
          "Pull stations, smoke detectors, and horn/strobes aren't blocked, covered, or painted over.",
        ],
      },
      {
        type: "p",
        text: "A panel in trouble is an automatic write-up and often means something is genuinely wrong. See [fire alarm service](/services/fire-alarm).",
      },
      { type: "h2", text: "4. Sprinkler system" },
      {
        type: "ul",
        items: [
          "Storage stays at least **18 inches below** sprinkler deflectors.",
          "Sprinkler heads aren't painted, corroded, damaged, or hung with anything.",
          "Control valves are open and locked or electronically supervised.",
          "Inspection reports under **NFPA 25** are current.",
          "A spare head cabinet with the right wrench is near the riser.",
          "The fire department connection (FDC) outside is visible, accessible, and capped.",
        ],
      },
      {
        type: "p",
        text: "See [fire sprinkler service](/services/fire-sprinkler).",
      },
      { type: "h2", text: "5. Electrical hazards" },
      {
        type: "ul",
        items: [
          "No extension cords used as permanent wiring.",
          "No power strips plugged into other power strips.",
          "Every outlet and switch has a cover plate.",
          "A clear space at least 30 inches wide and 3 feet deep in front of electrical panels.",
          "Panel breakers are labeled.",
        ],
      },
      { type: "h2", text: "6. Fire doors, walls, and ceilings" },
      {
        type: "ul",
        items: [
          "Fire doors close and latch on their own and aren't propped open.",
          "Holes in fire-rated walls and ceilings, such as from new cabling, are sealed.",
          "Ceiling tiles are all in place. Missing tiles change how heat and smoke reach detectors and sprinklers.",
        ],
      },
      { type: "h2", text: "7. Outside the building" },
      {
        type: "ul",
        items: [
          "Address numbers are visible from the street and contrast with their background. The fire code minimum is 4 inches tall.",
          "Fire lanes are marked, legible, and not blocked. See [fire lane marking](/services/fire-lane-marking).",
          "Fire hydrants and the FDC have at least 3 feet of clear space around them.",
          "If you have a Knox Box, the keys inside still work.",
        ],
      },
      { type: "h2", text: "8. Kitchens" },
      {
        type: "ul",
        items: [
          "The hood fire suppression system has been inspected within the last six months.",
          "Hoods and ducts are cleaned on schedule. How often depends on how much you cook.",
          "There's a Class K extinguisher near the cooking line.",
        ],
      },
      { type: "h2", text: "9. Paperwork to have ready" },
      {
        type: "ul",
        items: [
          "Annual fire alarm inspection report",
          "Sprinkler inspection reports",
          "Fire extinguisher service records",
          "Kitchen hood suppression inspection report",
          "Emergency lighting test log",
          "Certificate of Occupancy, posted",
          "Occupant load sign, for assembly spaces like restaurants, churches, and event rooms",
        ],
      },
      {
        type: "p",
        text: "Keep these together in a binder or folder near the fire alarm panel. Inspectors notice when you can hand them everything in 30 seconds.",
      },
      { type: "h2", text: "Found problems? Fix them before the inspector does" },
      {
        type: "p",
        text: "Everything on this list is cheaper to fix before an inspection than after a failure. We do pre-inspection walkthroughs across the Houston area and fix what we find. [Request a quote](/request-quote), or read [what to do if you already failed](/blog/failed-houston-fire-marshal-inspection-what-to-do).",
      },
    ],
    faqs: [
      {
        question: "How often are commercial fire inspections in Houston?",
        answer:
          "It depends on the type of business. Some occupancies are inspected on a regular schedule; others when a complaint, permit, or new Certificate of Occupancy triggers a visit. Separately, your fire alarm, sprinklers, extinguishers, and emergency lights each have their own testing schedules that you're responsible for keeping up.",
      },
      {
        question: "What do fire marshals check first?",
        answer:
          "Usually the basics they can see right away: blocked or locked exits, extinguisher tags, the fire alarm panel's status, exit and emergency lighting, and storage too close to sprinkler heads.",
      },
    ],
  },
  {
    slug: "commercial-fire-alarm-system-cost-houston",
    title: "How Much Does a Commercial Fire Alarm System Cost in Houston?",
    description:
      "What a commercial fire alarm system costs in Houston: realistic price ranges, the factors that drive cost, ongoing monitoring and inspection costs, and how to avoid overpaying.",
    date: "2026-10-05T15:10:00.000Z",
    category: "Fire Alarm Systems",
    readMinutes: 7,
    body: [
      {
        type: "p",
        text: "Commercial fire alarm systems in Houston typically range from about **$1,500** for work in a small tenant space to **$50,000 or more** for a large multi-story building. That's a wide range, and where your building lands depends on a few specific things. Here's what drives the price, what comes after installation, and how to compare quotes fairly.",
      },
      { type: "h2", text: "What drives the price" },
      { type: "h3", text: "Building size and device count" },
      {
        type: "p",
        text: "Most of the cost is devices and labor: smoke and heat detectors, pull stations, horn/strobes, duct detectors, and the wire connecting them. More square footage, more rooms, and more floors mean more devices.",
      },
      { type: "h3", text: "Conventional vs. addressable panel" },
      {
        type: "p",
        text: "A **conventional** panel reports which zone is in alarm. An **addressable** panel reports exactly which device. Small buildings can sometimes use conventional systems, but most new commercial work in Houston is addressable. It costs more up front, but it's faster to troubleshoot and far easier to expand.",
      },
      { type: "h3", text: "Voice evacuation" },
      {
        type: "p",
        text: "Some building types, such as high-rises and larger assembly spaces, require a system that plays spoken evacuation instructions instead of just horns. Voice evacuation adds amplifiers and speakers, and it adds meaningful cost.",
      },
      { type: "h3", text: "Design, permits, and acceptance testing" },
      {
        type: "p",
        text: "In Houston, new systems and most modifications need drawings, plan review, a permit, and a final acceptance test before the fire marshal signs off. A good quote includes all of it. A cheap quote often leaves it out.",
      },
      { type: "h3", text: "What's already there" },
      {
        type: "p",
        text: "A tenant space tying into an existing building system costs far less than a new standalone system. Reusable wiring and devices can also cut cost, though old equipment sometimes costs more to keep than to replace.",
      },
      { type: "h2", text: "Rough price tiers" },
      {
        type: "ul",
        items: [
          "**Small tenant space** (adding or relocating devices, tying into a building system): from about $1,500",
          "**Small standalone building** (new addressable panel, devices, monitoring connection, permit): several thousand dollars to the low five figures",
          "**Large or multi-story building** (many devices, possibly voice evacuation): $50,000 and up",
        ],
      },
      {
        type: "callout",
        text: "These are planning ranges, not quotes. The only way to know your number is a walkthrough, and we'll give you an itemized price.",
      },
      { type: "h2", text: "Costs after installation" },
      {
        type: "ul",
        items: [
          "**Monitoring.** Where code requires a fire alarm, it generally must be monitored by an approved central station (IFC 907.6.6). That's a monthly fee, plus a cellular or dual-path communicator.",
          "**Annual inspection.** NFPA 72 requires the system to be inspected and tested every year, with a written report you keep for the fire marshal.",
          "**Repairs and batteries.** Panel batteries and detectors wear out. Plan on replacing batteries every few years.",
        ],
      },
      { type: "h2", text: "How to avoid overpaying" },
      {
        type: "ol",
        items: [
          "**Get itemized quotes.** Devices, labor, panel, monitoring setup, drawings, permit, and acceptance testing should each be visible.",
          "**Ask what's excluded.** Permit fees, after-hours work, and fire marshal acceptance testing are the usual surprises.",
          "**Check the license.** In Texas, fire alarm companies must be licensed by the State Fire Marshal's Office. Ask for the license number.",
          "**Avoid locked-in equipment.** Some panels can only be serviced by the company that installed them. Ask whether other licensed companies can service the panel you're buying.",
          "**Ask about reuse.** Existing wiring and devices may be reusable, or may not be worth it. A straight answer either way is a good sign.",
        ],
      },
      { type: "h2", text: "Get a real number" },
      {
        type: "p",
        text: "We design, install, permit, and test commercial fire alarm systems across the Houston area, and we put every line item on the quote. See [fire alarm services](/services/fire-alarm) or [request a quote](/request-quote).",
      },
    ],
    faqs: [
      {
        question: "Do I need a permit for a fire alarm system in Houston?",
        answer:
          "Yes. New fire alarm systems and most modifications need drawings, plan review, and a permit, followed by an acceptance test before the fire marshal signs off.",
      },
      {
        question: "How long does a commercial fire alarm installation take?",
        answer:
          "Installation in a small building often takes a few days. Design, plan review, and permitting usually take longer than the installation itself, so start early if you have an opening date.",
      },
      {
        question: "Does a commercial fire alarm have to be monitored?",
        answer:
          "Where the fire code requires a fire alarm system, it generally must be monitored by an approved supervising station under IFC 907.6.6 and NFPA 72.",
      },
    ],
  },
  {
    slug: "failed-houston-fire-marshal-inspection-what-to-do",
    title: "Failed a Houston Fire Marshal Inspection? Here's Exactly What to Do",
    description:
      "Failed a fire marshal inspection in Houston? What your deficiency report means, how to sort the corrections, the most common violations, and how to pass the reinspection.",
    date: "2026-10-05T15:00:00.000Z",
    category: "Fire Inspections",
    readMinutes: 7,
    body: [
      {
        type: "p",
        text: "A failed fire inspection feels like a crisis, but it's common and almost always fixable. What matters now is reading the report correctly, fixing the right things in the right order, and having proof ready when the inspector comes back.",
      },
      { type: "h2", text: "Step 1: Read the deficiency report line by line" },
      {
        type: "p",
        text: "Every item on the report is a specific violation, usually citing a code section. Houston's fire code is based on the **International Fire Code** with local amendments, and many items reference NFPA standards, such as **NFPA 72** for fire alarms, **NFPA 10** for extinguishers, and **NFPA 25** for sprinklers.",
      },
      {
        type: "p",
        text: "Find two things before anything else: your **correction deadline**, and the **instructions for scheduling a reinspection**. Write the deadline on your calendar today.",
      },
      { type: "h2", text: "Step 2: Sort the items into three piles" },
      { type: "h3", text: "Fix today, yourself" },
      {
        type: "ul",
        items: [
          "Clear blocked exits and corridors",
          "Remove locks or chains from exit doors",
          "Stop propping fire doors open",
          "Move storage at least 18 inches below sprinkler heads",
          "Unplug extension cords used as permanent wiring",
          "Clear the space in front of electrical panels",
          "Put up visible address numbers",
        ],
      },
      { type: "h3", text: "Needs a licensed contractor" },
      {
        type: "ul",
        items: [
          "Fire alarm panel troubles, failed devices, or a missing annual test",
          "Sprinkler impairments, damaged heads, or overdue inspections",
          "Expired extinguisher tags or missing extinguishers",
          "Exit signs and emergency lights that fail their test",
          "Kitchen hood suppression service",
          "Fire lane striping",
        ],
      },
      { type: "h3", text: "Needs paperwork" },
      {
        type: "ul",
        items: [
          "Annual fire alarm inspection report",
          "Sprinkler inspection reports",
          "Permits for any new installation or modification",
        ],
      },
      { type: "h2", text: "Step 3: Use a licensed company for system work" },
      {
        type: "p",
        text: "In Texas, companies that install or service fire alarm, fire sprinkler, and fire extinguisher systems must be licensed by the **State Fire Marshal's Office**, part of the Texas Department of Insurance. Ask for the license number before work starts. Reports from an unlicensed company may not be accepted, and then you're paying twice.",
      },
      { type: "h2", text: "The violations we fix most often in Houston" },
      {
        type: "ol",
        items: [
          "**Expired or missing extinguisher tags**, or the wrong extinguisher type, like no Class K in a kitchen",
          "**Fire alarm panel in trouble**, or no current annual inspection report",
          "**Exit signs and emergency lights** that don't light on test",
          "**Blocked or locked exits**",
          "**Storage too close** to sprinkler heads",
          "**Missing or unreadable address numbers**",
          "**Faded or blocked fire lanes**",
          "**No Knox Box** where the fire department requires one",
          "**Electrical hazards**: extension cords, missing cover plates, blocked panels",
        ],
      },
      { type: "h2", text: "Step 4: Get proof of every correction" },
      {
        type: "p",
        text: "For each item on the report, keep a photo, invoice, inspection report, or service tag that shows it was fixed. Organize them by the report's item numbers. When the inspector returns, you hand over one folder that answers every line.",
      },
      { type: "h2", text: "Step 5: Schedule the reinspection before the deadline" },
      {
        type: "p",
        text: "Use the contact on your report. If you can't finish in time, usually because parts or a permit are pending, call the inspector **before** the deadline and explain the plan. Asking early goes much better than explaining a missed date. Some reinspections carry a fee, so aim to get everything right the first time.",
      },
      { type: "h2", text: "What happens if you ignore it" },
      {
        type: "p",
        text: "Unresolved violations escalate: more citations, fines, and for serious life-safety hazards, the fire marshal can order a space closed until it's corrected. For a new business, open violations can also hold up your Certificate of Occupancy.",
      },
      { type: "h2", text: "We fix fire marshal violations every week" },
      {
        type: "p",
        text: "Send us your deficiency report and we'll tell you what it means, what it costs to fix, and how fast we can get you reinspection-ready. See [fire marshal compliance](/services/fire-marshal-compliance), [request a quote](/request-quote), or call (346) 852-5540. Before your next inspection, use our [inspection checklist](/blog/houston-commercial-fire-inspection-checklist).",
      },
    ],
    faqs: [
      {
        question: "How long do I have to fix fire marshal violations in Houston?",
        answer:
          "The deadline is printed on your report and depends on the violation. Serious hazards, like a blocked or locked exit, must be fixed immediately. If you need more time for other items, call the inspector before the deadline passes.",
      },
      {
        question: "Can I fix the violations myself?",
        answer:
          "Housekeeping items, like clearing exits, moving storage, and removing extension cords, yes. Work on fire alarm, sprinkler, and extinguisher systems must be done by a company licensed by the Texas State Fire Marshal's Office.",
      },
      {
        question: "Will I be charged for a reinspection?",
        answer:
          "Some reinspections carry a fee. The surest way to avoid paying for more than one is to correct every item and have documentation ready the first time.",
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function postUrl(post: BlogPost): string {
  return `${SITE_URL}/blog/${post.slug}`;
}
