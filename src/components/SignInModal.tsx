"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Loader2, AlertCircle, User, Building2, CheckCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalView = "signin" | "request" | "success";

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [view, setView] = useState<ModalView>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  // Request access form fields
  const [requestName, setRequestName] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestCompany, setRequestCompany] = useState("");
  const [requestReason, setRequestReason] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setRequestName("");
    setRequestEmail("");
    setRequestCompany("");
    setRequestReason("");
    setError("");
    setView("signin");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn(email, password);
      handleClose();
      // Redirect based on role
      if (result.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/portal/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: requestName,
          email: requestEmail,
          company: requestCompany,
          reason: requestReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setView("success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
              {/* Sign In View */}
              {view === "signin" && (
                <>
                  {/* Header */}
                  <div className="relative bg-gradient-to-r from-neutral-900 to-neutral-800 px-6 py-8 text-center">
                    <button
                      onClick={handleClose}
                      className="absolute right-4 top-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                    <p className="text-gray-400 mt-2">
                      Sign in to access your account
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSignIn} className="p-6 space-y-4">
                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={6}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <p className="text-sm text-gray-500">
                        Don&apos;t have an account?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setError("");
                            setView("request");
                          }}
                          className="text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Request Access
                        </button>
                      </p>
                    </div>
                  </form>
                </>
              )}

              {/* Request Access View */}
              {view === "request" && (
                <>
                  {/* Header */}
                  <div className="relative bg-gradient-to-r from-neutral-900 to-neutral-800 px-6 py-8 text-center">
                    <button
                      onClick={() => {
                        setError("");
                        setView("signin");
                      }}
                      className="absolute left-4 top-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleClose}
                      className="absolute right-4 top-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold text-white">Request Access</h2>
                    <p className="text-gray-400 mt-2">
                      Submit a request for a customer portal account
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleRequestAccess} className="p-6 space-y-4">
                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Your Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={requestName}
                          onChange={(e) => setRequestName(e.target.value)}
                          placeholder="John Smith"
                          required
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={requestEmail}
                          onChange={(e) => setRequestEmail(e.target.value)}
                          placeholder="you@company.com"
                          required
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Company / Property Name
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={requestCompany}
                          onChange={(e) => setRequestCompany(e.target.value)}
                          placeholder="ABC Properties"
                          required
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Reason for Access
                      </label>
                      <textarea
                        value={requestReason}
                        onChange={(e) => setRequestReason(e.target.value)}
                        placeholder="I'm a property manager and would like to view service history and request quotes..."
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <p className="text-sm text-gray-500">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setError("");
                            setView("signin");
                          }}
                          className="text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  </form>
                </>
              )}

              {/* Success View */}
              {view === "success" && (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Request Submitted
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Thank you for your interest! Our team will review your request
                    and contact you within 1-2 business days to set up your account.
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
