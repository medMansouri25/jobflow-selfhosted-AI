import { db } from "@/lib/db";

/** Vide toutes les tables de la base de test (jamais utilisé hors des tests). */
export async function resetDatabase() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.includes("jobflow_test")) {
    throw new Error(`resetDatabase refusé : la base n'est pas jobflow_test (${url})`);
  }
  await db.$executeRawUnsafe(
    'TRUNCATE TABLE "ApplicationStatusChange", "Application", "Company", "User" CASCADE',
  );
}

export async function createTestUser() {
  return db.user.create({ data: {} });
}
