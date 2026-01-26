"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  Phone,
  ArrowRight,
  Shield,
  Sparkles,
  Calendar
} from "lucide-react";

interface Recommendation {
  service: string;
  priority: "essential" | "recommended" | "optional";
  reason: string;
  codeReference?: string;
  frequency: string;
}

interface RecommendationResult {
  summary: string;
  recommendations: Recommendation[];
  complianceNotes?: string[];
  estimatedBudgetRange?: string;
}

const buildingTypes = [
  { value: "office", label: "Office Building" },
  { value: "retail", label: "Retail / Shopping Center" },
  { value: "restaurant", label: "Restaurant / Food Service" },
  { value: "warehouse", label: "Warehouse / Industrial" },
  { value: "medical", label: "Medical / Healthcare" },
  { value: "education", label: "School / Education" },
  { value: "hospitality", label: "Hotel / Hospitality" },
  { value: "multifamily", label: "Apartment / Multi-Family" },
  { value: "religious", label: "Church / Religious" },
  { value: "automotive", label: "Auto Shop / Dealership" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "datacenter", label: "Data Center / Server Room" },
  { value: "mixed", label: "Mixed Use" },
  { value: "other", label: "Other" },
];

const occupancyRanges = [
  { value: "1-25", label: "1-25 people" },
  { value: "26-50", label: "26-50 people" },
  { value: "51-100", label: "51-100 people" },
  { value: "101-250", label: "101-250 people" },
  { value: "251-500", label: "251-500 people" },
  { value: "500+", label: "500+ people" },
];

const currentSystemOptions = [
  { value: "fire_alarm", label: "Fire Alarm System" },
  { value: "sprinklers", label: "Sprinkler System" },
  { value: "extinguishers", label: "Fire Extinguishers" },
  { value: "emergency_lights", label: "Emergency Lighting" },
  { value: "exit_signs", label: "Exit Signs" },
  { value: "hood_suppression", label: "Kitchen Hood Suppression" },
  { value: "none", label: "None / Not Sure" },
];

