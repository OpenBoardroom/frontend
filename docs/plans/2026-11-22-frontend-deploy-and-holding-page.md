# Frontend Deploy Path and Holding Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Create React App site with a React Router v7 app on Cloudflare Workers, deployed only by CI, whose first page is the new OpenBoardroom holding page.

**Architecture:** One Worker serves every domain. Its fetch handler first redirects non-canonical hosts to `https://openboardroom.org`, then hands the request to React Router. The single route `/` server-renders the About copy, a status panel (milestones from a typed file, recent commits fetched from GitHub with a 5-minute cache and a soft failure), and three example proposals using native `<details>`. GitHub Actions checks every PR, uploads a preview version for branches in the repo, and deploys `main` through the `production` environment.

**Tech Stack:** React Router v7 (framework mode), Cloudflare Workers with `@cloudflare/vite-plugin`, Wrangler, TypeScript (strict), Biome, Vitest with v8 coverage, Playwright, pnpm, Node 24 LTS, lefthook, gitleaks.

**Spec:** `OpenBoardroom/architecture` → `docs/specs/2026-11-21-frontend-deploy-and-holding-page-design.md` (approved 2026-11-22). Content comes from `architecture/docs/drafts/2026-11-21-about-page-copy.md`, section 3 and its "Sources" lists. The visual reference is `docs/design/example-list-v9.html` in this repo.

## Global Constraints

- Ticket BR-19; branch `task/BR-19`; commits `[BR-19] TYPE: message` (NEW, UPDATE, FIX, REVERT), each ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Never push, deploy, or run `wrangler deploy`, `wrangler versions upload`, or `wrangler rollback` locally. Only CI deploys. Ask Quinn before any push or PR.
- Never read or print `.env` (an old CRA `.env` is in the working tree and git-ignored). Delete it only if Quinn agrees.
- Node 24 LTS (`.nvmrc`: `24`; locally, `nvm install 24 && nvm use`); pnpm via corepack with an exact version pinned in `packageManager`.
- TypeScript `strict: true` and `noUncheckedIndexedAccess: true`; Biome for format and lint; Vitest coverage gate of 80% lines and branches.
- Canonical origin `https://openboardroom.org`. Redirect hosts: `www.openboardroom.org`, `openboardroom.io`, `www.openboardroom.io`, `brdrmr.org`, `www.brdrmr.org`, `brdrmr.com`, `www.brdrmr.com`. Status 301, with path and query preserved.
- In the first PR, `wrangler.jsonc` attaches every host except `brdrmr.org` and `www.brdrmr.org` (spec §5, staged attachment).
- Secrets and variables, already created by Quinn: `CLOUDFLARE_API_TOKEN` (environment `production` only), `CLOUDFLARE_PREVIEW_TOKEN` (repo secret), `CLOUDFLARE_ACCOUNT_ID` (repo variable). An optional Worker secret is `GITHUB_TOKEN`; don't add it now.
- Commits feed: repos `OpenBoardroom/frontend` and `OpenBoardroom/backend`; 5 most recent overall; 5-minute cache; 3-second timeout; fallback text exactly "Recent work is unavailable right now", linking to `https://github.com/OpenBoardroom`.
- Tense rule (spec §7.1): nothing not yet live is described as live. Task 4 lists the exact copy changes.
- Example community content stays labeled exactly "Example content, not real users."
- Actions pinned by full commit SHA with a version comment, as in `backend/.github/workflows/ci.yml`. Resolve each SHA with `gh api repos/<owner>/<repo>/git/ref/tags/<tag>`.
- Code license: AGPL-3.0-only. Copy `LICENSE` byte-for-byte from `architecture/LICENSE-CODE` and check that the sha256 matches.

## Review Focus

