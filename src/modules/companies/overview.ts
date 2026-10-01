import { z } from "zod";

import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/modules/applications/domain/application";

// Vue des Entreprises (page « Entreprises ») : leurs Candidatures, en lecture seule.

export type CompanyOverview = {
  id: string;
  name: string;
  website: string | null;
  total: number;
  counts: Record<ApplicationStatus, number>;
  /** Dernière modification d'une de ses Candidatures, ou `null` si elle n'en a plus. */
  lastActivity: Date | null;
};

/** Les Entreprises de l'utilisateur, la plus récemment active d'abord, puis sans Candidature (A → Z). */
export async function listCompanyOverviews(userId: string): Promise<CompanyOverview[]> {
  const companies = await db.company.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      website: true,
      applications: { select: { status: true, updatedAt: true } },
    },
    orderBy: { normalizedName: "asc" },
  });

  return companies
    .map(({ id, name, website, applications }) => {
      const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<ApplicationStatus, number>;
      for (const { status } of applications) counts[status]++;
      const lastActivity = applications.reduce<Date | null>(
        (latest, { updatedAt }) => (latest && latest > updatedAt ? latest : updatedAt),
        null,
      );
      return { id, name, website, total: applications.length, counts, lastActivity };
    })
    .sort((a, b) => (b.lastActivity?.getTime() ?? 0) - (a.lastActivity?.getTime() ?? 0));
}

/** La fiche d'une Entreprise : ses Candidatures (la plus récente d'abord) et leurs Entretiens. */
export async function getCompanyOverview(userId: string, id: string) {
  const company = z.uuid().safeParse(id).success
    ? await db.company.findFirst({
        where: { id, userId },
        include: {
          applications: {
            orderBy: { updatedAt: "desc" },
            select: {
              id: true,
              jobTitle: true,
              status: true,
              appliedAt: true,
              updatedAt: true,
              interviews: {
                orderBy: { scheduledAt: "asc" },
                select: { id: true, scheduledAt: true, type: true, format: true, location: true },
              },
            },
          },
        },
      })
    : null;
  if (!company) throw new NotFoundError("Entreprise introuvable.");
  return company;
}
