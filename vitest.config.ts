import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["app/server/**", "app/content/**", "app/lib/**"],
      thresholds: { lines: 80, branches: 80 },
    },
  },
});
