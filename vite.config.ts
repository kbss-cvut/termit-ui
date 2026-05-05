/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr({
      include: "**/*.svg?react",
    }),
  ],
  base: "./",
  build: {
    outDir: "build", // CRA's default build output
  },
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    coverage: {
      reporter: ["text", "html"],
      exclude: ["node_modules/", "src/setupTests.ts"],
    },
    server: {
      deps: {
        inline: ["react-stomp-hooks", "popper.js"],
      },
    },
  },
});
