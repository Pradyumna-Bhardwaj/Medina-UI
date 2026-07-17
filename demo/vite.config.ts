import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Aliases the package name straight to the library's source (not dist/), so the
// demo always reflects live source with HMR and never needs a library build step.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "ai-agent/styles.css": resolve(__dirname, "../src/styles/index.css"),
      "ai-agent": resolve(__dirname, "../src/index.ts"),
    },
  },
});
