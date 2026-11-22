import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type CommitFeed,
  fetchRecentCommits,
  firstLine,
  relativeTime,
} from "../app/server/commits";
import backendFixture from "./fixtures/github-commits-backend.json";
import frontendFixture from "./fixtures/github-commits-frontend.json";

type Call = {
  url: string;
  init: RequestInit & { cf?: Record<string, unknown> };
};

function stub(handler: (url: string) => Response | Promise<Response>) {
  const calls: Call[] = [];
  const fn = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init: (init ?? {}) as Call["init"] });
    return handler(url);
  }) as typeof fetch;
  return { fn, calls };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const routed = (url: string) =>
  json(url.includes("/frontend/") ? frontendFixture : backendFixture);

afterEach(() => vi.useRealTimers());

function commitsOf(feed: CommitFeed) {
  if (feed.status !== "ok") throw new Error("expected ok");
  return feed.commits;
}

describe("fetchRecentCommits", () => {
  it("merges both repos newest first and keeps 5", async () => {
    const { fn } = stub(routed);
    const commits = commitsOf(await fetchRecentCommits({ fetch: fn }));
    expect(commits).toHaveLength(5);
    const dates = commits.map((c) => c.date);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(new Set(commits.map((c) => c.repo))).toEqual(
      new Set(["frontend", "backend"]),
    );
  });

  it("honors limit", async () => {
    const { fn } = stub(routed);
    const commits = commitsOf(
      await fetchRecentCommits({ fetch: fn, limit: 2 }),
    );
    expect(commits).toHaveLength(2);
  });

  it("requests each repo with per_page=5, a GitHub Accept header, a User-Agent, and a 300-second cf cacheTtl", async () => {
    const { fn, calls } = stub(routed);
    await fetchRecentCommits({ fetch: fn });
    expect(calls.map((c) => c.url).sort()).toEqual([
      "https://api.github.com/repos/OpenBoardroom/backend/commits?per_page=5",
      "https://api.github.com/repos/OpenBoardroom/frontend/commits?per_page=5",
    ]);
    for (const { init } of calls) {
      const headers = new Headers(init.headers);
      expect(headers.get("accept")).toBe("application/vnd.github+json");
      expect(headers.get("user-agent")).toBe("OpenBoardroom-site");
      expect(init.cf?.cacheTtl).toBe(300);
      expect(init.cf?.cacheEverything).toBe(true);
      expect(init.signal).toBeInstanceOf(AbortSignal);
    }
  });

  it("sends Authorization only when a token is given", async () => {
    const a = stub(routed);
    await fetchRecentCommits({ fetch: a.fn });
    expect(new Headers(a.calls[0]?.init.headers).has("authorization")).toBe(
      false,
    );
    const b = stub(routed);
    await fetchRecentCommits({ fetch: b.fn, token: "t0ken" });
    expect(new Headers(b.calls[0]?.init.headers).get("authorization")).toBe(
      "Bearer t0ken",
    );
  });

  it("uses apiBase when given", async () => {
    const { fn, calls } = stub(routed);
    await fetchRecentCommits({ fetch: fn, apiBase: "http://localhost:8788" });
    expect(calls.map((c) => c.url)).toContain(
      "http://localhost:8788/repos/OpenBoardroom/frontend/commits?per_page=5",
    );
  });

  it("one repo failing still returns the other repo's commits", async () => {
    const { fn } = stub((url) =>
      url.includes("/frontend/") ? json({}, 500) : json(backendFixture),
    );
    const commits = commitsOf(await fetchRecentCommits({ fetch: fn }));
    expect(commits.length).toBeGreaterThan(0);
    expect(commits.every((c) => c.repo === "backend")).toBe(true);
  });

  it("drops invalid items without throwing", async () => {
    const { fn } = stub(() =>
      json([
        null,
        "x",
        { sha: 1 },
        { sha: "a", html_url: "u", commit: null },
        { sha: "a", html_url: "u", commit: { message: "m", committer: null } },
        {
          sha: "a",
          html_url: "u",
          commit: { message: "m", committer: { date: "nope" } },
        },
        {
          sha: "ok",
          html_url: "https://x",
          commit: { message: "m", committer: { date: "2026-11-21T00:00:00Z" } },
        },
      ]),
    );
    const commits = commitsOf(await fetchRecentCommits({ fetch: fn }));
    expect(commits.map((c) => c.sha)).toEqual(["ok", "ok"]);
  });

  describe("all repos failing gives unavailable", () => {
    const cases: [string, () => Response | Promise<Response>][] = [
      ["403", () => json({ message: "rate limited" }, 403)],
      ["429", () => json({}, 429)],
      ["non-JSON body", () => new Response("<html>", { status: 200 })],
      ["JSON that is not an array", () => json({ commits: [] })],
      ["array with no valid items", () => json([{ nope: true }])],
      [
        "network error",
        () => {
          throw new TypeError("network down");
        },
      ],
    ];
    for (const [name, handler] of cases) {
      it(name, async () => {
        const { fn } = stub(handler);
        expect(await fetchRecentCommits({ fetch: fn })).toEqual({
          status: "unavailable",
        });
      });
    }

    it("a request that never resolves is aborted at 3 s", async () => {
      vi.useFakeTimers();
      const fn = ((_: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_res, rej) => {
          init?.signal?.addEventListener("abort", () =>
            rej(init.signal?.reason),
          );
        })) as typeof fetch;
      const pending = fetchRecentCommits({ fetch: fn });
      await vi.advanceTimersByTimeAsync(3000);
      expect(await pending).toEqual({ status: "unavailable" });
    });
  });
});

