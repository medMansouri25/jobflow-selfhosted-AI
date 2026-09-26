import { afterAll, beforeEach } from "vitest";

import { db } from "@/lib/db";
import { resetDatabase } from "@/test/database";

// Chaque test part d'une base vide.
beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await db.$disconnect();
});
