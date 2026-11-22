# frontend: OpenBoardroom

The OpenBoardroom public website: a React Router v7 app (framework mode, server-rendered) running on Cloudflare Workers. Only CI deploys it.

## Rules that always apply

- Ask Quinn before any write to GitHub (issues, comments, labels, board, pushes, PRs). Commit locally freely. Never merge, force-push, deploy, or change settings.
- Commits: `[BR-N] TYPE: message` (TYPE: NEW, UPDATE, FIX, REVERT). Branches: `task/BR-N`, `bug/BR-N`. Issues live in `OpenBoardroom/architecture`; close them with `Closes OpenBoardroom/architecture#N`.
- Workflow: issue → spec (in `architecture/docs/specs/`) → plan (in this repo's `docs/plans/`) → test-first implementation → review → PR; Quinn merges.
- Never read `.env*` files or commit secrets.
- Full rules: @../architecture/docs/handbook.md
- If that import didn't load (this repo was cloned without `../architecture`), read https://github.com/OpenBoardroom/architecture/blob/main/docs/handbook.md before acting.

## Commands

Use Node 24 (`.nvmrc`) and pnpm (pinned in `packageManager`; run `corepack enable`).

- `pnpm install`: install dependencies (the postinstall step runs `wrangler types`).
- `pnpm dev`: dev server on localhost.
- `pnpm check`: Biome, then `react-router typegen && tsc -b`.
- `pnpm format`: Biome with fixes.
- `pnpm test`: Vitest with coverage (thresholds in `vitest.config.ts`).
- `pnpm build`: production build into `build/`.
- `pnpm preview`: build, then serve the built Worker locally in workerd.
- Never run `wrangler deploy`, `wrangler versions upload`, or `wrangler rollback`; CI deploys.

## Style

- Biome (format and lint) and `tsc --strict` with `noUncheckedIndexedAccess`; see the handbook.
- Tests: Vitest in `test/`, Playwright for end-to-end.

## Contracts with other repos

- Types are checked against the backend's pinned `db/schema.sql` once the site reads the database. Change contracts only through a spec or ADR.

## Pitfalls

- `worker-configuration.d.ts` and `.react-router/` are generated and git-ignored; rerun `pnpm install` or `pnpm cf-typegen` after changing `wrangler.jsonc`.
- Keep user-facing copy neutral (handbook, "Content neutrality"); a PR that changes it needs a "Neutrality review" section.
