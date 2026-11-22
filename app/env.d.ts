// Optional Worker vars for the commit feed. Neither is set in production;
// they are declared here, not in wrangler.jsonc, so `wrangler types` keeps them optional.
interface Env {
  /** Fine-grained, public-repo read-only token; only if GitHub rate-limits anonymous calls. */
  GITHUB_TOKEN?: string;
  /** Overrides https://api.github.com; used only by tests and local fixtures. */
  GITHUB_API_BASE?: string;
}
