import { z } from "zod";

import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/modules/applications/domain/application";
import type { CreateApplicationInput } from "@/modules/applications/schemas";
import { findOrCreateCompany } from "@/modules/companies/service";

/** Crée une Candidature, toujours Postulée, son Entreprise si besoin et la première entrée d'historique. */
export async function createApplication(
  userId: string,
  input: CreateApplicationInput,
) {
  const { companyName, appliedAt, ...fields } = input;
  const hasSalary = fields.salaryMin !== undefined || fields.salaryMax !== undefined;

  return db.$transaction(async (tx) => {
    const company = await findOrCreateCompany(tx, userId, companyName);
    return tx.application.create({
      data: {
        ...fields,
        salaryCurrency: hasSalary ? fields.salaryCurrency : null,
        status: "APPLIED",
        appliedAt: new Date(`${appliedAt}T00:00:00Z`),
        userId,
        companyId: company.id,
        statusChanges: { create: { fromStatus: null, toStatus: "APPLIED" } },
      },
    });
  });
}

export async function getApplication(userId: string, id: string) {
  // Un id mal formé ferait échouer PostgreSQL (colonne uuid) : c'est simplement une Candidature introuvable.
  if (!z.uuid().safeParse(id).success) throw new NotFoundError("Candidature introuvable.");
  const application = await db.application.findFirst({
    where: { id, userId },
    include: {
      company: true,
      statusChanges: { orderBy: { changedAt: "desc" } },
    },
  });
  if (!application) throw new NotFoundError("Candidature introuvable.");
  return application;
}

/** Candidatures de l'utilisateur, les plus récemment modifiées en premier. */
export async function listApplications(userId: string) {
  // TODO(T1.9) : recherche, filtres (actives par défaut), tri et pagination.
  return db.application.findMany({
    where: { userId },
    include: { company: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function countApplicationsByStatus(
  userId: string,
): Promise<Record<ApplicationStatus, number>> {
  const groups = await db.application.groupBy({
    by: ["status"],
    where: { userId },
    _count: { _all: true },
  });
  const counts = Object.fromEntries(
    APPLICATION_STATUSES.map((status) => [status, 0]),
  ) as Record<ApplicationStatus, number>;
  for (const group of groups) counts[group.status] = group._count._all;
  return counts;
}
