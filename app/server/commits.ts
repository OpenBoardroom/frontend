export type Commit = {
  repo: "frontend" | "backend";
  sha: string;
  message: string;
  url: string;
  /** ISO 8601 */
  date: string;
};
export type CommitFeed =
  | { status: "ok"; commits: Commit[] }
  | { status: "unavailable" };

export const FEED_REPOS = ["frontend", "backend"] as const;
export const GITHUB_API = "https://api.github.com";

const ORG = "OpenBoardroom";
const PER_PAGE = 5;
const TIMEOUT_MS = 3000;
const CACHE_TTL_SECONDS = 300;

type Repo = (typeof FEED_REPOS)[number];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** Validates one GitHub commit item; returns null for anything malformed. */
function parseCommit(repo: Repo, item: unknown): Commit | null {
  if (!isRecord(item)) return null;
  const { sha, html_url: url, commit } = item;
  if (typeof sha !== "string" || typeof url !== "string" || !isRecord(commit))
    return null;
  const { message, committer } = commit;
  if (typeof message !== "string" || !isRecord(committer)) return null;
  const date = committer.date;
  if (typeof date !== "string" || Number.isNaN(Date.parse(date))) return null;
  return { repo, sha, message, url, date };
}

async function fetchRepo(
  repo: Repo,
  opts: { fetch: typeof fetch; token?: string; apiBase: string },
): Promise<Commit[]> {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "user-agent": "OpenBoardroom-site",
  };
  if (opts.token) headers.authorization = `Bearer ${opts.token}`;
  const response = await opts.fetch(
    `${opts.apiBase}/repos/${ORG}/${repo}/commits?per_page=${PER_PAGE}`,
    {
      headers,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      // Workers-only option: cache GitHub's answer at the edge to stay under its rate limit.
      cf: { cacheTtl: CACHE_TTL_SECONDS, cacheEverything: true },
    } as RequestInit<RequestInitCfProperties>,
  );
  if (!response.ok) throw new Error(`GitHub responded ${response.status}`);
  const body: unknown = await response.json();
  if (!Array.isArray(body)) throw new Error("GitHub response is not an array");
  return body.flatMap((item) => parseCommit(repo, item) ?? []);
}

/** Fetches the newest public commits across the feed repos. Never throws. */
export async function fetchRecentCommits(opts: {
  fetch: typeof fetch;
  token?: string;
  /** Defaults to GITHUB_API; set only by the e2e fixture. */
  apiBase?: string;
  limit?: number;
}): Promise<CommitFeed> {
  const { limit = PER_PAGE, apiBase = GITHUB_API } = opts;
  const results = await Promise.allSettled(
    FEED_REPOS.map((repo) =>
      fetchRepo(repo, { fetch: opts.fetch, token: opts.token, apiBase }),
    ),
  );
  const commits = results
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, limit);
  return commits.length > 0
    ? { status: "ok", commits }
    : { status: "unavailable" };
}

/** First line of a commit message, truncated to `max` characters with an ellipsis. */
export function firstLine(message: string, max = 100): string {
  const line = (message.split("\n")[0] ?? "").trim();
  if (line === "") return "(no message)";
  const chars = [...line];
  return chars.length > max ? `${chars.slice(0, max - 1).join("")}…` : line;
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
}

/** Coarse relative time; falls back to a UTC date after a week. */
export function relativeTime(iso: string, now: Date): string {
  const seconds = (now.getTime() - Date.parse(iso)) / 1000;
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return plural(minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return plural(hours, "hour");
  const days = Math.floor(hours / 24);
  if (days < 7) return plural(days, "day");
  return dateFormat.format(new Date(iso));
}
