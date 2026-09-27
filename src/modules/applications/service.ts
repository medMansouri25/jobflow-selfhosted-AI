import { z } from "zod";

import { db } from "@/lib/db";
import { DomainError, NotFoundError } from "@/lib/errors";
import { getStorage, StorageError, type FileStorage, type StoredFile } from "@/lib/storage";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type AttachmentKind,
} from "@/modules/applications/domain/application";
import type { CreateApplicationInput } from "@/modules/applications/schemas";
import { findOrCreateCompany } from "@/modules/companies/service";

/** « L'envoi du CV… », « L'envoi de la lettre de motivation… ». */
const OF_ATTACHMENT: Record<AttachmentKind, string> = {
  CV: "du CV",
  COVER_LETTER: "de la lettre de motivation",
};

/**
 * Crée une Candidature, toujours Postulée, son Entreprise si besoin, la première entrée d'historique
 * et ses pièces jointes. Les fichiers partent d'abord au stockage ; la base n'en garde que la référence.
 */
export async function createApplication(
  userId: string,
  input: CreateApplicationInput,
  storage: FileStorage = getStorage(),
) {
  const { companyName, appliedAt, cv, coverLetter, ...fields } = input;
  const hasSalary = fields.salaryMin !== undefined || fields.salaryMax !== undefined;

  const uploads: { kind: AttachmentKind; file: File }[] = [];
  if (cv) uploads.push({ kind: "CV", file: cv });
  if (coverLetter) uploads.push({ kind: "COVER_LETTER", file: coverLetter });
  const stored: (StoredFile & { kind: AttachmentKind })[] = [];
  for (const { kind, file } of uploads) {
    try {
      stored.push({ kind, ...(await storage.upload(file)) });
    } catch (error) {
      if (!(error instanceof StorageError)) throw error;
      const leftover = await discardUploads(storage, stored);
      throw new DomainError(
        "ATTACHMENT_UPLOAD_FAILED",
        `L'envoi ${OF_ATTACHMENT[kind]} a échoué. La candidature n'a pas été enregistrée${
          leftover ? `. ${leftover}` : " : réessaie"
        }.`,
      );
    }
  }

  const saving = db.$transaction(async (tx) => {
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
        attachments: {
          create: stored.map(({ kind, key, url, name, size }) => ({
            userId,
            kind,
            fileKey: key,
            url,
            name,
            size,
          })),
        },
      },
    });
  });
  if (stored.length === 0) return saving;

  // Fichiers déjà envoyés mais Candidature non enregistrée : on les supprime pour ne pas laisser d'orphelins.
  return saving.catch(async () => {
    const leftover = await discardUploads(storage, stored);
    throw new DomainError(
      "APPLICATION_SAVE_FAILED",
      `La candidature n'a pas pu être enregistrée. ${
        leftover ??
        (stored.length === 1
          ? "Le fichier envoyé a été supprimé : réessaie."
          : "Les fichiers envoyés ont été supprimés : réessaie.")
      }`,
    );
  });
}

/**
 * Supprime des fichiers envoyés pour une Candidature qui ne sera pas enregistrée.
 * Si la suppression échoue aussi, renvoie la phrase qui dit à l'utilisateur quoi nettoyer
 * (et le journalise) ; sinon `null`.
 */
async function discardUploads(storage: FileStorage, stored: StoredFile[]): Promise<string | null> {
  if (stored.length === 0) return null;
  try {
    await storage.remove(stored.map((file) => file.key));
    return null;
  } catch (error) {
    console.error("Pièces jointes orphelines sur UploadThing :", stored.map((f) => f.key), error);
    const names = stored.map((file) => `« ${file.name} »`).join(", ");
    return stored.length === 1
      ? `Le fichier ${names} est resté sur UploadThing : supprime-le depuis ton tableau de bord UploadThing.`
      : `Les fichiers ${names} sont restés sur UploadThing : supprime-les depuis ton tableau de bord UploadThing.`;
  }
}

export async function getApplication(userId: string, id: string) {
  // Un id mal formé ferait échouer PostgreSQL (colonne uuid) : c'est simplement une Candidature introuvable.
  if (!z.uuid().safeParse(id).success) throw new NotFoundError("Candidature introuvable.");
  const application = await db.application.findFirst({
    where: { id, userId },
    include: {
      company: true,
      statusChanges: { orderBy: { changedAt: "desc" } },
      attachments: { orderBy: { kind: "asc" } },
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
