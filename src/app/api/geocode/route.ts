import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

// Turns a site address into a lat/lng for the map on the report cover.
//
// Google's geocoder is used when a key is configured; otherwise OpenStreetMap's
// Nominatim, which is free and needs nothing but an identifying User-Agent.
// Either way the answer is cached for a day — addresses don't move.

const cache = new Map<string, { lat: number; lon: number; at: number }>();
const TTL = 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = (new URL(request.url).searchParams.get("q") || "").trim();
  if (q.length < 5) return NextResponse.json({ error: "Missing address" }, { status: 400 });

  const hit = cache.get(q);
  if (hit && Date.now() - hit.at < TTL) {
    return NextResponse.json({ data: { lat: hit.lat, lon: hit.lon } });
  }

  try {
    const point = await geocode(q);
    if (!point) return NextResponse.json({ error: "Address not found" }, { status: 404 });
    cache.set(q, { ...point, at: Date.now() });
    return NextResponse.json({ data: point });
  } catch (err) {
    console.error("[geocode]", err);
    return NextResponse.json({ error: "Geocoding failed" }, { status: 502 });
  }
}

async function geocode(q: string): Promise<{ lat: number; lon: number } | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (key) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${key}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    const json = await res.json();
    const loc = json?.results?.[0]?.geometry?.location;
    if (loc) return { lat: loc.lat, lon: loc.lng };
    return null;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "ChatmanSecurityAndFire/1.0 (inspection reports; info@chatmansecurityandfire.com)",
      Accept: "application/json",
    },
    next: { revalidate: 86400 },
  });
  const json = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!json?.length) return null;
  return { lat: parseFloat(json[0].lat), lon: parseFloat(json[0].lon) };
}
