import { AiError, type TextGenerator } from "@/lib/ai";
import { db } from "@/lib/db";
import { loadAssistantInputs } from "@/modules/applications/assistant-inputs";
import {
  buildInterviewPrepRequest,
  interviewPrepSchema,
  parseInterviewPrep,
  type InterviewPrep,
} from "@/modules/applications/interview-prep-request";
import { findOwnedInterview } from "@/modules/applications/interviews";

// Fiche de préparation d'un Entretien (SPEC-009, A) : demandée à l'assistant, vérifiée, enregistrée.

/**
 * Prépare la fiche de l'Entretien `interviewId` (FR-009-01, 02) et l'enregistre à côté de la
 * Préparation de l'utilisateur (FR-009-03). Une réponse mal formée ne modifie rien (BR-009-03).
 */
export async function prepareInterview(
  userId: string,
  interviewId: string,
  generator: TextGenerator,
): Promise<InterviewPrep> {
  const interview = await findOwnedInterview(db, userId, interviewId);
  const { posting, profile } = await loadAssistantInputs(userId, interview.applicationId);
  const prep = parseInterviewPrep(await generator.generate(buildInterviewPrepRequest(interview, posting, profile)));
  if (!prep) {
    throw new AiError("L'assistant IA n'a pas répondu dans le format attendu. Refais la fiche.");
  }
  await db.interview.update({ where: { id: interviewId }, data: { aiPreparation: prep } });
  return prep;
}

/** La fiche enregistrée (colonne JSON), ou `null` si absente ou d'un format dépassé. */
export function readInterviewPrep(stored: unknown): InterviewPrep | null {
  const result = interviewPrepSchema.safeParse(stored);
  return result.success ? result.data : null;
}
