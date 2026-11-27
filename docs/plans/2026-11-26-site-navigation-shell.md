# Site Navigation Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a top navigation bar (logo, About, This season, Explore, search) to every page, with About staying the landing page and two "in development" pages for the data views to come.

**Architecture:** The bar lives in the root `Layout`, so every route, including the error page, gets it. It uses React Router `NavLink`s, which set `aria-current="page"` on the current link. On a phone, the links fold into a native `<details>` menu. The search box is a plain `GET /explore` form. Two new routes, `routes/season.tsx` and `routes/explore.tsx`, render copy from `app/content/pages.ts`. Small helpers in `app/lib/site.ts` build canonical URLs and read the search query. Nothing reads the database.

**Tech Stack:** React Router v7 (framework mode) on Cloudflare Workers, TypeScript strict, Biome, Vitest (Node environment; coverage on `app/server`, `app/content`, `app/lib`), Playwright with `@axe-core/playwright`, pnpm.

**Spec:** `OpenBoardroom/architecture` → `docs/specs/2026-11-26-site-navigation-shell-design.md` (approved by Quinn 2026-11-26). Issue: BR-28 (#28).

## Global Constraints

- Branch `task/BR-28`; commits `[BR-28] TYPE: message`, each ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never push without Quinn's approval.
- Test-first. `pnpm check`, `pnpm test` (coverage thresholds 80% lines and branches on the covered folders), and `pnpm e2e` pass at the end of every task.
- No database access, no invented data: no counts, company names, or sample rows on the new pages.
- Works with JavaScript off: links, search, and the phone menu.
- Accessibility: the bar is `<nav aria-label="Main">`; the current link has `aria-current="page"`; the search box has a label; every page passes the existing axe check with no violations.
- User-facing copy is neutral (handbook, *Content neutrality*). The PR gets a "Neutrality review" section.
- The search query is untrusted: it is rendered only as JSX text, trimmed, and capped at 200 characters.

## Review Focus

1. **A hostile or huge search query** (`<script>`, a 10,000-character string, an empty or whitespace query, a repeated `q`): it renders as plain text, is capped at 200 characters, and an empty query shows no "Search for" line. Tests in Tasks 1 and 3.
2. **JavaScript off:** clicking each link, submitting search, and opening the phone menu all work. Test in Task 2.
3. **The 404 page** still renders, inside the bar, with no crash in the layout. Test in Task 2.
4. **A phone-width viewport (375px):** the bar doesn't overflow sideways, the menu holds the three links, and search stays visible. Test in Task 2.
5. **The About page is unchanged:** headings, the status panel, the commit feed and its 5-minute revalidation, and the examples behave as before. The existing e2e tests stay green. Covered by `e2e/home.spec.ts` in every task.

---

### Task 1: Routes, page copy, and site helpers

**Files:**
- Create: `app/content/pages.ts`, `app/lib/site.ts`
- Modify: `app/routes.ts`
- Test: `test/smoke.test.ts`, `test/site.test.ts` (new), `test/content.test.ts`

**Interfaces:**
- Produces:
  - `NAV_LINKS: readonly { label: string; to: string }[]`: About `/`, This season `/season`, Explore `/explore`, in that order.
  - `PAGES.season` and `PAGES.explore`, each `{ title: string; description: string; body: string }`.
  - `SEARCH_LABEL = "Search proposals"`.
  - `canonicalUrl(path: string): string`, returning `https://openboardroom.org` + path.
  - `searchQuery(url: URL): string`: the first `q`, trimmed, at most `MAX_QUERY = 200` characters, `""` when missing.
  - `routes.ts` adds `route("season", "routes/season.tsx")` and `route("explore", "routes/explore.tsx")`. Their route modules are created in Task 3; Task 1 adds stub modules that render the page title, so `pnpm check` passes.

Page copy (exact, reviewed for neutrality in the PR):
- **This season.** Title "This season". Description and body: "An overview of the 2026 ballot at S&P 100 companies: each item, what the vote decides, who put it forward, and the board's recommendation. This view is in development."
- **Explore.** Title "Explore". Description and body: "Browse and search ballot items by company, topic, and who put them forward. This view is in development."

- [ ] **Step 1: Write failing tests**
  - `smoke.test.ts`: the index route is `routes/home.tsx`; routes `season` and `explore` map to `routes/season.tsx` and `routes/explore.tsx`; there are exactly three routes.
  - `site.test.ts`:
    - `canonicalUrl("/")` and `canonicalUrl("/season")` return the exact URLs.
    - `searchQuery`:
      - `?q=%20water%20` gives `"water"`
      - no `q` gives `""`
      - `?q=a&q=b` gives `"a"`
      - a 10,000-character query gives 200 characters
      - `?q=<script>` gives the string unchanged, since escaping is the renderer's job
  - `content.test.ts`: `NAV_LINKS` labels and targets in order; `PAGES` copy exactly as above; neither page's copy contains a digit other than "2026" or "100" (no invented counts).
- [ ] **Step 2: Run.** `pnpm test`. Expected: failures on the missing modules and routes.
- [ ] **Step 3: Implement** the content, the helpers, the routes, and the two stub route modules.
- [ ] **Step 4: Run.** `pnpm check && pnpm test && pnpm e2e`. Expected: all pass.
- [ ] **Step 5: Commit** `[BR-28] NEW: add the season and explore routes, page copy, and site helpers`.

### Task 2: The navigation bar

**Files:**
- Create: `app/components/SiteHeader.tsx`
- Modify: `app/root.tsx` (render `<SiteHeader />` inside `Layout`, above `children`), `app/routes/home.tsx` (the masthead keeps the `h1`; the logo moves to the bar), `app/styles.css`
- Test: `e2e/navigation.spec.ts` (new)

**Interfaces:**
- Consumes: `NAV_LINKS`, `SEARCH_LABEL` (Task 1).
- Produces: `SiteHeader()`, which renders:
  - `<header class="site-header">` holding the logo (linking to `/`)
  - `<nav aria-label="Main">` with one `NavLink` per `NAV_LINKS` entry (`end` on `/`)
  - `<form method="get" action="/explore" role="search">` with a labelled `<input name="q" type="search">`
  - on narrow screens, the links inside `<details class="nav-menu"><summary>Menu</summary>…</details>`; on wide screens the links show inline and the summary is hidden by CSS

- [ ] **Step 1: Write failing e2e tests** (`e2e/navigation.spec.ts`):
  - `every page has the bar`: on `/`, `/season`, `/explore`, and an unknown path (404), there is a `navigation` named "Main" with links About, This season, and Explore, plus a search box labelled "Search proposals".
  - `the current page is marked`: on `/season`, "This season" has `aria-current="page"` and About doesn't.
  - `works without JavaScript`: a context with `javaScriptEnabled: false` follows the "Explore" link to `/explore`, and submitting "water" in search lands on `/explore?q=water`.
  - `phone menu`: at a 375×800 viewport, the links are inside a closed `details.nav-menu`; opening it shows all three; `document.documentElement.scrollWidth <= 375`.
  - `no accessibility violations`: AxeBuilder on `/`, `/season`, and `/explore` reports none.
- [ ] **Step 2: Run.** `pnpm e2e`. Expected: the new tests fail; `home.spec.ts` stays green.
- [ ] **Step 3: Implement** the header, the layout change, and the styles. Reuse the existing color tokens, the logo component, and the 899px breakpoint.
- [ ] **Step 4: Run.** `pnpm check && pnpm test && pnpm e2e`. Expected: all pass.
- [ ] **Step 5: Commit** `[BR-28] NEW: add the site navigation bar with search`.

### Task 3: The This season and Explore pages

**Files:**
- Modify: `app/routes/season.tsx`, `app/routes/explore.tsx` (replacing the Task 1 stubs), `app/styles.css` if needed
- Test: `e2e/pages.spec.ts` (new)

**Interfaces:**
- Consumes: `PAGES`, `canonicalUrl`, `searchQuery` (Task 1).
- Produces two route modules, each with:
  - `meta`: the title "<page title> · OpenBoardroom", the description, `og:url`
  - `links`: the canonical link
  - a page: an `h1`, the body, and a "Read about OpenBoardroom" link to `/`

  Explore also has a `loader({ request })` that returns `{ query: searchQuery(new URL(request.url)) }`. When the query isn't empty, it shows: `Search for “{query}” will work once Explore is ready.`

- [ ] **Step 1: Write failing e2e tests** (`e2e/pages.spec.ts`):
  - `season page`: heading "This season", the body text, a canonical link `https://openboardroom.org/season`, and the title "This season · OpenBoardroom".
  - `explore shows the query`: `/explore?q=water` shows "Search for “water” will work once Explore is ready."; `/explore` shows no "Search for" line.
  - `hostile query is text`: `/explore?q=<img src=x onerror=alert(1)>` shows the text literally, adds no `img` to the page, and raises no dialog.
  - `long query is capped`: a 1,000-character query shows at most 200 characters of it.
- [ ] **Step 2: Run.** Expected: they fail.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** `pnpm check && pnpm test && pnpm e2e`. Expected: all pass.
- [ ] **Step 5: Commit** `[BR-28] NEW: add the This season and Explore pages`.

### Task 4: Docs and a local look

**Files:**
- Modify: `README.md` (the site's routes, and that This season and Explore wait on the database path)

- [ ] **Step 1: Update the README.**
- [ ] **Step 2: `pnpm preview`** and look at `/`, `/season`, and `/explore?q=water` at desktop and phone widths. Record any visual fix as its own commit with a test where one fits.
- [ ] **Step 3: Commit** `[BR-28] UPDATE: document the site's routes`.
