"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import BrandHeader from "@/components/BrandHeader";
import { Loader2, Eye, EyeOff, AlertCircle, Phone } from "lucide-react";

// Where each role belongs after signing in. Without this everyone lands in the
// same place and has to find their own way — a technician has no business in
// the admin dashboard, and a customer can't open it at all.
function homeForRole(role: string): string {
  switch (role) {
    case "admin":
    case "manager":
      return "/admin/dashboard";
    case "technician":
    case "inspector":
      return "/tech";
    case "customer":
      return "/portal/dashboard";
    default:
      return "/";
  }
}

export default function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const next = params.get("next");
  const justEnrolled = params.get("welcome") === "1";

  // Already signed in? Don't make them do it again.
  useEffect(() => {
    if (!loading && user) router.replace(next || homeForRole(user.role));
  }, [user, loading, next, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { role } = await signIn(email.trim(), password);
      router.replace(next || homeForRole(role));
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "That email and password didn't match. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <BrandHeader onDark size="h-14" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {justEnrolled && (
            <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
              Your password is set — sign in below.
            </div>
          )}

          <h1 className="text-xl font-bold text-gray-900">Sign in</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Staff and customers use the same sign-in.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-sm text-gray-500 space-y-1">
            <p>
              Clocking in for a shift?{" "}
              <Link href="/time-clock" className="text-orange-600 font-medium hover:underline">
                Time clock
              </Link>
            </p>
            <p>
              Forgot your password? Call{" "}
              <a href="tel:8328597009" className="text-orange-600 font-medium">
                (832) 859-7009
              </a>{" "}
              and we&apos;ll send you a new setup link.
            </p>
          </div>
        </div>

        <p className="text-center text-white/50 text-xs mt-6 flex items-center justify-center gap-1">
          <Phone className="w-3 h-3" /> (832) 859-7009
        </p>
      </div>
    </div>
  );
}
