// Fiche de préparation d'un Entretien par l'assistant (SPEC-009, A), en TypeScript pur.

import { z } from "zod";

import type { GenerationRequest } from "@/lib/ai";
import {
  type AssistantPosting,
  type AssistantProfile,
  DATA_RULE,
  parseAssistantJson,
  postingBlock,
  profileBlock,
} from "@/modules/applications/assistant-data";
import type { InterviewFormat, InterviewType } from "@/modules/applications/domain/application";
import { INTERVIEW_FORMAT_LABELS, INTERVIEW_TYPE_LABELS } from "@/modules/applications/labels";

const text = z.string().trim().min(1).max(600);

/** Fiche attendue (FR-009-02) ; toute autre forme est refusée (BR-009-03). */
export const interviewPrepSchema = z.object({
  questions: z
    .array(z.object({ question: text, hints: z.array(text).max(6) }))
    .min(1)
    .max(10),
  highlights: z.array(text).max(10),
  questionsToAsk: z.array(text).max(10),
});

export type InterviewPrep = z.infer<typeof interviewPrepSchema>;

const SYSTEM = `Tu prépares un candidat à un entretien d'embauche précis.

Réponds uniquement par un objet JSON, en français, de cette forme exacte :
{
  "questions": [{ "question": "question probable", "hints": ["piste de réponse tirée du profil"] }],
  "highlights": ["point du profil à mettre en avant"],
  "questionsToAsk": ["question à poser au recruteur"]
}

Règles :
- Adapte les questions au type d'entretien (RH : parcours, motivation, savoir-être ; technique : compétences et cas concrets de l'annonce ; manager : organisation, autonomie, travail en équipe ; final : projet, prétentions, disponibilité).
- 5 à 8 questions, 2 à 4 pistes chacune ; 3 à 6 points à mettre en avant et questions à poser.
- Les pistes sont des idées courtes tirées du profil, pas une réponse rédigée à réciter. Si le profil ne permet pas de répondre, dis-le dans la piste (« rien dans ton profil : prépare un exemple »).
- N'invente rien : seules l'annonce et le profil comptent ; aucune information extérieure sur l'entreprise.
- ${DATA_RULE}`;

/** Demande de fiche : type et format de l'Entretien, l'Annonce, le Profil sans e-mail ni téléphone (BR-009-01). */
export function buildInterviewPrepRequest(
  interview: { type: InterviewType; format: InterviewFormat },
  posting: AssistantPosting,
  profile: AssistantProfile,
): GenerationRequest {
  const prompt = [
    `Prépare la fiche pour cet entretien : Entretien ${INTERVIEW_TYPE_LABELS[interview.type].toLowerCase()}, ${INTERVIEW_FORMAT_LABELS[interview.format].toLowerCase()}.`,
    "",
    postingBlock(posting),
    "",
    profileBlock(profile),
  ].join("\n");
  return { system: SYSTEM, prompt, json: true };
}

/** La fiche lue dans la réponse, ou `null` si elle n'a pas la forme attendue. */
export function parseInterviewPrep(answer: string): InterviewPrep | null {
  return parseAssistantJson(answer, interviewPrepSchema);
}
