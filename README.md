# OpenBoardroom frontend

The public website for [OpenBoardroom](https://openboardroom.org): a React Router v7 app on Cloudflare Workers. Design and plan: see `docs/` and the [deploy spec](https://github.com/OpenBoardroom/architecture/blob/main/docs/specs/2026-11-21-frontend-deploy-and-holding-page-design.md).

## Commands

Node 24 (`.nvmrc`) and pnpm (`corepack enable`).

| Command        | What it does                                          |
| -------------- | ----------------------------------------------------- |
| `pnpm install` | Install dependencies and generate Worker types        |
| `pnpm dev`     | Dev server on localhost                               |
| `pnpm check`   | Biome, then `react-router typegen && tsc -b`          |
| `pnpm test`    | Vitest with coverage                                  |
| `pnpm build`   | Production build                                      |
| `pnpm preview` | Build, then serve the built Worker locally in workerd |

## Deploys

Only CI deploys. Do not run `wrangler deploy` by hand.

## CI and deploy credentials

Anyone with write access to the repo can open a same-repo PR whose code runs in CI with the preview token (`CLOUDFLARE_PREVIEW_TOKEN`). That token can upload Worker versions but has no DNS or route access. Fork PRs and Dependabot PRs get no preview. Only `main`, through the `production` environment, can reach the deploy token (`CLOUDFLARE_API_TOKEN`).

## Cutover (Quinn, after the PR merges)

1. Confirm the `deploy` job succeeded and openboardroom.org serves the new page.
2. In the old Pages project, remove the custom domains brdrmr.org and www.brdrmr.org. Merge the one-line PR that adds them to `wrangler.jsonc`; its deploy attaches them. brdrmr.org is unreachable for the minutes between these two steps.
3. Check every redirect host from §5.
4. Delete the old Pages project. Record the result on #19.
