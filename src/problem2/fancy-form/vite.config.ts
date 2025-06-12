import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { configDefaults } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        ...configDefaults.coverage.exclude,
        "**/*.d.ts",
        "**/types/**",
        "**/*.config.*",
        "**/test/**",
      ],
    },
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
