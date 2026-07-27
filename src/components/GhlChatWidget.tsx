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
    const strip = () => {
      document
        .querySelectorAll(
          'chat-widget, [id^="chat-widget"], iframe[src*="leadconnectorhq.com/widget"], iframe[src*="widgets.leadconnectorhq.com"]'
        )
        .forEach((el) => el.remove());
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
