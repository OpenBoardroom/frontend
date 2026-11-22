import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    reactRouter(),
  ],
  // Local `pnpm preview` only: lets curl forge Host headers to test redirects.
  preview: {
    allowedHosts: [
      ".openboardroom.org",
      ".openboardroom.io",
      ".brdrmr.org",
      ".brdrmr.com",
    ],
  },
  resolve: {
    tsconfigPaths: true,
  },
});
