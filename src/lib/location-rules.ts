// On-site rules for the time clock, shared by the server check (lib/on-site)
// and the phone-side screens (components/tech/LocationGate).

/** How close counts as "on site": about a quarter mile, for big campuses and job trailers. */
export const SITE_RADIUS_M = 400;
/** GPS error we give the benefit of the doubt for, on top of the radius. */
export const MAX_SLACK_M = 100;
/**
 * Coarser than this is a Wi-Fi/cell guess, not GPS. An iPhone with Precise
 * Location off reports several kilometers.
 */
export const MAX_ACCURACY_M = 1000;
