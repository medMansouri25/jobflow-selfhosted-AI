import type { Prisma } from "@/generated/prisma/client";
import {
  cleanCompanyName,
  normalizeCompanyName,
} from "@/modules/companies/domain/company-name";

/**
 * Retourne l'Entreprise de ce nom (sans tenir compte de la casse), en la créant si besoin.
 * Reçoit la transaction de l'appelant : la création d'une Candidature reste atomique.
 */
export async function findOrCreateCompany(
  tx: Prisma.TransactionClient,
  userId: string,
  name: string,
) {
  const normalizedName = normalizeCompanyName(name);
  return tx.company.upsert({
    where: { userId_normalizedName: { userId, normalizedName } },
    update: {},
    create: { userId, name: cleanCompanyName(name), normalizedName },
  });
}
