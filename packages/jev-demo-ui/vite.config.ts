import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { typesafeProxyPlugin } from "./vite-plugin-typesafe-proxy.js";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(packageRoot, "../..");
const jevDemoRoot = path.resolve(packageRoot, "../jev-demo");

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [react(), typesafeProxyPlugin()],
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