describe("firstLine", () => {
  it("takes the first line", () =>
    expect(firstLine("fix\n\nbody")).toBe("fix"));
  it("truncates to 100 characters with an ellipsis", () => {
    const out = firstLine("a".repeat(300));
    expect([...out]).toHaveLength(100);
    expect(out.endsWith("…")).toBe(true);
  });
  it("leaves a line of exactly max length alone", () =>
    expect(firstLine("a".repeat(100))).toBe("a".repeat(100)));
  it("handles empty and whitespace-only messages", () => {
    expect(firstLine("")).toBe("(no message)");
    expect(firstLine("\n\nbody")).toBe("(no message)");
  });
  it("does not escape HTML", () =>
    expect(firstLine("<b>x</b>")).toBe("<b>x</b>"));
});

describe("relativeTime", () => {
  const now = new Date("2026-11-21T12:00:00Z");
  it("just now", () =>
    expect(relativeTime("2026-11-21T11:59:30Z", now)).toBe("just now"));
  it("minutes", () =>
    expect(relativeTime("2026-11-21T11:55:00Z", now)).toBe("5 minutes ago"));
  it("1 minute singular", () =>
    expect(relativeTime("2026-11-21T11:59:00Z", now)).toBe("1 minute ago"));
  it("hours", () =>
    expect(relativeTime("2026-11-21T09:00:00Z", now)).toBe("3 hours ago"));
  it("1 hour singular", () =>
    expect(relativeTime("2026-11-21T11:00:00Z", now)).toBe("1 hour ago"));
  it("days", () =>
    expect(relativeTime("2026-11-19T12:00:00Z", now)).toBe("2 days ago"));
  it("1 day singular", () =>
    expect(relativeTime("2026-11-20T12:00:00Z", now)).toBe("1 day ago"));
  it("older than a week uses a UTC date", () =>
    expect(relativeTime("2026-11-11T12:00:00Z", now)).toBe("Nov 11, 2026"));
  it("10 days", () =>
    expect(
      relativeTime("2026-11-03T23:30:00Z", new Date("2026-11-13T23:30:00Z")),
    ).toBe("Nov 3, 2026"));
  it("future dates read as just now", () =>
    expect(relativeTime("2026-11-21T12:05:00Z", now)).toBe("just now"));
});
