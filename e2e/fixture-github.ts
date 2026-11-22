// Offline stand-in for api.github.com, so e2e runs never reach the real GitHub.
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

export const HOSTILE_MESSAGE = "<img src=x onerror=alert(1)>";

function load(repo: "frontend" | "backend"): unknown[] {
  const path = fileURLToPath(
    new URL(`../test/fixtures/github-commits-${repo}.json`, import.meta.url),
  );
  return JSON.parse(readFileSync(path, "utf8")) as unknown[];
}

function body(repo: "frontend" | "backend"): string {
  const commits = load(repo) as { commit: { message: string } }[];
  // Only the message changes; shas and URLs stay valid so the commit is accepted.
  if (repo === "frontend" && commits[0]) {
    commits[0].commit.message = HOSTILE_MESSAGE;
  }
  return JSON.stringify(commits);
}

const routes: Record<string, string> = {
  "/repos/OpenBoardroom/frontend/commits": body("frontend"),
  "/repos/OpenBoardroom/backend/commits": body("backend"),
};

createServer((req, res) => {
  const path = new URL(req.url ?? "/", "http://localhost").pathname;
  if (path === "/health") {
    res.end("ok");
    return;
  }
  const json = routes[path];
  if (json === undefined) {
    res.statusCode = 404;
    res.end("not found");
    return;
  }
  res.setHeader("content-type", "application/json");
  res.end(json);
}).listen(8788);
