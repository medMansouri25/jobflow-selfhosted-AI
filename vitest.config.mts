import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Le nom du fichier décide du projet de test :
//   *.test.ts              → unit        (Node, en parallèle)
//   *.test.tsx             → component   (jsdom, en parallèle)
//   *.integration.test.ts  → integration (Node, en série : une seule base jobflow_test partagée)
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.integration.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "component",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          include: ["src/**/*.integration.test.ts"],
          fileParallelism: false,
        },
      },
    ],
  },
});
