import { createRequestHandler, RouterContextProvider } from "react-router";
import { cloudflareContext } from "../app/server/cloudflare-context";
import { dispatch } from "../app/server/dispatch";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    return dispatch(
      request,
      (req) => env.ASSETS.fetch(req),
      (req) => {
        const context = new RouterContextProvider();
        context.set(cloudflareContext, { env, ctx });
        return requestHandler(req, context);
      },
    );
  },
} satisfies ExportedHandler<Env>;
