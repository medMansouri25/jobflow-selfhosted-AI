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
      applications: { select: { status: true, updatedAt: true } },
    },
    orderBy: { normalizedName: "asc" },
  });

  return companies
    .map(({ id, name, applications }) => {
      const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<ApplicationStatus, number>;
      for (const { status } of applications) counts[status]++;
      const lastActivity = applications.reduce<Date | null>(
        (latest, { updatedAt }) => (latest && latest > updatedAt ? latest : updatedAt),
        null,
      );
      return { id, name, total: applications.length, counts, lastActivity };
    })
    .sort((a, b) => (b.lastActivity?.getTime() ?? 0) - (a.lastActivity?.getTime() ?? 0));
}

/** La fiche d'une Entreprise : ses Candidatures (la plus récente d'abord) et tous leurs Entretiens, par date. */
export async function getCompanyOverview(userId: string, id: string) {
  const company = z.uuid().safeParse(id).success
    ? await db.company.findFirst({
        where: { id, userId },
        select: {
          id: true,
          name: true,
          applications: {
            orderBy: { updatedAt: "desc" },
            select: { id: true, jobTitle: true, status: true, appliedAt: true },
          },
        },
      })
    : null;
  if (!company) throw new NotFoundError("Entreprise introuvable.");

  const interviews = await db.interview.findMany({
    where: { userId, application: { companyId: id } },
    orderBy: [{ scheduledAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      scheduledAt: true,
      type: true,
      format: true,
      location: true,
      application: { select: { id: true, jobTitle: true, company: { select: { name: true } } } },
    },
  });
  return { ...company, interviews };
}

export type CompanyDetail = Awaited<ReturnType<typeof getCompanyOverview>>;