1. **GitHub down, slow, or rate-limited** (403 or 429, non-JSON body, or more than 3 s): the page still returns 200 and the panel shows the fallback. Tests in Task 3.
2. **One repo fails, the other succeeds:** show the commits that did load, not the fallback. Test in Task 3.
3. **Hostile or odd commit messages** (HTML, multiple lines, 300 characters, empty): show the first line only, truncated to 100 characters with "…", rendered as text. Tests in Task 3; the Playwright check in Task 6.
4. **Host variants** (`BRDRMR.ORG`, `brdrmr.org:443`, `brdrmr.org.` with a trailing dot, encoded paths like `/a%20b?x=1&y=2`): all redirect correctly, and unknown hosts (`*.workers.dev` previews, `localhost`) are served, not redirected. Tests in Task 2.
5. **Phone width (360 px):** no horizontal page scroll; the vote bar and its legend wrap. Playwright test in Task 6.

---

### Task 1: Scaffold the React Router app and repo tooling

Replaces the CRA app and sets up everything later tasks build on.

**Files:**
- Delete: `src/`, `public/`, `build/`, the CRA `package.json`, `README.md`
- Create: the React Router Cloudflare template (`app/root.tsx`, `app/routes.ts`, `app/routes/home.tsx`, `workers/app.ts`, `vite.config.ts`, `react-router.config.ts`, `wrangler.jsonc`, `tsconfig*.json`), `package.json`, `pnpm-lock.yaml`, `.nvmrc`, `biome.json`, `vitest.config.ts`, `lefthook.yml`, `.gitignore`, `LICENSE`, `CLAUDE.md`, `.claude/settings.json`, `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`
- Test: `test/smoke.test.ts`

**Interfaces:**
- Produces: `pnpm check` (Biome, then `tsc` via `react-router typegen && tsc -b`), `pnpm test` (Vitest with coverage), `pnpm build`, `pnpm dev`. `workers/app.ts` default-exports `{ fetch(request, env, ctx) }`, which calls React Router's `createRequestHandler`. The `Env` type is generated by `wrangler types` into `worker-configuration.d.ts`.

- [ ] **Step 1: Generate the template into a scratch directory and move it in.** Run `pnpm create react-router@latest <scratch> --template remix-run/react-router-templates/cloudflare --no-install`. Copy its files over the CRA tree and delete the CRA files listed above. Keep `docs/` and `.git/`. Don't run the template's install yet.
- [ ] **Step 2: Pin the toolchain.** `.nvmrc` = `24`. In `package.json`, set `"name": "openboardroom-frontend"`, `"private": true`, `"license": "AGPL-3.0-only"`, `"packageManager": "pnpm@<exact current 10.x>"`, and `"engines": { "node": ">=24" }`. Add dev dependencies `@biomejs/biome`, `vitest`, `@vitest/coverage-v8`, `@playwright/test`, `lefthook`, each at an exact version.
- [ ] **Step 3: Configure strictness.** In `tsconfig`, set `strict` and `noUncheckedIndexedAccess`. In `biome.json`, use the recommended rules, ignore generated files (`.react-router/`, `worker-configuration.d.ts`, `build/`), and run the formatter. `vitest.config.ts`: environment `node`, include `test/**/*.test.ts`, coverage provider `v8` over `app/server/**` and `app/content/**`, thresholds `{ lines: 80, branches: 80 }`.
- [ ] **Step 4: Write the failing smoke test.** `test/smoke.test.ts` imports `routes` from `app/routes.ts` and asserts that it has exactly one index route whose file is `routes/home.tsx`.
- [ ] **Step 5: Run it.** `pnpm install && pnpm test`. Expected: PASS once the template routes resolve. If the template's route file has a different name, rename it to `routes/home.tsx` until the test passes.
- [ ] **Step 6: Set the Worker config.** In `wrangler.jsonc`: `name: "openboardroom-frontend"`, a current `compatibility_date`, `observability.enabled: true`, `workers_dev: true`, `preview_urls: true` **(verify both are needed for preview URLs)**, no `routes` yet (Task 2 adds them). Run `pnpm exec wrangler types`.
- [ ] **Step 7: Add repo files.**
  - `LICENSE`: copy from `architecture/LICENSE-CODE`; check with `shasum -a 256`.
  - `CLAUDE.md`: from `architecture/templates/CLAUDE.md`, with the repo-specific commands filled in.
  - `.claude/settings.json`: byte-identical to `architecture/templates/claude-settings.json`.
  - `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`: copy from the backend.
  - `lefthook.yml`, pre-commit: `pnpm exec biome check --staged`, `pnpm exec tsc -b`, `gitleaks protect --staged`.
  - `.gitignore`: node_modules, build, `.react-router`, `.wrangler`, `.env*` (but not `.env.example`), `coverage`, `playwright-report`, `test-results`, `.superpowers`.
  - `README.md`: what the repo is, commands, "only CI deploys", and the cutover runbook copied from spec §10.
