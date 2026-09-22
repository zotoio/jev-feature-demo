import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/live/**"],
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  esbuild: {
    target: "node20",
  },
});
