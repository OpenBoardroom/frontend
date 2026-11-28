import { expect, test } from "vitest";
import routes from "../app/routes";

test("the app has exactly one index route, served by routes/home.tsx", () => {
  const indexRoutes = routes.filter((route) => route.index === true);
  expect(indexRoutes).toHaveLength(1);
  expect(indexRoutes[0]?.file).toBe("routes/home.tsx");
});

test("Ballot, Explore, and the old /season address have routes", () => {
  expect(routes).toHaveLength(4);
  const byPath = Object.fromEntries(routes.map((r) => [r.path, r.file]));
  expect(byPath.ballot).toBe("routes/ballot.tsx");
  // /season was the view's first address; it redirects to /ballot.
  expect(byPath.season).toBe("routes/season-redirect.tsx");
  expect(byPath.explore).toBe("routes/explore.tsx");
});
