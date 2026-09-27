import { describe, expect, it } from "vitest";

import { parseEnv } from "@/lib/env";

describe("variables d'environnement", () => {
  it("accepte une URL PostgreSQL valide", () => {
    const env = parseEnv({
      DATABASE_URL: "postgresql://jobflow:jobflow@localhost:5432/jobflow_dev",
    });

    expect(env.DATABASE_URL).toBe(
      "postgresql://jobflow:jobflow@localhost:5432/jobflow_dev",
    );
  });

  it("refuse de démarrer sans DATABASE_URL", () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/);
  });

  it("refuse une DATABASE_URL qui n'est pas une URL PostgreSQL", () => {
    expect(() => parseEnv({ DATABASE_URL: "mysql://localhost/app" })).toThrow(
      /DATABASE_URL/,
    );
  });

  it("expose UPLOADTHING_TOKEN, facultatif : les tests et la CI n'appellent jamais UploadThing", () => {
    const url = "postgresql://jobflow:jobflow@localhost:5432/jobflow_dev";

    expect(parseEnv({ DATABASE_URL: url }).UPLOADTHING_TOKEN).toBeUndefined();
    expect(parseEnv({ DATABASE_URL: url, UPLOADTHING_TOKEN: "jeton" }).UPLOADTHING_TOKEN).toBe(
      "jeton",
    );
  });
});
