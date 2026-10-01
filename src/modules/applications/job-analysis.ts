import type { TextGenerator } from "@/lib/ai";
import { AiError } from "@/lib/ai";
import { db } from "@/lib/db";
import { loadAssistantInputs } from "@/modules/applications/assistant-inputs";
import {
  buildJobAnalysisRequest,
  jobAnalysisSchema,
  parseJobAnalysis,
  type JobAnalysis,
} from "@/modules/applications/job-analysis-request";

// Analyse d'une Annonce (SPEC-007) : demandée à l'assistant, vérifiée, enregistrée avec la Candidature.

/**
 * Analyse l'Annonce au regard du Profil (FR-007-01) et l'enregistre en remplaçant la précédente
 * (BR-007-05). Une réponse mal formée est refusée : rien n'est modifié (BR-007-04).
 */
export async function analyzeJobPosting(
  userId: string,
  applicationId: string,
  generator: TextGenerator,
): Promise<JobAnalysis> {
  const { posting, profile } = await loadAssistantInputs(userId, applicationId);
  const analysis = parseJobAnalysis(await generator.generate(buildJobAnalysisRequest(posting, profile)));
  if (!analysis) {
    throw new AiError("L'assistant IA n'a pas répondu dans le format attendu. Relance l'analyse.");
  }
  await db.application.update({ where: { id: applicationId }, data: { jobAnalysis: analysis } });
  return analysis;
}

/** L'analyse enregistrée (colonne JSON), ou `null` si absente ou d'un format dépassé. */
export function readJobAnalysis(stored: unknown): JobAnalysis | null {
  const result = jobAnalysisSchema.safeParse(stored);
  return result.success ? result.data : null;
}
