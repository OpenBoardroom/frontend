export const CANONICAL_ORIGIN = "https://openboardroom.org";

export const REDIRECT_HOSTS: readonly string[] = [
  "www.openboardroom.org",
  "openboardroom.io",
  "www.openboardroom.io",
  "brdrmr.org",
  "www.brdrmr.org",
  "brdrmr.com",
  "www.brdrmr.com",
];

function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
}

/** Returns a 301 to the canonical origin for non-canonical hosts, else null. */
export function canonicalRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  // Prefer the Host header: behind custom domains it is the name the client used.
  const host = normalizeHost(request.headers.get("host") ?? url.host);
  if (!REDIRECT_HOSTS.includes(host)) return null;
  // pathname and search are used as-is so percent-encoding is not altered.
  const location = `${CANONICAL_ORIGIN}${url.pathname}${url.search}`;
  // Not Response.redirect(): its headers are immutable.
  return new Response(null, { status: 301, headers: { location } });
}
