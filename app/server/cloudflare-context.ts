import { createContext } from "react-router";

/** Worker env and execution context, read in loaders via `context.get(...)`. */
export const cloudflareContext = createContext<{
  env: Env;
  ctx: ExecutionContext;
}>();
