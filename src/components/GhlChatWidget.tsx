"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// The GoHighLevel chat widget collects phone numbers for SMS opt-in.
// For A2P/TCR compliance, a page must have only ONE consent-collecting
// mechanism. The /request-quote page has its own embedded GHL form, so
// the chat widget must NOT appear there. It loads on every other page.
const EXCLUDED_PREFIXES = ["/request-quote"];

export default function GhlChatWidget() {
  const pathname = usePathname();
  const excluded = EXCLUDED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // On excluded routes, also strip any widget already injected during a
  // prior client-side navigation (SPA nav doesn't reload the page, so the
  // loader's DOM can persist). Direct loads never inject it because the
  // <Script> below isn't rendered.
  useEffect(() => {
    if (!excluded) return;
    // Remove ONLY the chat widget (a <chat-widget> custom element the loader
    // injects). Must NOT touch the embedded quote form, whose iframe src is
    // api.leadconnectorhq.com/widget/form/... — matching a broad "widget"
    // selector would delete the form too.
    const strip = () => {
      document.querySelectorAll("chat-widget").forEach((el) => el.remove());
    };
    strip();
    const interval = setInterval(strip, 400);
    return () => clearInterval(interval);
  }, [excluded, pathname]);

  if (excluded) return null;

  return (
    <Script
      src="https://widgets.leadconnectorhq.com/loader.js"
      data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
      data-widget-id="6a663244b92307bb1e99671c"
      data-source="WEB_USER"
      strategy="afterInteractive"
    />
  );
}
