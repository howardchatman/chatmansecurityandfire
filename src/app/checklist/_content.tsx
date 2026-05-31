"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChadChat from "@/components/ChadChat";
import {
  CheckSquare, Square, Phone, ArrowRight, CheckCircle,
  Printer, Bell, Droplets, FlameKindling, Lightbulb,
  PaintBucket, FileText, Shield, AlertTriangle,
} from "lucide-react";

interface CheckItem {
  id: string;
  text: string;
  critical?: boolean;
  note?: string;
}

interface Category {
  title: string;
  icon: React.ElementType;
  color: string;
  items: CheckItem[];
}

const categories: Category[] = [
  {
    title: "Fire Alarm System",
    icon: Bell,
    color: "text-red-600",
    items: [
      { id: "fa1", text: "Control panel shows no trouble or alarm conditions", critical: true },
      { id: "fa2", text: "All smoke detectors are clean — no dust covers or paint overspray", critical: true },
      { id: "fa3", text: "Pull stations are unobstructed and clearly visible" },
      { id: "fa4", text: "Notification appliances (horns/strobes) function during test", critical: true },
      { id: "fa5", text: "Central station monitoring is active and on current contract" },
      { id: "fa6", text: "Annual inspection report on file (within 12 months)", critical: true },
      { id: "fa7", text: "Battery backup tested and functional" },
      { id: "fa8", text: "System is addressable or meets current NFPA 72 requirements" },
      { id: "fa9", text: "Elevator recall wiring tested (if applicable)" },
      { id: "fa10", text: "No devices with low battery or supervisory faults showing" },
    ],
  },
  {
    title: "Fire Sprinkler System",
    icon: Droplets,
    color: "text-blue-600",
    items: [
      { id: "sp1", text: "All sprinkler heads are upright, unobstructed, and undamaged", critical: true },
      { id: "sp2", text: "No sprinkler heads painted over or covered with material" },
      { id: "sp3", text: "18\" clearance maintained below all sprinkler heads", critical: true, note: "Racking, shelving, or storage within 18\" is a common violation" },
      { id: "sp4", text: "Control valve (PIV or OS&Y) is open and sealed/supervised" },
      { id: "sp5", text: "Inspector test connection accessible and functional" },
      { id: "sp6", text: "No visible corrosion, leaks, or damaged pipe runs" },
      { id: "sp7", text: "Spare sprinkler heads and wrench present in cabinet" },
      { id: "sp8", text: "Annual inspection tag current (5-year internal inspection if older system)" },
    ],
  },
  {
    title: "Fire Extinguishers",
    icon: FlameKindling,
    color: "text-orange-600",
    items: [
      { id: "ex1", text: "All extinguishers have current annual inspection tag (within 12 months)", critical: true },
      { id: "ex2", text: "Extinguishers are mounted on wall brackets or in visible cabinets" },
      { id: "ex3", text: "Travel distance to extinguisher does not exceed 75 feet (Class A)", critical: true },
      { id: "ex4", text: "No extinguishers are expired, discharged, or have broken seals" },
      { id: "ex5", text: "Pressure gauge needle is in the green zone" },
      { id: "ex6", text: "Correct extinguisher type for the hazard in each area", note: "K-class required in commercial kitchens" },
      { id: "ex7", text: "Extinguishers are not obstructed or behind locked doors" },
      { id: "ex8", text: "Monthly visual inspections documented in log book" },
    ],
  },
  {
    title: "Emergency Lighting & Exit Signs",
    icon: Lightbulb,
    color: "text-yellow-600",
    items: [
      { id: "el1", text: "All exit signs illuminate (both primary and battery backup)", critical: true },
      { id: "el2", text: "Emergency lighting units activate when building power is cut", critical: true },
      { id: "el3", text: "No burned-out bulbs or failed LED elements in exit signs" },
      { id: "el4", text: "Emergency light batteries hold charge for minimum 90 minutes" },
      { id: "el5", text: "Exit path is fully illuminated with no dark gaps" },
      { id: "el6", text: "Exit signs face the correct direction and are not blocked by decor" },
      { id: "el7", text: "Annual function test documented (30-second and 90-minute tests)" },
    ],
  },
  {
    title: "Fire Lanes & Egress",
    icon: PaintBucket,
    color: "text-purple-600",
    items: [
      { id: "fl1", text: "Fire lane striping is visible — not faded or obscured", critical: true },
      { id: "fl2", text: "\"NO PARKING — FIRE LANE\" signage present at required intervals" },
      { id: "fl3", text: "Fire lane is unobstructed — no permanent or temporary blockages", critical: true },
      { id: "fl4", text: "Fire department connections (FDC) accessible and capped" },
      { id: "fl5", text: "Exit doors open from inside without a key or special knowledge", critical: true },
      { id: "fl6", text: "All egress paths free of storage, debris, or obstructions" },
    ],
  },
  {
    title: "Documentation & Permits",
    icon: FileText,
    color: "text-gray-600",
    items: [
      { id: "dc1", text: "Certificate of Occupancy posted and current", critical: true },
      { id: "dc2", text: "Fire alarm and sprinkler inspection reports on file", critical: true },
      { id: "dc3", text: "Hazardous materials permit current (if applicable)" },
      { id: "dc4", text: "Hood and suppression system inspection current (restaurant/kitchen)" },
      { id: "dc5", text: "Fire watch logs available if required during system outages" },
    ],
  },
];

