import { z } from "zod";

import type { Attachment, Prisma } from "@/generated/prisma/client";

import { db } from "@/lib/db";
import { DomainError, InvalidTransitionError, NotFoundError } from "@/lib/errors";
import { getStorage, StorageError, type FileStorage, type StoredFile } from "@/lib/storage";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  ATTACHMENT_KINDS,
  type AttachmentKind,
} from "@/modules/applications/domain/application";
import type {
  CreateApplicationInput,
  ListApplicationsInput,
  ListSort,
  UpdateApplicationInput,
} from "@/modules/applications/schemas";
import { canTransition } from "@/modules/applications/domain/status";
import { columnToDateOnly, dateOnlyToColumn, toColumns } from "@/modules/applications/form-values";
import { STATUS_LABELS } from "@/modules/applications/labels";
import { findOrCreateCompany } from "@/modules/companies/service";

/**
 * La Candidature `id` de l'utilisateur, ou `NotFoundError` : id mal formé (PostgreSQL rejetterait
 * la colonne uuid), inconnu ou appartenant à quelqu'un d'autre. Seul accès « par id » du service,
 * pour que le filtre par utilisateur ne puisse pas être oublié.
 */
export async function findOwnedApplication<Include extends Prisma.ApplicationInclude = Record<string, never>>(
  client: Prisma.TransactionClient,
  userId: string,
  id: string,
  include?: Include,
): Promise<Prisma.ApplicationGetPayload<{ include: Include }>> {
  const application = z.uuid().safeParse(id).success
    ? await client.application.findFirst({ where: { id, userId }, include })
    : null;
  if (!application) throw new NotFoundError("Candidature introuvable.");
  return application as Prisma.ApplicationGetPayload<{ include: Include }>;
}

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
  const stored = await uploadAttachments(storage, input, "La candidature n'a pas été enregistrée");

  const saving = db.$transaction(async (tx) => {
    const company = await findOrCreateCompany(tx, userId, input.companyName);
    return tx.application.create({
      data: {
        ...toColumns(input),
        status: "APPLIED",
        userId,
        companyId: company.id,
        statusChanges: { create: { fromStatus: null, toStatus: "APPLIED" } },
        attachments: { create: stored.map((file) => toAttachmentRow(userId, file)) },
      },
    });
  });
  return saveOrDiscard(saving, storage, stored, "La candidature n'a pas pu être enregistrée");
}

/**
 * Modifie tous les champs d'une Candidature sauf son statut (FR-001-02, BR-001-10).
 * Chaque pièce jointe se garde, se remplace (nouveau fichier) ou se retire (case cochée) ; les anciens
 * fichiers ne sont supprimés du stockage qu'après l'enregistrement. Si cette suppression échoue,
 * la modification reste faite et `leftover` dit quel fichier supprimer à la main.
 */
export async function updateApplication(
  userId: string,
  id: string,
  input: UpdateApplicationInput,
  storage: FileStorage = getStorage(),
) {
  const stored = await uploadAttachments(storage, input, "La modification n'a pas été enregistrée");
  const removals: Record<AttachmentKind, boolean> = {
    CV: input.removeCv,
    COVER_LETTER: input.removeCoverLetter,
  };

  const saving = db.$transaction(async (tx) => {
    const current = await findOwnedApplication(tx, userId, id, { attachments: true });

    const obsolete: StoredFile[] = [];
    for (const kind of ATTACHMENT_KINDS) {
      const incoming = stored.find((file) => file.kind === kind);
      const old = current.attachments.find((attachment) => attachment.kind === kind);
      if (old && (incoming || removals[kind])) {
        await tx.attachment.delete({ where: { id: old.id } });
        obsolete.push(toStoredFile(old));
      }
      if (incoming) {
        await tx.attachment.create({ data: { ...toAttachmentRow(userId, incoming), applicationId: id } });
      }
    }

    const company = await findOrCreateCompany(tx, userId, input.companyName);
    const application = await tx.application.update({
      where: { id },
      data: { ...toColumns(input), companyId: company.id },
    });
    return { application, obsolete };
  });

  const { application, obsolete } = await saveOrDiscard(
    saving,
    storage,
    stored,
    "La modification n'a pas pu être enregistrée",
  );
  return { application, leftover: await discardUploads(storage, obsolete) };
}

