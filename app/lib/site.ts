const ORIGIN = "https://openboardroom.org";

/** The longest search query kept; the rest is dropped. */
export const MAX_QUERY = 200;

/** The canonical URL for a path on the site. */
export function canonicalUrl(path: string): string {
  return `${ORIGIN}${path}`;
}

/**
 * The search box's query: the first `q`, trimmed and capped at `MAX_QUERY`
 * characters (not UTF-16 units), or "" when there is none. It is untrusted text; render it only
 * as JSX text.
 */
export function searchQuery(url: URL): string {
  // Count characters, not UTF-16 units, so an emoji is never cut in half.
  return Array.from((url.searchParams.get("q") ?? "").trim())
    .slice(0, MAX_QUERY)
    .join("");
}
