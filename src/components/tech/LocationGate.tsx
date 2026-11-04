"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Loader2, AlertTriangle } from "lucide-react";
import { MAX_ACCURACY_M } from "@/lib/location-rules";

// Field staff must allow location before using the app: check-in and
// check-out are refused without it (and away from the job site). This screen
// stands in front of everything until the phone hands over a position.

type State = "checking" | "needed" | "asking" | "denied" | "unavailable" | "imprecise" | "ok";

type Fix = { lat: number; lng: number; accuracy: number };

function read(options: PositionOptions): Promise<Fix> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return reject({ code: 2 });
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      (err) => reject(err),
      options
    );
  });
}

/**
 * One location reading; rejects with the browser's error code. GPS often
 * can't get a fix indoors in time, so a timeout falls back to the phone's
 * quicker Wi-Fi/cell reading before giving up.
 */
export async function currentPosition(): Promise<Fix> {
  try {
    return await read({ enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 });
  } catch (err) {
    if ((err as { code?: number })?.code === 1) throw err;
    return read({ enableHighAccuracy: false, timeout: 15_000, maximumAge: 120_000 });
  }
}

/** Plain-English reason a reading failed. */
export function locationErrorText(err: unknown): string {
  const code = (err as { code?: number })?.code;
  if (code === 1) return "Location is blocked for this site. Turn it on in your phone's settings (steps below), then try again.";
  if (code === 3) return "Your phone took too long to find its location. Step outside or near a window and try again.";
  return "Your phone couldn't find its location. Make sure Location Services is on, then try again.";
}

export default function LocationGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>("checking");

  // `allowed`: the browser already reports permission granted. Then a reading
  // that merely times out (indoors) doesn't lock them out of the app; the
  // check-in itself will say what's wrong.
  const ask = useCallback(async (allowed = false) => {
    setState("asking");
    try {
      const fix = await currentPosition();
      // Precise Location off (iPhone) reports miles of error: check-in would fail.
      setState(fix.accuracy > MAX_ACCURACY_M ? "imprecise" : "ok");
    } catch (err) {
      const code = (err as { code?: number })?.code;
      if (code === 1) setState("denied");
      else setState(allowed ? "ok" : "unavailable");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
        if (cancelled) return;
        if (status?.state === "denied") return setState("denied");
        // Granted, or not decided yet: ask right away so the phone shows its
        // own Allow prompt instead of an extra tap on this screen.
        ask(status?.state === "granted");
        // If they change the setting while this screen is up, follow it.
        if (status) status.onchange = () => (status.state === "granted" ? ask(true) : status.state === "denied" && setState("denied"));
      } catch {
        // Browsers without the Permissions API (older iPhones): just ask.
        if (!cancelled) ask();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ask]);

  if (state === "ok") return <>{children}</>;

  if (state === "checking") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-10 px-2 space-y-5">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Turn on location</h1>
        <p className="text-gray-600 mt-2">
          Location is required to use the field app. You can only check in and out when you&apos;re at the job
          site, and the app uses your phone&apos;s location to confirm that.
        </p>
      </div>

      {(state === "denied" || state === "unavailable" || state === "imprecise") && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {state === "denied"
            ? locationErrorText({ code: 1 })
            : state === "imprecise"
              ? "Your phone is only sharing a rough location, so check-in will fail. Turn on Precise Location (steps below), then try again."
              : locationErrorText({ code: 2 })}
        </div>
      )}

      <button
        onClick={() => ask()}
        disabled={state === "asking"}
        className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold rounded-xl disabled:opacity-50 inline-flex items-center justify-center gap-2"
      >
        {state === "asking" ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
        {state === "asking" ? "Finding your location…" : "Allow location"}
      </button>
      <p className="text-xs text-gray-500 text-center">When your phone asks, choose <b>Allow</b> (or <b>Allow While Using App</b>).</p>

      {(state === "denied" || state === "unavailable" || state === "imprecise") && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-700 space-y-3">
          <div>
            <p className="font-semibold text-gray-900">iPhone (Safari)</p>
            <ol className="list-decimal pl-5 space-y-0.5">
              <li>Settings → Privacy &amp; Security → Location Services: <b>On</b></li>
              <li>In that list, Safari Websites → <b>While Using the App</b>, and <b>Precise Location</b> on</li>
              <li>Back in Safari, tap <b>aA</b> in the address bar → Website Settings → Location → <b>Allow</b></li>
              <li>Come back here and tap Allow location</li>
            </ol>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Android (Chrome)</p>
            <ol className="list-decimal pl-5 space-y-0.5">
              <li>Swipe down and make sure <b>Location</b> is on</li>
              <li>In Chrome, tap the icon left of the web address → Permissions → Location → <b>Allow</b></li>
              <li>Settings → Location → App permissions → Chrome: <b>Use precise location</b> on</li>
              <li>Come back here and tap Allow location</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
