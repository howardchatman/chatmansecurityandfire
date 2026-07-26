// ChadChat has been retired in favor of the GoHighLevel chat widget,
// which is installed site-wide in src/app/layout.tsx and handles SMS
// opt-in capture for A2P/TCR compliance.
//
// This stub is intentionally a no-op so the ~20 existing <ChadChat />
// references across the site render nothing without needing to edit every
// file. Safe to remove those imports later.
export default function ChadChat() {
  return null;
}
