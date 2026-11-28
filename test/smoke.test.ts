import { expect, test } from "vitest";
import routes from "../app/routes";

test("the app has exactly one index route, served by routes/home.tsx", () => {
  const indexRoutes = routes.filter((route) => route.index === true);
  expect(indexRoutes).toHaveLength(1);
  expect(indexRoutes[0]?.file).toBe("routes/home.tsx");
});

test("This season and Explore have their own routes", () => {
  expect(routes).toHaveLength(3);
  const byPath = Object.fromEntries(routes.map((r) => [r.path, r.file]));
  expect(byPath.season).toBe("routes/season.tsx");
  expect(byPath.explore).toBe("routes/explore.tsx");
});
