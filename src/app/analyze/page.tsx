"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Upload,
  FileText,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  ArrowRight,
  Shield,
  Clock,
  Zap
} from "lucide-react";

interface Deficiency {
  code: string;
  category: string;
  description: string;
  severity: "critical" | "major" | "minor";
  explanation: string;
  recommendedFix: string;
}

interface AnalysisResult {
  summary: string;
  inspectionDate?: string;
  propertyAddress?: string;
  overallStatus: "pass" | "fail";
  deficiencyCount: number;
  deficiencies: Deficiency[];
  urgentItems?: string[];
  estimatedComplexity: "simple" | "moderate" | "complex";
}

export default function AnalyzePage() {
  const [step, setStep] = useState<"upload" | "contact" | "analyzing" | "results">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a JPG, PNG, or PDF file");
      return;
    }

    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }

    // Move to contact step
    setStep("contact");
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStep("analyzing");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", contactInfo.name);
      formData.append("email", contactInfo.email);
      formData.append("phone", contactInfo.phone);
      formData.append("company", contactInfo.company);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Analysis failed");
        setStep("upload");
        return;
      }

      setAnalysis(data.data.analysis);
      setStep("results");
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Something went wrong. Please try again.");
      setStep("upload");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "major": return "bg-orange-100 text-orange-800 border-orange-200";
      case "minor": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "fire_alarm": return "🚨";
      case "sprinkler": return "💧";
      case "extinguisher": return "🧯";
      case "emergency_lighting": return "💡";
      case "exit_signs": return "🚪";
      case "suppression_system": return "🔥";
      default: return "⚠️";
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
        {step === "upload" && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Free AI-Powered Analysis
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Understand Your Fire Inspection Report
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload your failed inspection report and get a plain-English breakdown of every deficiency,
              plus recommendations for getting back in compliance.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-orange-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Drop your inspection report here
              </p>
              <p className="text-gray-500 mb-4">
                or click to browse files
              </p>
              <p className="text-sm text-gray-400">
                Supports JPG, PNG, PDF (max 10MB)
              </p>
              <input
                id="file-input"
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
              <div className="text-center">
                <Shield className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Secure & Private</p>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Results in Seconds</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">100% Free</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Contact Info */}
        {step === "contact" && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{file?.name}</p>
                  <p className="text-sm text-gray-500">
                    {file && (file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                      setStep("upload");
                    }}
                    className="text-sm text-orange-600 hover:underline mt-1"
                  >
                    Choose different file
                  </button>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Where should we send your analysis?
              </h2>
              <p className="text-gray-600">
                Enter your details to receive your free inspection breakdown.
              </p>
            </div>

            <form onSubmit={handleAnalyze} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company / Property Name
                </label>
                <input
                  type="text"
                  value={contactInfo.company}
                  onChange={(e) => setContactInfo({ ...contactInfo, company: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="ABC Properties"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
              >
                Analyze My Report
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By submitting, you agree to receive communications from Chatman Security & Fire.
                We respect your privacy and will never spam you.
              </p>
            </form>
          </div>
        )}

        {/* Step 3: Analyzing */}
        {step === "analyzing" && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
            <Loader2 className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Analyzing Your Report...
            </h2>
            <p className="text-gray-600">
              Our AI is reading your inspection document and identifying all deficiencies.
            </p>
            <div className="mt-8 flex justify-center gap-2">
              <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === "results" && analysis && (
          <div className="space-y-8">
            {/* Summary Card */}
            <div className={`rounded-2xl shadow-xl border-2 p-8 ${
              analysis.overallStatus === "fail"
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                    analysis.overallStatus === "fail"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {analysis.overallStatus === "fail" ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    {analysis.overallStatus === "fail" ? "FAILED INSPECTION" : "PASSED INSPECTION"}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mt-4">
                    {analysis.deficiencyCount} {analysis.deficiencyCount === 1 ? "Deficiency" : "Deficiencies"} Found
                  </h1>
                  {analysis.propertyAddress && (
                    <p className="text-gray-600 mt-2">{analysis.propertyAddress}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Complexity</p>
                  <p className={`text-lg font-bold ${
                    analysis.estimatedComplexity === "simple" ? "text-green-600" :
                    analysis.estimatedComplexity === "moderate" ? "text-orange-600" :
                    "text-red-600"
                  }`}>
                    {analysis.estimatedComplexity?.charAt(0).toUpperCase() + analysis.estimatedComplexity?.slice(1)}
                  </p>
                </div>
              </div>

              <p className="text-gray-700">{analysis.summary}</p>

              {/* Urgent Items */}
              {analysis.urgentItems && analysis.urgentItems.length > 0 && (
                <div className="mt-6 bg-red-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    Requires Immediate Attention
                  </div>
                  <ul className="list-disc list-inside text-red-700 space-y-1">
                    {analysis.urgentItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Deficiency List */}
            {analysis.deficiencies && analysis.deficiencies.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Deficiency Breakdown</h2>
                  <p className="text-gray-600">Click each item to see details and recommendations</p>
                </div>

                <div className="divide-y divide-gray-100">
                  {analysis.deficiencies.map((deficiency, index) => (
                    <details key={index} className="group">
                      <summary className="flex items-center gap-4 p-6 cursor-pointer hover:bg-gray-50">
                        <span className="text-2xl">{getCategoryIcon(deficiency.category)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSeverityColor(deficiency.severity)}`}>
                              {deficiency.severity?.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">{deficiency.code}</span>
                          </div>
                          <p className="font-medium text-gray-900">{deficiency.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="px-6 pb-6 pt-2 ml-12 space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-blue-800 mb-1">What This Means</p>
                          <p className="text-blue-700">{deficiency.explanation}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-green-800 mb-1">Recommended Fix</p>
                          <p className="text-green-700">{deficiency.recommendedFix}</p>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Need Help Fixing These Issues?
                  </h2>
                  <p className="text-gray-300">
                    Our licensed technicians can resolve all {analysis.deficiencyCount} deficiencies
                    and get you reinspection-ready.
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
                    Get a Free Quote
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Start Over */}
            <div className="text-center">
              <button
                onClick={() => {
                  setStep("upload");
                  setFile(null);
                  setPreview(null);
                  setAnalysis(null);
                  setContactInfo({ name: "", email: "", phone: "", company: "" });
                }}
                className="text-gray-500 hover:text-gray-700 underline"
              >
                Analyze another report
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
