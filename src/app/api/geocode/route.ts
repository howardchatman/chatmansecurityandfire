import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { geocode } from "@/lib/geocode";

// Turns a site address into a lat/lng for the map on the report cover.
//
// Google's geocoder is used when a key is configured; otherwise OpenStreetMap's
// Nominatim, which is free and needs nothing but an identifying User-Agent.
// Either way the answer is cached for a day (see lib/geocode).

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = (new URL(request.url).searchParams.get("q") || "").trim();
  if (q.length < 5) return NextResponse.json({ error: "Missing address" }, { status: 400 });

  try {
    const point = await geocode(q);
    if (!point) return NextResponse.json({ error: "Address not found" }, { status: 404 });
    return NextResponse.json({ data: point });
  } catch (err) {
    console.error("[geocode]", err);
    return NextResponse.json({ error: "Geocoding failed" }, { status: 502 });
  }
}