export default function ChecklistContent() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (id: string) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
  };

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const criticalItems = categories.flatMap((c) => c.items.filter((i) => i.critical));
  const checkedCritical = criticalItems.filter((i) => checked.has(i.id)).length;
  const pct = Math.round((checked.size / totalItems) * 100);

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Checklist Download",
          email,
          source: "checklist_page",
          message: "Requested printable checklist",
        }),
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Header */}
        <section className="bg-neutral-950 py-12">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-orange-500 text-sm font-semibold uppercase tracking-wider mb-3">
                <Shield className="w-4 h-4" />
                Free Resource
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Commercial Fire Safety<br />
                <span className="text-orange-500">Self-Inspection Checklist</span>
              </h1>
              <p className="text-neutral-400 mb-6">
                {totalItems} items across 6 categories — covers the most common fire marshal violations for Houston commercial properties. Check items as you walk your building.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-full text-sm transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Checklist
                </button>
                <a
                  href="tel:+18328597009"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full text-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Talk to a Tech — (832) 859-7009
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Progress bar */}
        <div className="bg-white border-b border-gray-200 py-4 print:hidden">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{checked.size} of {totalItems} items checked</span>
              <span className={`text-sm font-bold ${pct === 100 ? "text-green-600" : pct >= 75 ? "text-orange-600" : "text-red-500"}`}>{pct}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${pct === 100 ? "bg-green-500" : pct >= 75 ? "bg-orange-500" : "bg-red-400"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {criticalItems.length > checkedCritical && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {criticalItems.length - checkedCritical} critical items still unchecked
              </p>
            )}
          </div>
        </div>

        {/* Checklist */}
        <section className="py-10 bg-gray-50">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const catChecked = cat.items.filter((i) => checked.has(i.id)).length;
                return (
                  <div key={cat.title} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${cat.color}`} />
                        <h2 className="font-bold text-gray-900">{cat.title}</h2>
                      </div>
                      <span className="text-sm text-gray-400">{catChecked}/{cat.items.length}</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {cat.items.map((item) => {
                        const isChecked = checked.has(item.id);
                        return (
                          <button
                            key={item.id}
                            onClick={() => toggle(item.id)}
                            className={`w-full flex items-start gap-3 px-6 py-3.5 text-left transition-colors hover:bg-gray-50 ${isChecked ? "bg-green-50/50" : ""}`}
                          >
                            {isChecked
                              ? <CheckSquare className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              : <Square className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                            }
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm ${isChecked ? "text-gray-400 line-through" : "text-gray-800"}`}>
                                  {item.text}
                                </span>
                                {item.critical && !isChecked && (
                                  <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium flex-shrink-0">Critical</span>
                                )}
                              </div>
                              {item.note && (
                                <p className="text-xs text-gray-400 mt-0.5">{item.note}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Failure prompt */}
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Found a problem?
                </h3>
                <p className="text-sm text-orange-800 mb-4">
                  Don't wait until the fire marshal flags it. Chatman Security & Fire handles corrections for all of the items on this list — often same week.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="tel:+18328597009"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full text-sm transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call (832) 859-7009
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-orange-300 hover:border-orange-500 text-orange-700 font-semibold rounded-full text-sm transition-colors"
                  >
                    Submit Online Request
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Email capture — get updates */}
              {!submitted ? (
                <div className="bg-neutral-950 rounded-2xl p-6 text-center">
                  <h3 className="font-bold text-white mb-1">Want a printable PDF version?</h3>
                  <p className="text-neutral-400 text-sm mb-4">Enter your email and we'll send you a formatted PDF copy — plus updates when fire codes change.</p>
                  <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors flex-shrink-0"
                    >
                      {submitting ? "Sending..." : "Send PDF"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-900">Got it — we'll be in touch shortly!</p>
                  <p className="text-sm text-green-700 mt-1">In the meantime, use the checklist above or call us at (832) 859-7009.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ChadChat />
    </>
  );
}
