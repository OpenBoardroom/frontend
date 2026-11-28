import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("ballot", "routes/ballot.tsx"),
  route("explore", "routes/explore.tsx"),
  route("season", "routes/season-redirect.tsx"),
] satisfies RouteConfig;
