import { createRequestHandler, RouterContextProvider } from "react-router";
import { cloudflareContext } from "../app/server/cloudflare-context";
import { canonicalRedirect } from "../app/server/redirect";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    const redirect = canonicalRedirect(request);
    if (redirect) return redirect;
    // run_worker_first routes asset requests here; serve a hit, else fall through.
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) return asset;
    const context = new RouterContextProvider();
    context.set(cloudflareContext, { env, ctx });
    return requestHandler(request, context);
  },
} satisfies ExportedHandler<Env>;
