import { expect, test } from "vitest";
import routes from "../app/routes";

test("the app has exactly one index route, served by routes/home.tsx", () => {
  const indexRoutes = routes.filter((route) => route.index === true);
  expect(indexRoutes).toHaveLength(1);
  expect(indexRoutes[0]?.file).toBe("routes/home.tsx");
});
