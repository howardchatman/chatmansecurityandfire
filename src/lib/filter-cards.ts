// Summary cards at the top of admin list pages double as filters: clicking one
// narrows the list below to what the card counts. Cards on other pages
// (dashboard, reports, a customer's file) deep-link to a filtered list with
// ?status=… or ?group=… (or ?card=… where a page defines its own rule).

/** Classes for a clickable summary card; `base` is the card's own look. */
export function filterCardClass(base: string, active: boolean): string {
  return [
    base,
    "block w-full text-left cursor-pointer transition hover:shadow-md hover:border-orange-300",
    active ? "ring-2 ring-orange-400" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** A query-string value from the current URL (client only). */
export function readQuery(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}
