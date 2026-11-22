import { canonicalRedirect } from "./redirect";

/**
 * Worker dispatch order: canonical redirect, then static assets, then the app.
 * Assets run through the Worker (run_worker_first) so redirect hosts 301 every path.
 */
export async function dispatch(
  request: Request,
  fetchAsset: (request: Request) => Promise<Response>,
  fetchApp: (request: Request) => Promise<Response>,
): Promise<Response> {
  const redirect = canonicalRedirect(request);
  if (redirect) return redirect;
  // The assets service answers 405 to anything but GET/HEAD, so only ask it for those.
  if (request.method === "GET" || request.method === "HEAD") {
    const asset = await fetchAsset(request);
    if (asset.status !== 404) return asset;
  }
  return fetchApp(request);
}
