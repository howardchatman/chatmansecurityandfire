// Address → lat/lng. Google's geocoder when a key is configured; otherwise
// OpenStreetMap's Nominatim, which is free and needs only an identifying
// User-Agent. Answers are cached for a day; addresses don't move.
//
// `precise` says whether the point is the building itself. Geocoders that
// don't know a house number fall back to the street or neighborhood, and the
// middle of a long road can be a mile from the job; the time clock must not
// measure anyone against that.

export interface GeoPoint {
  lat: number;
  lon: number;
  precise: boolean;
}

const cache = new Map<string, { point: GeoPoint | null; at: number }>();
const TTL = 24 * 60 * 60 * 1000;

/** Drop unit/suite/# parts, which make geocoders miss the building entirely. */
export function streetAddress(q: string): string {
  return q
    .replace(/,?\s*(#|\bunit\b|\bsuite\b|\bste\b\.?|\bapt\b\.?|\bbldg\b\.?|\bbuilding\b|\broom\b|\brm\b\.?)\s*[a-z0-9-]+/gi, "")
    .replace(/\s+,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function geocode(q: string): Promise<GeoPoint | null> {
  const clean = streetAddress(q);
  const key = clean.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.point;

  const point = await lookup(clean);
  cache.set(key, { point, at: Date.now() });
  return point;
}

async function lookup(q: string): Promise<GeoPoint | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    const json = await res.json();
    const result = json?.results?.[0];
    const loc = result?.geometry?.location;
    if (!loc) return null;
    const type = result.geometry.location_type;
    return { lat: loc.lat, lon: loc.lng, precise: type === "ROOFTOP" || type === "RANGE_INTERPOLATED" };
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=us&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "ChatmanSecurityAndFire/1.0 (field app; info@chatmansecurityandfire.com)",
      Accept: "application/json",
    },
    next: { revalidate: 86400 },
  });
  const json = (await res.json()) as Array<{
    lat: string;
    lon: string;
    category?: string;
    type?: string;
    address?: { house_number?: string };
  }>;
  const r = json?.[0];
  if (!r) return null;
  // A house number, or a named place that isn't a road/area (a school, a building).
  const precise =
    !!r.address?.house_number ||
    (r.category === "place" && r.type === "house") ||
    !["highway", "boundary", "place", "landuse", "natural", "waterway"].includes(r.category || "");
  return { lat: parseFloat(r.lat), lon: parseFloat(r.lon), precise };
}

/** Straight-line distance in meters between two points. */
export function distanceMeters(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6_371_000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** "450 ft" under a tenth of a mile, otherwise "2.3 mi". */
export function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  return miles < 0.1 ? `${Math.round(meters * 3.281)} ft` : `${miles.toFixed(1)} mi`;
}