- [ ] **Step 8: Verify.** `pnpm check && pnpm test && pnpm build` all exit 0. `pnpm dev` serves the template page on localhost.
- [ ] **Step 9: Commit.** `[BR-19] NEW: replace the CRA app with React Router v7 on Workers`

### Task 2: Canonical-host redirects

**Files:**
- Create: `app/server/redirect.ts`
- Modify: `workers/app.ts`, `wrangler.jsonc`
- Test: `test/redirect.test.ts`

**Interfaces:**
- Produces: `export const CANONICAL_ORIGIN = "https://openboardroom.org"`, `export const REDIRECT_HOSTS: readonly string[]` (the seven hosts), and `export function canonicalRedirect(request: Request): Response | null`.

- [ ] **Step 1: Write the failing tests.**
```ts
test.each(REDIRECT_HOSTS)("%s redirects with path and query", (host) => {
  const res = canonicalRedirect(new Request(`https://${host}/a%20b?x=1&y=2`));
  expect(res?.status).toBe(301);
  expect(res?.headers.get("location")).toBe("https://openboardroom.org/a%20b?x=1&y=2");
});
test("host matching ignores case, port, and a trailing dot", () => {
  for (const h of ["BRDRMR.ORG", "brdrmr.org:443", "brdrmr.org."]) {
    const req = new Request("https://placeholder/", { headers: { host: h } });
    expect(canonicalRedirect(req)?.headers.get("location")).toBe("https://openboardroom.org/");
  }
});
test.each(["openboardroom.org", "localhost:5173", "openboardroom-frontend.example.workers.dev"])(
  "%s is served, not redirected", (host) => {
    expect(canonicalRedirect(new Request(`https://${host}/`))).toBeNull();
  });
test("REDIRECT_HOSTS is exactly the spec's seven", () => {
  expect([...REDIRECT_HOSTS].sort()).toEqual(["brdrmr.com", "brdrmr.org", "openboardroom.io",
    "www.brdrmr.com", "www.brdrmr.org", "www.openboardroom.io", "www.openboardroom.org"]);
});
```
- [ ] **Step 2: Run them.** `pnpm test test/redirect.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement `canonicalRedirect`.** Read the host from the `Host` header, falling back to `new URL(request.url).host`; lowercase it and strip the port and any trailing dot. Build the location from the canonical origin plus `url.pathname + url.search`, without decoding. Return `Response.redirect(location, 301)`, or `null`.
- [ ] **Step 4: Run them.** Expected: PASS.
- [ ] **Step 5: Wire it in and attach the domains.** In `workers/app.ts`, call `canonicalRedirect(request) ?? requestHandler(...)`. In `wrangler.jsonc`, add `routes`: `{ "pattern": "<host>", "custom_domain": true }` for `openboardroom.org`, `www.openboardroom.org`, `openboardroom.io`, `www.openboardroom.io`, `brdrmr.com`, `www.brdrmr.com`. Leave out `brdrmr.org` and `www.brdrmr.org`, with a comment pointing to spec §5 and §10.
- [ ] **Step 6: Verify.** Run `pnpm check && pnpm test`. Then run `pnpm build && pnpm exec wrangler dev --port 8787`, and in another shell: `curl -sI -H 'Host: brdrmr.org' http://localhost:8787/x?y=1` shows `301` and `location: https://openboardroom.org/x?y=1`.
- [ ] **Step 7: Commit.** `[BR-19] NEW: redirect every other domain to openboardroom.org`

