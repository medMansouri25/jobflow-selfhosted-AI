import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
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

/**
 * Noms des Entreprises de l'utilisateur, de A à Z (sans casse) : suggestions du champ Entreprise
 * (FR-001-04). Mis en cache le temps d'une requête : le layout et la page le demandent tous les deux.
 */
export const listCompanyNames = cache(async (userId: string): Promise<string[]> => {
  const companies = await db.company.findMany({
    where: { userId },
    select: { name: true },
    orderBy: { normalizedName: "asc" },
  });
  return companies.map((company) => company.name);
});