/**
 * Change le statut d'une Candidature (FR-001-05) et l'inscrit dans l'historique (FR-001-06),
 * à l'instant de l'enregistrement (BR-001-09).
 */
export async function changeApplicationStatus(userId: string, id: string, to: ApplicationStatus) {
  return db.$transaction(async (tx) => {
    const current = await findOwnedApplication(tx, userId, id);
    // Vérifiée sur le statut en base : couvre l'onglet resté ouvert comme la requête forgée.
    if (!canTransition(current.status, to)) {
      throw new InvalidTransitionError(
        `Le statut a changé entre-temps (la candidature est maintenant ${STATUS_LABELS[current.status]}). Recharge la page.`,
      );
    }
    return tx.application.update({
      where: { id },
      data: {
        status: to,
        statusChanges: { create: { fromStatus: current.status, toStatus: to } },
      },
    });
  });
}

/**
 * Supprime définitivement une Candidature (FR-001-07) : en base d'abord, avec son historique et ses
 * pièces jointes (cascade, BR-001-13), puis ses fichiers au stockage. Son Entreprise reste (BR-001-12).
 * Si les fichiers ne peuvent pas être supprimés, `leftover` dit lesquels supprimer à la main.
 */
export async function deleteApplication(
  userId: string,
  id: string,
  storage: FileStorage = getStorage(),
) {
  const attachments = await db.$transaction(async (tx) => {
    const application = await findOwnedApplication(tx, userId, id, { attachments: true });
    await tx.application.delete({ where: { id } });
    return application.attachments;
  });
  const leftover = await discardUploads(storage, attachments.map(toStoredFile));
  return { leftover };
}

type StoredAttachment = StoredFile & { kind: AttachmentKind };

/** Pièce jointe enregistrée → fichier du stockage (inverse de `toAttachmentRow`). */
function toStoredFile({ fileKey, url, name, size }: Attachment): StoredFile {
  return { key: fileKey, url, name, size };
}

function toAttachmentRow(userId: string, { kind, key, url, name, size }: StoredAttachment) {
  return { userId, kind, fileKey: key, url, name, size };
}

/**
 * Envoie au stockage le CV et la lettre choisis. Si un envoi échoue, les fichiers déjà envoyés
 * sont supprimés et une `DomainError` explique que rien n'a été enregistré (`notSaved`).
 */
async function uploadAttachments(
  storage: FileStorage,
  { cv, coverLetter }: { cv?: File; coverLetter?: File },
  notSaved: string,
): Promise<StoredAttachment[]> {
  const uploads: { kind: AttachmentKind; file: File }[] = [];
  if (cv) uploads.push({ kind: "CV", file: cv });
  if (coverLetter) uploads.push({ kind: "COVER_LETTER", file: coverLetter });

  const stored: StoredAttachment[] = [];
  for (const { kind, file } of uploads) {
    try {
      stored.push({ kind, ...(await storage.upload(file)) });
    } catch (error) {
      if (!(error instanceof StorageError)) throw error;
      const leftover = await discardUploads(storage, stored);
      throw new DomainError(
        "ATTACHMENT_UPLOAD_FAILED",
        `L'envoi ${OF_ATTACHMENT[kind]} a échoué. ${notSaved}${leftover ? `. ${leftover}` : " : réessaie"}.`,
      );
    }
  }
  return stored;
}

/**
 * Attend l'enregistrement. S'il échoue alors que des fichiers ont été envoyés, ces fichiers sont
 * supprimés pour ne pas laisser d'orphelins. Une `DomainError` (ex. Candidature introuvable) garde
 * son message ; toute autre erreur est journalisée et devient `APPLICATION_SAVE_FAILED`.
 */