### Task 3: Recent-commits feed

**Files:**
- Create: `app/server/commits.ts`
- Test: `test/commits.test.ts`, `test/fixtures/github-commits-frontend.json`, `test/fixtures/github-commits-backend.json` (trimmed real responses: `sha`, `html_url`, `commit.message`, `commit.committer.date`)

**Interfaces:**
- Produces:
```ts
export type Commit = { repo: "frontend" | "backend"; sha: string; message: string; url: string; date: string /* ISO 8601 */ };
export type CommitFeed = { status: "ok"; commits: Commit[] } | { status: "unavailable" };
export const FEED_REPOS = ["frontend", "backend"] as const;
export const GITHUB_API = "https://api.github.com";
export async function fetchRecentCommits(opts: { fetch: typeof fetch; token?: string; apiBase?: string /* default GITHUB_API; set only by the e2e fixture */; limit?: number /* default 5 */ }): Promise<CommitFeed>;
export function firstLine(message: string, max?: number /* default 100 */): string;
export function relativeTime(iso: string, now: Date): string; // "just now", "5 minutes ago", "3 hours ago", "2 days ago", then "Nov 3, 2026"
```

- [ ] **Step 1: Write the failing tests**, using a stub `fetch` that routes by URL to the fixtures.
  - `merges both repos newest first and keeps 5`: the result has 5 commits, sorted by `date` descending, mixed across repos.
  - `requests each repo with per_page=5, a GitHub Accept header, a User-Agent, and a 300-second cf cacheTtl`: assert on the stub's recorded `url` and `init` (`init.cf.cacheTtl === 300`, `cacheEverything === true`).
  - `sends Authorization only when a token is given`.
  - `uses apiBase when given`: requests go to `http://localhost:8788/repos/OpenBoardroom/frontend/commits?per_page=5`.
  - `one repo failing still returns the other repo's commits`: frontend returns 500, so the result has `status: "ok"` with only backend commits.
  - `all repos failing gives unavailable`: test each of 403, 429, a non-JSON body, a JSON body that isn't an array, a thrown network error, and a request that never resolves (aborted at 3 s by `AbortSignal.timeout(3000)`; use fake timers).
  - `firstLine`: `"fix\n\nbody"` → `"fix"`; a 300-character line → 100 characters ending in `"…"`; `""` → `"(no message)"`; `"<b>x</b>"` is returned unchanged (escaping is React's job; Task 6 checks it).
  - `relativeTime` at each boundary: 30 s, 5 min, 3 h, 2 d, and 10 d (`"Nov 3, 2026"` format, `en-US`, UTC).
- [ ] **Step 2: Run them.** `pnpm test test/commits.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.** Fetch both repos in parallel with `Promise.allSettled`. Validate each response's shape and drop invalid items, without throwing. Return `unavailable` only when no repo yields any commits.
- [ ] **Step 4: Run them.** Expected: PASS. `pnpm test` coverage for `app/server/` is at least 80% for lines and branches.
- [ ] **Step 5: Commit.** `[BR-19] NEW: fetch recent public commits with a cache and soft failure`

### Task 4: Page content as typed data

**Files:**
- Create: `app/content/about.ts`, `app/content/examples.ts`, `app/content/milestones.ts`
- Test: `test/content.test.ts`

**Interfaces:**
- Produces:
```ts
// about.ts
export type Inline = string | { text: string; href: string } | { text: string; strong: true };
export type Block = { kind: "p"; parts: Inline[] } | { kind: "ol" | "ul"; items: Inline[][] };
export type Section = { id: string; heading: string; blocks: Block[] };
export type Source = { n: number; text: string; href: string };
export const ABOUT: { title: string; description: string; sections: Section[]; sources: Source[] };

// milestones.ts
export type Milestone = { title: string; detail?: string; status: "done" | "in-progress" | "next" | "later"; date?: string };
export const MILESTONES: Milestone[];

// examples.ts
export type Holder = { name: string; pct: number; vote?: "For" | "Against" | "Abstain"; voteNote?: string; parent?: string };
export type Argument = { by: string; points: string[] };
export type Example = {
  id: string; company: string; meeting: string; number: number; title: string; question: string;
  proponent: string; boardRecommendation: "For" | "Against"; standard: string;
  result: { for: number; against: number; abstain: number; brokerNonVotes?: number; passed: boolean; pctFor: number };
  holders: Holder[]; othersPct: number; distributionNote?: string;
  arguments: { for: Argument; against: Argument };
  community: { poll: { support: number; oppose: number; unsure: number }; comments: { author: string; text: string }[] };
  sources: { label: string; href: string }[];
};
export const EXAMPLES: Example[];
export const EXAMPLES_FINE_PRINT: string[];
```

- [ ] **Step 1: Write the failing tests.**
  - `ABOUT has the five sections in order`: headings are "What OpenBoardroom is", "Why it matters", "How it works", "Our values", "Who runs it".
  - `tense rule`: the joined text of `ABOUT` contains none of the strings "are public, so anyone can check", "An AI model drafts these summaries", or "is logged publicly". It does contain "will be public", "will draft", and "will be logged publicly".
  - `every URL is https`, across `ABOUT.sources`, `EXAMPLES[*].sources`, and inline links.
  - `each example's pctFor matches its counts`: `Math.round(1000 * for / (for + against)) / 10 === pctFor`. This gives 14.2, 33.7, and 31.3.
  - `holders plus others sum to 100 ± 0.2`, counting only holders without a `parent`. Nested fund slices like the Vanguard 500 have `parent: "The Vanguard Group"` and are excluded from the sum.
  - `examples are in the spec's order`: Alphabet 2024 P14, Apple 2022 P7, Alphabet 2024 P9.
  - `fine print`: it includes "Examples were chosen to show different kinds of proposals; they aren't recommendations." and "These example summaries were written by hand from the filings. On the live site, an AI model will draft them and a person will review each one."
  - `MILESTONES statuses`: exactly one item is `in-progress`.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Transcribe the content.**
  - `ABOUT`: from the About draft, section 3. Title "OpenBoardroom: your seat at the table". Description: the first sentence of "Why it matters". Apply exactly these tense edits (spec §7.1):
    - "An AI model drafts these summaries from the filing, and a person reviews each one before it's published." → "An AI model will draft these summaries from the filing, and a person will review each one before it's published."
    - "Our summary prompts, style rules, and a log of every correction are public, so anyone can check that we keep that promise." → "Our summary prompts, style rules, and a log of every correction will be public, so anyone can check that we keep that promise."
    - "every change to something we've published is logged publicly" → "every change to something we've published will be logged publicly"
  - `EXAMPLES`: every figure, holder, vote, argument, and URL from the About draft's "How it works" sources (items 4–6) and from `docs/design/example-list-v9.html`. Where they disagree, the draft wins; note any disagreement in the commit body.
  - `MILESTONES`: the five from spec §7.3, with statuses done, in-progress, next, later, later.
- [ ] **Step 4: Run them.** Expected: PASS.
- [ ] **Step 5: Commit.** `[BR-19] NEW: add the About copy, milestones, and example proposals as data`

### Task 5: The page

**Files:**
- Create: `app/components/AboutSection.tsx`, `app/components/StatusPanel.tsx`, `app/components/ExampleList.tsx`, `app/components/VoteBar.tsx`, `app/components/Logo.tsx`, `app/lib/vote-bar.ts`, `app/styles.css`, `public/favicon.svg`, `public/favicon.png` (from `~/PycharmProjects/boardroom/brand/logo-open-300.png`, resized to 192), `public/og.png` (from `brand/linkedin-banner-seat-1128x191.png`)
- Modify: `app/routes/home.tsx`, `app/root.tsx`
- Test: `test/vote-bar.test.ts`

**Interfaces:**
- Consumes: `fetchRecentCommits`, `relativeTime`, `firstLine` (Task 3); `ABOUT`, `EXAMPLES`, `EXAMPLES_FINE_PRINT`, `MILESTONES` (Task 4).
- Produces: `export function barSegments(holders: Holder[], othersPct: number): { label: string; pct: number; nested: { label: string; pct: number }[] }[]`. The home route's `loader({ context })` returns `{ feed: CommitFeed }`, passing `context.cloudflare.env.GITHUB_TOKEN` and `GITHUB_API_BASE` when set. Neither is set in production.

- [ ] **Step 1: Write the failing test** for `barSegments`: top-level holders in the given order, then "Everyone else"; a holder with `parent` appears under its parent's `nested`, not as its own segment; percentages are unchanged.
- [ ] **Step 2: Run it.** Expected: FAIL. **Step 3:** Implement. **Step 4:** Run it. Expected: PASS.
- [ ] **Step 5: Build the page to match `docs/design/example-list-v9.html`.**
  - **Layout B:** a main column with the five About sections (examples inside "How it works") and the sources list, plus a side `<aside>` status panel. Below 900 px, the panel stacks after the About sections.
  - **Examples:** each is one `<details>`, collapsed. Inside it, the "Vote distribution" and "Community" layers are `<details open>`, the facts are always visible, and the notes column follows the mockup. Community content carries the label "Example content, not real users."
  - **Status panel:** milestones with status markers, then "Recent work", with the fallback text and link when `feed.status === "unavailable"`. Commit text is rendered as plain JSX text: no `dangerouslySetInnerHTML` anywhere in the repo.
  - **Revalidation:** a `useEffect` calls `useRevalidator().revalidate()` every 300,000 ms while `document.visibilityState === "visible"`.
  - **Styles:** the palette as `--ob-*` custom properties on `:root`, copied from the mockup. No other color literals outside `:root`.
  - **Head:** `<title>` and description from `ABOUT`; Open Graph `og:title`, `og:description`, and `og:image` = `https://openboardroom.org/og.png`; the favicon links.
- [ ] **Step 6: Verify.** `pnpm check && pnpm test && pnpm build`. In `pnpm dev`, the page matches the mockup's structure. With network blocked (temporarily stub `fetch` to throw), the panel shows the fallback and the page renders. `grep -r dangerouslySetInnerHTML app` finds nothing.
- [ ] **Step 7: Commit.** `[BR-19] NEW: build the holding page`

### Task 6: Playwright smoke tests

**Files:**
- Create: `playwright.config.ts`, `e2e/home.spec.ts`, `e2e/fixture-github.ts` (a tiny Node HTTP server on port 8788 that serves `/repos/OpenBoardroom/{frontend,backend}/commits` from `test/fixtures/`, with one message replaced by `<img src=x onerror=alert(1)>`)
- Modify: `package.json` (`"e2e": "playwright test"`; dev dependency `@axe-core/playwright`)

**Interfaces:**
- Consumes: the built Worker, served by `wrangler dev --port 8787 --var GITHUB_API_BASE:http://localhost:8788`, and the fixture server. Both are `webServer` entries in the config, so every e2e run is offline and deterministic.

- [ ] **Step 1: Write the tests.**
  - `renders the About sections, the status panel, and three collapsed examples`: the five headings are visible; `aside` contains "Foundations"; three `details` examples exist and none is `open`.
  - `opening an example shows vote distribution and community`: click the first `summary`; "Vote distribution" and "Example content, not real users." become visible.
  - `commit messages render as text`: the fixture's hostile message appears on the page as literal text, and `page.locator('aside img')` has count 0.
  - `meets WCAG AA`: `new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()` has no violations, with every example opened first so the vote bars are checked (spec §7.4).
  - `redirect host`: `request.get("/x?y=1", { headers: { host: "brdrmr.org" }, maxRedirects: 0 })` returns 301 with `location: https://openboardroom.org/x?y=1`.
  - `phone width`: at viewport 360×800, `document.documentElement.scrollWidth <= 360`.
  - `works without JavaScript`: with `javaScriptEnabled: false`, clicking a `summary` still opens it.
- [ ] **Step 2: Run them.** `pnpm exec playwright install chromium && pnpm e2e`. Expected: all pass. Any failure means fixing the page, not the test.
- [ ] **Step 3: Commit.** `[BR-19] NEW: add Playwright smoke tests for the holding page`

### Task 7: CI, preview, deploy, and rollback workflows

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/workflows/rollback.yml`, `.github/dependabot.yml`

**Interfaces:**
- Consumes: `pnpm check`, `pnpm test`, `pnpm build`, `pnpm e2e`; secrets `CLOUDFLARE_API_TOKEN` (env `production`) and `CLOUDFLARE_PREVIEW_TOKEN`; variable `CLOUDFLARE_ACCOUNT_ID`.

- [ ] **Step 1: Write `ci.yml`.** Triggers: `pull_request`, and `push` on `main`. Top-level `permissions: contents: read`. Jobs:
  - `check` (ubuntu-latest): checkout, `pnpm/action-setup`, `actions/setup-node` with `node-version-file: .nvmrc` and the pnpm cache, `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test`, `pnpm build`, `pnpm exec playwright install --with-deps chromium`, `pnpm e2e`. Gitleaks runs as its own step via `gitleaks/gitleaks-action`, with no license key needed for an org public repo **(verify)**.
  - `preview`: `needs: check`, `if: github.event_name == 'pull_request' && github.event.pull_request.head.repo.full_name == github.repository`. Runs `pnpm exec wrangler versions upload --message "PR #${{ github.event.number }}"` with `CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_PREVIEW_TOKEN }}`, then writes the preview URL from Wrangler's output to `$GITHUB_STEP_SUMMARY`.
  - `deploy`: `needs: check`, `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`, `environment: production`, `concurrency: production`. Runs `pnpm exec wrangler deploy`.
- [ ] **Step 2: Write `rollback.yml`.** `workflow_dispatch` with an optional `version_id` input; `environment: production`; runs `pnpm exec wrangler rollback ${{ inputs.version_id }} --message "Rollback by ${{ github.actor }}" -y` **(verify the flag names in the pinned Wrangler)**.
- [ ] **Step 3: Write `dependabot.yml`.** Weekly updates for `github-actions` and `npm`, grouping minor and patch updates.
- [ ] **Step 4: Pin every action by SHA**, resolved with `gh api`, with `# vX.Y.Z` comments.
- [ ] **Step 5: Verify locally.** Run `actionlint` if it's installed (`brew install actionlint`; ask before installing), or check the YAML with `pnpm dlx yaml-lint`. `grep -n "uses:" .github/workflows/*.yml` shows only 40-character SHAs.
- [ ] **Step 6: Commit.** `[BR-19] NEW: add CI with previews, production deploy, and rollback`

### Task 8: Verify, review, and hand off

- [ ] **Step 1:** Run `pnpm check && pnpm test && pnpm build && pnpm e2e` and read the output. Every command exits 0, and coverage is at least 80%.
- [ ] **Step 2:** Run `superpowers:requesting-code-review` on the branch, and fix the findings.
- [ ] **Step 3:** Draft the PR body: summary, what's verified, and the **Neutrality review**. Check the page's copy against the handbook's neutrality rules: arguments attributed and of similar length, the example mix stated as not recommendations, community labeled as invented, values separated from platform content, and the tense rule applied. End with `Refs OpenBoardroom/architecture#19`, not `Closes`, because #19 stays open through cutover.
- [ ] **Step 4:** Ask Quinn before pushing `task/BR-19` and opening the PR. After Quinn merges: cutover per spec §10, then the one-line follow-up PR that adds `brdrmr.org` and `www.brdrmr.org` to `wrangler.jsonc`.
