import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("season", "routes/season.tsx"),
  route("explore", "routes/explore.tsx"),
] satisfies RouteConfig;
