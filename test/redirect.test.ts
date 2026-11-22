import { expect, test } from "vitest";
import { canonicalRedirect, REDIRECT_HOSTS } from "../app/server/redirect";

test.each(REDIRECT_HOSTS)("%s redirects with path and query", (host) => {
  const res = canonicalRedirect(new Request(`https://${host}/a%20b?x=1&y=2`));
  expect(res?.status).toBe(301);
  expect(res?.headers.get("location")).toBe(
    "https://openboardroom.org/a%20b?x=1&y=2",
  );
});

test("host matching ignores case, port, and a trailing dot", () => {
  for (const h of ["BRDRMR.ORG", "brdrmr.org:443", "brdrmr.org."]) {
    const req = new Request("https://placeholder/", { headers: { host: h } });
    expect(canonicalRedirect(req)?.headers.get("location")).toBe(
      "https://openboardroom.org/",
    );
  }
});

test("host comes from the request URL when no Host header is set", () => {
  const res = canonicalRedirect(new Request("https://BRDRMR.COM/x"));
  expect(res?.status).toBe(301);
  expect(res?.headers.get("location")).toBe("https://openboardroom.org/x");
});

test("redirect headers are mutable", () => {
  const res = canonicalRedirect(new Request("https://brdrmr.com/"));
  expect(() => res?.headers.set("cache-control", "no-store")).not.toThrow();
});

test.each([
  "openboardroom.org",
  "localhost:5173",
  "openboardroom-frontend.example.workers.dev",
])("%s is served, not redirected", (host) => {
  expect(canonicalRedirect(new Request(`https://${host}/`))).toBeNull();
});

test("REDIRECT_HOSTS is exactly the spec's seven", () => {
  expect([...REDIRECT_HOSTS].sort()).toEqual([
    "brdrmr.com",
    "brdrmr.org",
    "openboardroom.io",
    "www.brdrmr.com",
    "www.brdrmr.org",
    "www.openboardroom.io",
    "www.openboardroom.org",
  ]);
});
