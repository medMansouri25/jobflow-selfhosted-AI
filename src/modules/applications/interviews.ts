import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";

import { db } from "@/lib/db";
import { DomainError, NotFoundError } from "@/lib/errors";
import { isDefinitive } from "@/modules/applications/domain/status";
import type { InterviewInput } from "@/modules/applications/interview-schemas";
import { findOwnedApplication } from "@/modules/applications/service";

// Entretiens (rendez-vous) d'une Candidature (SPEC-003). Ils vivent dans le module des Candidatures :
// en ajouter un fait avancer le statut, dans la même transaction (BR-003-01).

/** Colonnes d'un Entretien : chaque champ est écrit, un champ vidé devient `null`. */
function toColumns(input: InterviewInput) {
  return {
    scheduledAt: input.scheduledAt,
    type: input.type,
    format: input.format,
    location: input.location ?? null,
    interviewer: input.interviewer ?? null,
    preparation: input.preparation ?? null,
    debrief: input.debrief ?? null,
  };
}

/** L'Entretien `id` de l'utilisateur, ou `NotFoundError` (même règle que `findOwnedApplication`). */
async function findOwnedInterview(client: Prisma.TransactionClient, userId: string, id: string) {
  const interview = z.uuid().safeParse(id).success
    ? await client.interview.findFirst({ where: { id, userId } })
    : null;
  if (!interview) throw new NotFoundError("Entretien introuvable.");
  return interview;
}

/**
 * Ajoute un Entretien (FR-003-01). Une Candidature Postulée passe en Entretien avec son historique
 * (FR-003-05) ; une Candidature Refusée n'en accepte plus (BR-003-03).
 */
export async function addInterview(userId: string, applicationId: string, input: InterviewInput) {
  return db.$transaction(async (tx) => {
    const application = await findOwnedApplication(tx, userId, applicationId);
    if (isDefinitive(application.status)) {
      throw new DomainError(
        "INTERVIEW_ON_DEFINITIVE",
        "Cette candidature est refusée : on ne peut plus y ajouter d'entretien.",
      );
    }
    if (application.status === "APPLIED") {
      await tx.application.update({
        where: { id: applicationId },
        data: {
          status: "INTERVIEW",
          statusChanges: { create: { fromStatus: "APPLIED", toStatus: "INTERVIEW" } },
        },
      });
    }
    return tx.interview.create({ data: { userId, applicationId, ...toColumns(input) } });
  });
}

/** Modifie un Entretien (FR-003-02) ; le statut de la Candidature ne bouge pas (BR-003-04). */
export async function updateInterview(userId: string, id: string, input: InterviewInput) {
  return db.$transaction(async (tx) => {
    await findOwnedInterview(tx, userId, id);
    return tx.interview.update({ where: { id }, data: toColumns(input) });
  });
}

/** Supprime un Entretien (FR-003-03) ; le statut de la Candidature ne bouge pas (BR-003-04). */
export async function deleteInterview(userId: string, id: string) {
  return db.$transaction(async (tx) => {
    const interview = await findOwnedInterview(tx, userId, id);
    await tx.interview.delete({ where: { id } });
    return { applicationId: interview.applicationId };
  });
}