async function saveOrDiscard<T>(
  saving: Promise<T>,
  storage: FileStorage,
  stored: StoredFile[],
  notSaved: string,
): Promise<T> {
  if (stored.length === 0) return saving;
  return saving.catch(async (error: unknown) => {
    const leftover = await discardUploads(storage, stored);
    if (error instanceof DomainError) throw error;
    console.error("Échec de l'enregistrement d'une Candidature avec pièces jointes :", error);
    throw new DomainError(
      "APPLICATION_SAVE_FAILED",
      `${notSaved}. ${
        leftover ??
        (stored.length === 1
          ? "Le fichier envoyé a été supprimé : réessaie."
          : "Les fichiers envoyés ont été supprimés : réessaie.")
      }`,
    );
  });
}

/**
 * Supprime du stockage des fichiers dont la base ne garde pas (ou plus) la référence.
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
  return findOwnedApplication(db, userId, id, {
    company: true,
    statusChanges: { orderBy: { changedAt: "desc" } },
    attachments: { orderBy: { kind: "asc" } },
    interviews: { orderBy: { scheduledAt: "asc" } },
  });
}

/** Taille d'une page de la liste (FR-001-12, H5 confirmée). */
const PAGE_SIZE = 25;

const ORDER_BY: Record<ListSort, Prisma.ApplicationOrderByWithRelationInput[]> = {
  modifiee: [{ updatedAt: "desc" }],
  candidature: [{ appliedAt: "desc" }, { updatedAt: "desc" }],
  entreprise: [{ company: { normalizedName: "asc" } }, { updatedAt: "desc" }],
};

/**
 * Une page de Candidatures de l'utilisateur (FR-001-08 à 12) : recherche partielle sans casse sur
 * l'Entreprise, le poste et la localisation ; statuts, contrat et source ; tri ; page bornée à la
 * dernière page existante.
 */
export async function listApplications(userId: string, filters: ListApplicationsInput) {
  // Prisma passe le texte tel quel à LIKE : % et _ y seraient des jokers. On les échappe (\ = échappement PostgreSQL).
  const contains = filters.q && {
    contains: filters.q.replace(/[\\%_]/g, "\\$&"),
    mode: "insensitive" as const,
  };
  const where: Prisma.ApplicationWhereInput = {
    userId,
    ...(filters.statuses.length > 0 && { status: { in: filters.statuses } }),
    ...(filters.contractType && { contractType: filters.contractType }),
    ...(filters.source && { source: filters.source }),
    ...(contains && {
      OR: [{ company: { name: contains } }, { jobTitle: contains }, { location: contains }],
    }),
  };

  const total = await db.application.count({ where });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, pages);
  const applications = await db.application.findMany({
    where,
    include: { company: true },
    orderBy: ORDER_BY[filters.sort],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  return { applications, total, page, pages };
}

/** Les `limit` Candidatures modifiées le plus récemment (tableau de bord). */
export async function listRecentApplications(userId: string, limit: number) {
  return db.application.findMany({
    where: { userId },
    include: { company: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
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

/**
 * Chiffres bruts du tableau de bord (SPEC-002) : réponses = plus Postulée ; entretiens = passées
 * par Entretien dans leur historique, même refusées ensuite (BR-002-02) ; dates de candidature
 * (AAAA-MM-JJ) à partir de `appliedSince`, pour les Candidatures par semaine.
 */
export async function getApplicationStats(userId: string, appliedSince: string) {
  const [total, responded, interviewed, recent] = await Promise.all([
    db.application.count({ where: { userId } }),
    db.application.count({ where: { userId, status: { not: "APPLIED" } } }),
    db.application.count({
      where: { userId, statusChanges: { some: { toStatus: "INTERVIEW" } } },
    }),
    db.application.findMany({
      where: { userId, appliedAt: { gte: dateOnlyToColumn(appliedSince) } },
      select: { appliedAt: true },
    }),
  ]);
  return {
    total,
    responded,
    interviewed,
    appliedDates: recent.flatMap(({ appliedAt }) =>
      appliedAt ? [columnToDateOnly(appliedAt)] : [],
    ),
  };
}
