import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const jevDemoRoot = path.resolve(packageRoot, "../jev-demo");

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@zotoio/jev-demo": path.join(jevDemoRoot, "lib/JevClient.ts"),
    },
  },
});
