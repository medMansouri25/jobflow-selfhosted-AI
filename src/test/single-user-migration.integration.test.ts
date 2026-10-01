import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import { createTestUser } from "@/test/database";

// Rejoue le SQL de la migration : la base de production démarre vide (ADR 0007) et doit avoir son utilisateur unique.
const sql = readFileSync(
  path.join(process.cwd(), "prisma/migrations/20260930220000_single_user/migration.sql"),
  "utf8",
);

describe("migration single_user", () => {
  it("crée l'utilisateur unique dans une base sans utilisateur", async () => {
    await db.$executeRawUnsafe(sql);

    expect(await db.user.count()).toBe(1);
  });

  it("ne crée pas de second utilisateur si elle est rejouée", async () => {
    await db.$executeRawUnsafe(sql);
    await db.$executeRawUnsafe(sql);

    expect(await db.user.count()).toBe(1);
  });

  it("garde l'utilisateur existant", async () => {
    const existing = await createTestUser();

    await db.$executeRawUnsafe(sql);

    expect(await db.user.findMany({ select: { id: true } })).toEqual([{ id: existing.id }]);
  });
});
