import type { TextGenerator } from "@/lib/ai";
import { db } from "@/lib/db";
import { loadAssistantInputs } from "@/modules/applications/assistant-inputs";
import { buildCoverLetterRequest, letterHeader } from "@/modules/applications/cover-letter-request";
import { findOwnedApplication } from "@/modules/applications/service";

// Lettre de motivation personnalisée (SPEC-008) : brouillon généré par l'assistant, enregistré avec la Candidature.

/**
 * Génère le brouillon (FR-008-01), le fait précéder de l'en-tête (FR-008-06) et l'enregistre,
 * en remplaçant le précédent (BR-008-06). Si l'assistant échoue, rien n'est modifié (BR-008-07).
 */
export async function generateCoverLetter(
  userId: string,
  applicationId: string,
  instructions: string | undefined,
  generator: TextGenerator,
): Promise<string> {
  const { posting, profile } = await loadAssistantInputs(userId, applicationId);
  const body = await generator.generate(buildCoverLetterRequest(posting, profile, instructions));
  const header = letterHeader(profile);
  const draft = header ? `${header}\n\n${body}` : body;

  await db.application.update({ where: { id: applicationId }, data: { coverLetterDraft: draft } });
  return draft;
}

/** Enregistre la version modifiée du brouillon (FR-008-03) ; un brouillon vidé est effacé. */
export async function saveCoverLetterDraft(userId: string, applicationId: string, draft: string) {
  await findOwnedApplication(db, userId, applicationId);
  await db.application.update({
    where: { id: applicationId },
    data: { coverLetterDraft: draft.trim() ? draft : null },
  });
}
