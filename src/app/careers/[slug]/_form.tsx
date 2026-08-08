"use client";

import { useState } from "react";
import { Loader2, Upload, CheckCircle, AlertTriangle, FileText, X } from "lucide-react";
import { DISCIPLINES } from "@/lib/careers";

const EXPERIENCE = ["No experience — apprentice", "Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"];

export default function ApplyForm({ roleSlug, roleTitle }: { roleSlug: string; roleTitle: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [wantsProfile, setWantsProfile] = useState(true);

  const toggle = (d: string) =>
    setDisciplines((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    form.set("role_slug", roleSlug);
    form.set("wants_profile", String(wantsProfile));
    disciplines.forEach((d) => form.append("disciplines", d));
    if (resume) form.set("resume", resume);

    try {
      const res = await fetch("/api/careers/apply", { method: "POST", body: form });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Couldn't submit your application.");
        return;
      }
      setDone(true);
    } catch {
      setError("Couldn't submit. Please call (832) 859-7009.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-6 text-center">
        <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
        <p className="font-semibold text-green-900">Application received</p>
        <p className="text-sm text-green-800 mt-1">
          We read every one. If it&apos;s a fit, you&apos;ll hear from us — usually within a few days.
        </p>
        <p className="text-sm text-green-700 mt-3">
          Can&apos;t wait? Call <a href="tel:8328597009" className="font-semibold underline">(832) 859-7009</a>.
        </p>
      </div>
    );
  }

  const field = "w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500";
  const label = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <input type="hidden" name="role_title" value={roleTitle} />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="full_name">Full name *</label>
          <input id="full_name" name="full_name" required className={field} />
        </div>
        <div>
          <label className={label} htmlFor="phone">Phone *</label>
          <input id="phone" name="phone" type="tel" required placeholder="832-555-0100" className={field} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="email">Email *</label>
          <input id="email" name="email" type="email" required className={field} />
        </div>
        <div>
          <label className={label} htmlFor="city">What area are you in?</label>
          <input id="city" name="city" placeholder="Houston, Katy, Spring…" className={field} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="years_experience">Experience</label>
        <select id="years_experience" name="years_experience" className={field} defaultValue="">
          <option value="" disabled>Select…</option>
          {EXPERIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </div>

      <div>
        <span className={label}>What do you work on? (pick any)</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {DISCIPLINES.map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => toggle(d)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                disciplines.includes(d)
                  ? "bg-orange-600 border-orange-600 text-white"
                  : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={label} htmlFor="licenses">Licenses or certifications</label>
        <input id="licenses" name="licenses" placeholder="NICET II, Texas FAL, FOA CFOT…" className={field} />
      </div>

      <div>
        <label className={label} htmlFor="message">Anything else?</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Tell us what you've worked on, or why you want to get into the trade."
          className={field}
        />
      </div>

      {/* Résumé */}
      <div>
        <span className={label}>Résumé (optional)</span>
        {resume ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-300 px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
              <FileText className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span className="truncate">{resume.name}</span>
              <span className="text-gray-400 flex-shrink-0">({Math.round(resume.size / 1024)} KB)</span>
            </span>
            <button type="button" onClick={() => setResume(null)} className="text-gray-400 hover:text-red-600 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 px-4 py-5 cursor-pointer hover:border-orange-400 hover:bg-orange-50/40 transition-colors">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              <span className="font-medium text-orange-600">Choose a file</span> — PDF or Word, up to 10MB
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="hidden"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
            />
          </label>
        )}
      </div>

      {/* Consent to be kept on file — explicit, and defaulted on with the
          reason stated rather than buried in fine print. */}
      <label
        className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
          wantsProfile ? "border-orange-400 bg-orange-50" : "border-gray-200"
        }`}
      >
        <input
          type="checkbox"
          checked={wantsProfile}
          onChange={(e) => setWantsProfile(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-orange-600"
        />
        <span>
          <span className="block text-sm font-medium text-gray-900">Keep my details on file</span>
          <span className="block text-xs text-gray-600 mt-0.5">
            We&apos;ll hold your résumé and contact you about future openings that fit. Untick and
            we&apos;ll only consider you for this role.
          </span>
        </span>
      </label>

      {error && (
        <p className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitting ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}
