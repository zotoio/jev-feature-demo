import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { typesafeProxyPlugin } from "./vite-plugin-typesafe-proxy.js";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(packageRoot, "../..");
const jevDemoRoot = path.resolve(packageRoot, "../jev-demo");

export default defineConfig({
  plugins: [react(), typesafeProxyPlugin()],
  define: {
    // Prevent bare `process` ReferenceError if a dep touches process.env in the browser.
    "process.env.TYPESAFE_API_KEY": "undefined",
    "process.env.TYPESAFE_BASE_URL": "undefined",
  },
  envDir: workspaceRoot,
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
