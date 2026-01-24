"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Phone,
  ArrowDown,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Shield,
  Check,
} from "lucide-react";

const whatWeHandle = [
  "Failed fire inspections",
  "Fire marshal correction lists",
  "Fire alarm & sprinkler deficiencies",
  "Emergency lights & exit signs",
  "Fire lane markings",
  "Tenant finish-out readiness",
];

const roleOptions = [
  { value: "", label: "Select your role" },
  { value: "owner_tenant", label: "Owner / Tenant" },
  { value: "property_manager", label: "Property Manager" },
  { value: "general_contractor", label: "General Contractor" },
  { value: "vendor", label: "Vendor" },
  { value: "other", label: "Other" },
];

const deadlineOptions = [
  { value: "", label: "When do you need this done?" },
  { value: "today_tomorrow", label: "Today / Tomorrow" },
  { value: "within_72_hours", label: "Within 72 hours" },
  { value: "this_week", label: "This week" },
  { value: "no_deadline", label: "No deadline / Not sure" },
];

const issueOptions = [
  { value: "", label: "What's the issue?" },
  { value: "failed_inspection", label: "Failed inspection" },
  { value: "fire_alarm_trouble", label: "Fire alarm trouble" },
  { value: "sprinkler_issue", label: "Sprinkler issue" },
  { value: "emergency_lighting", label: "Emergency lighting / exit signs" },
  { value: "fire_lane_markings", label: "Fire lane markings" },
  { value: "pre_inspection", label: "Pre-inspection readiness" },
  { value: "other", label: "Other" },
];

interface FormData {
  name: string;
  phone: string;
  role: string;
  property_address: string;
  deadline: string;
  issue: string;
  details: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  role?: string;
  property_address?: string;
  deadline?: string;
  issue?: string;
}

export default function StartPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    role: "",
    property_address: "",
    deadline: "",
    issue: "",
    details: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s\-\(\)\+]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.role) {
      newErrors.role = "Please select your role";
    }

    if (!formData.property_address.trim()) {
      newErrors.property_address = "Property address is required";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Please select a deadline";
    }

    if (!formData.issue) {
      newErrors.issue = "Please select an issue type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/service-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          files_count: files.length,
          source: "start_page",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit request");
      }

      setIsSuccess(true);
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit. Please try again or call us."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Request Received</h1>
            <p className="text-gray-600 mb-6">
              We&apos;ve got your information. Someone from our team will reach out shortly to discuss your project.
            </p>
            <div className="space-y-3">
              <a
                href="tel:+18324301826"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call (832) 430-1826
              </a>
              <Link
                href="/"
                className="block w-full px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 lg:pb-24">
        <div className="absolute inset-0 bg-pattern opacity-50" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30" />

        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Skip Link */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-orange-600 transition-colors"
            >
              Skip — go to main site
            </Link>
          </div>

          {/* Logo/Brand */}
          <div className="text-center mb-12">
            <Link href="/" className="inline-block">
              <img
                src="/csf_wide_logo.png"
                alt="Chatman Security and Fire"
                className="h-20 w-auto mx-auto"
              />
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-full text-orange-700 text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Commercial Fire & Life-Safety Compliance
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Need Fire Compliance Help
              <br />
              <span className="text-orange-600">— Fast?</span>
            </h1>

            {/* Subhead */}
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Chatman Security & Fire fixes failed inspections, life-safety deficiencies, and time-sensitive issues that delay openings. If this is urgent, call now. If not, submit details and our team will review.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="tel:+18324301826"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-all text-lg"
              >
                <Phone className="w-5 h-5" />
                CALL (832) 430-1826
              </a>
              <button
                onClick={scrollToForm}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-all text-lg shadow-lg shadow-orange-500/30"
              >
                Start Service Request
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Copy */}
            <p className="text-sm text-gray-500 mb-10">
              Commercial service only &bull; Project-based work &bull; Houston & surrounding areas
            </p>

            {/* What We Handle */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-xl mx-auto">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 text-center uppercase tracking-wide">
                What We Handle
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {whatWeHandle.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section ref={formRef} className="py-16 bg-white">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Service Request Form
              </h2>
              <p className="text-gray-600">
                Fill out the form below and we&apos;ll reach out to discuss your project.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Smith"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.phone ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none bg-white ${
                    errors.role ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                )}
              </div>

              {/* Property Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="property_address"
                  value={formData.property_address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, Houston, TX 77001"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.property_address ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                />
                {errors.property_address && (
                  <p className="mt-1 text-sm text-red-600">{errors.property_address}</p>
                )}
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <select
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none bg-white ${
                    errors.deadline ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                >
                  {deadlineOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.deadline && (
                  <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
                )}
              </div>

              {/* Issue Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="issue"
                  value={formData.issue}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none bg-white ${
                    errors.issue ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                >
                  {issueOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.issue && (
                  <p className="mt-1 text-sm text-red-600">{errors.issue}</p>
                )}
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe the issue, any relevant history, or specific requirements..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspection Report / Photos <span className="text-gray-400">(optional)</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-all"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    PDF, JPG, PNG up to 10MB each
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* File List */}
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-700 truncate">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Service Request"
                )}
              </button>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 text-center">
                Final compliance requirements are determined by the AHJ (Authority Having Jurisdiction).
              </p>
            </form>

            {/* Alternative CTA */}
            <div className="mt-10 pt-8 border-t border-gray-100 text-center">
              <p className="text-gray-600 mb-4">
                Prefer to talk? Call us directly.
              </p>
              <a
                href="tel:+18324301826"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-lg"
              >
                <Phone className="w-5 h-5" />
                (832) 430-1826
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
