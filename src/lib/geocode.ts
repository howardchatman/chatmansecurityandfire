// Address → lat/lng. Google's geocoder when a key is configured; otherwise
// OpenStreetMap's Nominatim, which is free and needs only an identifying
// User-Agent. Answers are cached for a day; addresses don't move.

const cache = new Map<string, { point: { lat: number; lon: number } | null; at: number }>();
const TTL = 24 * 60 * 60 * 1000;

export async function geocode(q: string): Promise<{ lat: number; lon: number } | null> {
  const key = q.trim().toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.point;

  const point = await lookup(q.trim());
  cache.set(key, { point, at: Date.now() });
  return point;
}

async function lookup(q: string): Promise<{ lat: number; lon: number } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    const json = await res.json();
    const loc = json?.results?.[0]?.geometry?.location;
    if (loc) return { lat: loc.lat, lon: loc.lng };
    return null;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "ChatmanSecurityAndFire/1.0 (field app; info@chatmansecurityandfire.com)",
      Accept: "application/json",
    },
    next: { revalidate: 86400 },
  });
  const json = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!json?.length) return null;
  return { lat: parseFloat(json[0].lat), lon: parseFloat(json[0].lon) };
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
