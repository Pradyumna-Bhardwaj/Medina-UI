/// <reference types="vitest/config" />
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import dts from "vite-plugin-dts";

// Nothing in src/index.ts imports styles/index.css (it's an opt-in `ai-agent/styles.css`
// import for consumers, not bundled automatically), so it never enters Vite's module
// graph and would otherwise never be emitted. It needs no processing (plain CSS, no
// preprocessor/modules), so a plain copy after the main build is enough.
function copyStylesheet(): Plugin {
  return {
    name: "copy-stylesheet",
    closeBundle() {
      copyFileSync(resolve(__dirname, "src/styles/index.css"), resolve(__dirname, "dist/ai-agent.css"));
    },
  };
}

// Node 22+ ships an experimental native `localStorage`/`sessionStorage` global
// (tied to --localstorage-file) that shadows jsdom's own Storage implementation
// with a broken stub when no backing file is configured. Disabling it in the
// test workers lets jsdom's real, per-window implementation win. Guarded by
// version so this is a no-op (not a crash) on Node releases that predate the flag.
function nodeSupportsWebStorageFlag(): boolean {
  const [major] = process.versions.node.split(".").map(Number);
  return major >= 23;
}

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: "src",
      include: ["src"],
      tsconfigPath: "./tsconfig.json",
      insertTypesEntry: true,
    }),
    copyStylesheet(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AiAgent",
      fileName: "ai-agent",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    pool: "forks",
    poolOptions: {
      forks: {
        execArgv: nodeSupportsWebStorageFlag() ? ["--no-experimental-webstorage"] : [],
      },
    },
  },
});
