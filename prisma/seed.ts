import "dotenv/config";

import { createPrismaClient } from "../src/lib/db-client";

// Crée l'utilisateur unique s'il n'existe pas encore (idempotent).
async function main() {
  const db = createPrismaClient(process.env.DATABASE_URL ?? "");
  try {
    const existing = await db.user.findFirst();
    if (existing) {
      console.log(`Utilisateur déjà présent : ${existing.id}`);
      return;
    }
    const user = await db.user.create({ data: {} });
    console.log(`Utilisateur créé : ${user.id}`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
