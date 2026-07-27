"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// A2P / TCR compliance: any page where the chat widget is embedded must NOT
// contain another phone- or SMS-opt-in form (carrier requirement — a single
// consent point per page). This site's marketing pages (homepage, all
// service pages, /contact, /start, /for-contractors, /analyze, /recommend,
// /request-quote) all have lead-capture forms, so the widget is ALLOWLISTED
// to load only on pages confirmed to have no forms. Allowlist (not blocklist)
// so a future page can't accidentally show the widget next to a form.
const ALLOWED_PREFIXES = [
  "/", // homepage — no lead forms, chat widget is the opt-in point
  "/about",
  "/service-areas",
  "/privacy-policy",
  "/terms-and-conditions",
];

export default function GhlChatWidget() {
  const pathname = usePathname();
  const allowed = ALLOWED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // On pages where the widget must NOT appear, strip any <chat-widget> left
  // over from a prior client-side navigation (SPA nav doesn't reload the DOM).
  // Only targets the chat widget custom element — never the embedded form.
  useEffect(() => {
    if (allowed) return;
    const strip = () => {
      document.querySelectorAll("chat-widget").forEach((el) => el.remove());
    };
    strip();
    const interval = setInterval(strip, 400);
    return () => clearInterval(interval);
  }, [allowed, pathname]);

  if (!allowed) return null;

  return (
    <Script
      src="https://widgets.leadconnectorhq.com/loader.js"
      data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
      data-widget-id="6a66fee8f1929b03b084f5da"
      data-source="WEB_USER"
      strategy="afterInteractive"
    />
  );
}
