import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

/**
 * Static SPA build for the WordPress-native deployment.
 * Reuses the same src/ modules as the Next.js app (config, scoring,
 * personalization, components). Output is a fully static bundle that runs
 * in the browser and posts to the WordPress REST API — no Node server needed.
 *
 * `base: "./"` keeps asset paths relative so the bundle works when served
 * from /wp-content/uploads/sis-app/ on bienesdar.org.
 */
export default defineConfig({
  root: resolve(__dirname, "spa"),
  base: "./",
  plugins: [react()],
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  build: {
    outDir: resolve(__dirname, "spa-dist"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
  },
});
