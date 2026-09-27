import "dotenv/config";

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
          setupFiles: ["./vitest.setup.component.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          include: ["src/**/*.integration.test.ts"],
          fileParallelism: false,
          // Les tests d'intégration visent toujours la base jobflow_test, jamais jobflow_dev.
          env: { DATABASE_URL: process.env.TEST_DATABASE_URL ?? "" },
          globalSetup: ["./vitest.global-setup.integration.ts"],
          setupFiles: ["./vitest.setup.integration.ts"],
        },
      },
    ],
  },
});
