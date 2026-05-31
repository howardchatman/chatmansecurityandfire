"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ClipboardList, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function LeadCapture() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const canShow = useRef(false);
  const shown = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem("exitPopupSeen")) return;

    // Only arm after 20s so we don't fire on bounces
    const arm = setTimeout(() => { canShow.current = true; }, 20000);

    // Desktop: mouse leaves viewport toward top (address bar)
    const onMouseLeave = (e: MouseEvent) => {
      if (!canShow.current || shown.current) return;
      if (e.clientY <= 5) {
        shown.current = true;
        setIsOpen(true);
      }
    };

    // Mobile: fast scroll-up near the top of the page
    let lastY = window.scrollY;
    let lastTime = Date.now();
    const onScroll = () => {
      if (!canShow.current || shown.current) return;
      const now = Date.now();
      const y = window.scrollY;
      const velocity = (lastY - y) / (now - lastTime); // px/ms, positive = scrolling up
      if (velocity > 1.5 && y < 300) {
        shown.current = true;
        setIsOpen(true);
      }
      lastY = y;
      lastTime = now;
    };

    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(arm);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("exitPopupSeen", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          source: "exit_intent_popup",
          message: "Exit-intent popup — checklist offer",
        }),
      });
      setSubmitted(true);
      sessionStorage.setItem("exitPopupSeen", "true");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden pointer-events-auto">
              {/* Header */}
              <div className="relative bg-neutral-950 px-8 pt-8 pb-6">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-14 h-14 bg-orange-600/20 rounded-2xl flex items-center justify-center mb-4">
                  <ClipboardList className="w-7 h-7 text-orange-400" />
                </div>
                <p className="text-orange-400 text-xs font-semibold uppercase tracking-wider mb-1">Free Download</p>
                <h2 className="text-2xl font-bold text-white leading-snug">
                  Before you go — grab the checklist
                </h2>
                <p className="text-neutral-400 mt-2 text-sm">
                  44 items. 6 categories. The exact violations Houston fire marshals look for most.
                </p>
              </div>

              {/* Body */}
              <div className="px-8 py-6">
                {submitted ? (
                  <div className="text-center py-2">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-7 h-7 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">You're all set!</h3>
                    <p className="text-gray-500 text-sm mb-4">We'll be in touch. In the meantime, your checklist is ready.</p>
                    <Link
                      href="/checklist"
                      onClick={handleClose}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full text-sm transition-colors"
                    >
                      Open Checklist
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleSubmit} className="space-y-3 mb-4">
                      <input
                        type="text"
                        required
                        placeholder="Your Name *"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Email Address *"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                      />
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold rounded-xl text-sm transition-colors"
                      >
                        {submitting ? (
                          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                        ) : (
                          <>Send Me the Checklist <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </form>
                    <p className="text-center text-xs text-gray-400">
                      Or{" "}
                      <Link href="/checklist" onClick={handleClose} className="text-orange-600 hover:underline font-medium">
                        view it now without signing up →
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
