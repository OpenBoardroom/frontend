// Writes build/server/wrangler.e2e.json: the build's config minus `routes`.
// With custom-domain routes, `wrangler dev` rewrites the Host header, which
// would make the redirect-host test impossible. Production config is untouched.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL("../build/server/", import.meta.url));
const config = JSON.parse(readFileSync(`${dir}wrangler.json`, "utf8"));
delete config.routes;
writeFileSync(`${dir}wrangler.e2e.json`, JSON.stringify(config));