export default function RecommendPage() {
  const [step, setStep] = useState<"form" | "loading" | "results">("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    buildingType: "",
    squareFootage: "",
    floors: "",
    occupancy: "",
    currentSystems: [] as string[],
    concerns: "",
    additionalInfo: "",
  });
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSystemToggle = (system: string) => {
    setFormData(prev => ({
      ...prev,
      currentSystems: prev.currentSystems.includes(system)
        ? prev.currentSystems.filter(s => s !== system)
        : [...prev.currentSystems, system]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("loading");
    setError(null);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          currentSystems: formData.currentSystems.join(", "),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to generate recommendations");
        setStep("form");
        return;
      }

      setResult(data.data.recommendations);
      setStep("results");
    } catch (err) {
      console.error("Recommendation error:", err);
      setError("Something went wrong. Please try again.");
      setStep("form");
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "essential":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          badge: "bg-red-100 text-red-700",
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />
        };
      case "recommended":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          badge: "bg-orange-100 text-orange-700",
          icon: <CheckCircle className="w-5 h-5 text-orange-500" />
        };
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          badge: "bg-blue-100 text-blue-700",
          icon: <Info className="w-5 h-5 text-blue-500" />
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/csf_wide_logo.png" alt="Chatman Security & Fire" width={200} height={50} className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        {step === "form" && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Free Service Assessment
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Fire Safety Services Do You Need?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tell us about your building and get personalized recommendations
              for staying compliant and protected.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Contact Info Section */}
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company / Property Name</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="ABC Properties"
                  />
                </div>
              </div>
            </div>

            {/* Building Details Section */}
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Building Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Building Type *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {buildingTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, buildingType: type.value })}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                          formData.buildingType === type.value
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Square Footage</label>
                    <input
                      type="text"
                      value={formData.squareFootage}
                      onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="e.g., 10,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Floors</label>
                    <input
                      type="text"
                      value={formData.floors}
                      onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="e.g., 2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Typical Occupancy</label>
                    <select
                      value={formData.occupancy}
                      onChange={(e) => setFormData({ ...formData, occupancy: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select...</option>
                      {occupancyRanges.map((range) => (
                        <option key={range.value} value={range.value}>{range.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Fire Safety Systems</label>
                  <div className="flex flex-wrap gap-2">
                    {currentSystemOptions.map((system) => (
                      <button
                        key={system.value}
                        type="button"
                        onClick={() => handleSystemToggle(system.value)}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                          formData.currentSystems.includes(system.value)
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {formData.currentSystems.includes(system.value) && (
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                        )}
                        {system.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Main Concerns or Questions</label>
                  <textarea
                    value={formData.concerns}
                    onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Upcoming inspection, new tenant requirements, system is old..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anything Else We Should Know?</label>
                  <textarea
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Special requirements, hazardous materials, server rooms, commercial kitchen, etc."
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="p-8 bg-gray-50">
              <button
                type="submit"
                disabled={!formData.buildingType}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Building2 className="w-5 h-5" />
                Get My Recommendations
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">
                By submitting, you agree to receive communications from Chatman Security & Fire.
              </p>
            </div>
          </form>
        )}

        {/* Loading */}
        {step === "loading" && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
            <Loader2 className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Analyzing Your Building...
            </h2>
            <p className="text-gray-600">
              We&apos;re reviewing your building details and local fire codes to create personalized recommendations.
            </p>
          </div>
        )}

        {/* Results */}
        {step === "results" && result && (
          <div className="space-y-8">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Your Fire Safety Recommendations
                  </h1>
                  <p className="text-gray-600">{result.summary}</p>
                </div>
              </div>

              {result.estimatedBudgetRange && (
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Estimated Annual Budget</span>
                  <span className="text-xl font-bold text-gray-900">{result.estimatedBudgetRange}</span>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Recommended Services</h2>

              {/* Essential */}
              {result.recommendations.filter(r => r.priority === "essential").length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Essential (Required by Code)
                  </h3>
                  {result.recommendations
                    .filter(r => r.priority === "essential")
                    .map((rec, i) => {
                      const styles = getPriorityStyles(rec.priority);
                      return (
                        <div key={i} className={`${styles.bg} border ${styles.border} rounded-xl p-6`}>
                          <div className="flex items-start gap-4">
                            {styles.icon}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold text-gray-900">{rec.service}</h4>
                                {rec.codeReference && (
                                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                    {rec.codeReference}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700 mb-3">{rec.reason}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>Frequency: {rec.frequency}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Recommended */}
              {result.recommendations.filter(r => r.priority === "recommended").length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3 className="text-sm font-semibold text-orange-700 uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Recommended (Best Practice)
                  </h3>
                  {result.recommendations
                    .filter(r => r.priority === "recommended")
                    .map((rec, i) => {
                      const styles = getPriorityStyles(rec.priority);
                      return (
                        <div key={i} className={`${styles.bg} border ${styles.border} rounded-xl p-6`}>
                          <div className="flex items-start gap-4">
                            {styles.icon}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold text-gray-900">{rec.service}</h4>
                                {rec.codeReference && (
                                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                    {rec.codeReference}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700 mb-3">{rec.reason}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>Frequency: {rec.frequency}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Optional */}
              {result.recommendations.filter(r => r.priority === "optional").length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Optional (Nice to Have)
                  </h3>
                  {result.recommendations
                    .filter(r => r.priority === "optional")
                    .map((rec, i) => {
                      const styles = getPriorityStyles(rec.priority);
                      return (
                        <div key={i} className={`${styles.bg} border ${styles.border} rounded-xl p-6`}>
                          <div className="flex items-start gap-4">
                            {styles.icon}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold text-gray-900">{rec.service}</h4>
                              </div>
                              <p className="text-gray-700 mb-3">{rec.reason}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>Frequency: {rec.frequency}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Compliance Notes */}
            {result.complianceNotes && result.complianceNotes.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Important Compliance Notes
                </h3>
                <ul className="space-y-2">
                  {result.complianceNotes.map((note, i) => (
                    <li key={i} className="text-yellow-800 flex items-start gap-2">
                      <span className="text-yellow-600">•</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Ready to Get Started?
                  </h2>
                  <p className="text-gray-300">
                    Let us provide a detailed quote for your recommended services.
                    No obligation, just clarity.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="tel:+18324301826"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    (832) 430-1826
                  </a>
                  <Link
                    href="/start"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Request a Quote
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Start Over */}
            <div className="text-center">
              <button
                onClick={() => {
                  setStep("form");
                  setResult(null);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    company: "",
                    buildingType: "",
                    squareFootage: "",
                    floors: "",
                    occupancy: "",
                    currentSystems: [],
                    concerns: "",
                    additionalInfo: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700 underline"
              >
                Start over with a different building
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Chatman Security & Fire. All rights reserved.</p>
          <p className="mt-2">Houston, TX | (832) 430-1826</p>
        </div>
      </footer>
    </div>
  );
}
