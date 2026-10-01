import { db } from "@/lib/db";
import { DomainError } from "@/lib/errors";
import type { TextGenerator } from "@/lib/ai";
import { buildCoverLetterRequest, letterHeader } from "@/modules/applications/cover-letter-request";
import { findOwnedApplication } from "@/modules/applications/service";
import { getProfile } from "@/modules/profile/service";

// Lettre de motivation personnalisée (SPEC-008) : brouillon généré par l'assistant, enregistré avec la Candidature.

const PROFILE_TEXTS = ["about", "experience", "projects", "skills", "education", "writingSamples"] as const;

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
  const application = await findOwnedApplication(db, userId, applicationId, { company: true });
  if (!application.jobDescription?.trim()) {
    throw new DomainError(
      "COVER_LETTER_NO_POSTING",
      "Colle la description de l'annonce dans la candidature (bouton « Modifier ») : l'assistant en a besoin.",
    );
  }
  const profile = await getProfile(userId);
  if (!profile || PROFILE_TEXTS.every((field) => !profile[field]?.trim())) {
    throw new DomainError(
      "COVER_LETTER_NO_PROFILE",
      "Remplis ton profil (parcours, compétences…) : l'assistant s'appuie dessus pour écrire la lettre.",
    );
  }

  const body = await generator.generate(
    buildCoverLetterRequest(
      {
        companyName: application.company.name,
        jobTitle: application.jobTitle,
        jobDescription: application.jobDescription,
      },
      profile,
      instructions,
    ),
  );
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
