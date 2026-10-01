// Analyse d'une Annonce par l'assistant (SPEC-007), en TypeScript pur : la demande, et la lecture
// vérifiée de la réponse JSON (BR-007-04).

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

const text = z.string().trim().min(1).max(600);
const list = z.array(text).max(12);
const skill = z.object({ name: z.string().trim().min(1).max(120), required: z.boolean(), inProfile: z.boolean() });

/** Analyse attendue (FR-007-02 à 05) ; toute autre forme est refusée. */
export const jobAnalysisSchema = z.object({
  summary: z.string().trim().min(1).max(1_200),
  skills: z.object({ technical: z.array(skill).max(30), soft: z.array(skill).max(15) }),
  strengths: list,
  questionsToPrepare: list,
  questionsToAsk: list,
});

export type JobAnalysis = z.infer<typeof jobAnalysisSchema>;

const SYSTEM = `Tu analyses une offre d'emploi pour un candidat, au regard de son profil.

Réponds uniquement par un objet JSON, en français, de cette forme exacte :
{
  "summary": "2 ou 3 phrases : le poste, l'équipe, ce qui compte vraiment",
  "skills": {
    "technical": [{ "name": "…", "required": true, "inProfile": false }],
    "soft": [{ "name": "…", "required": false, "inProfile": true }]
  },
  "strengths": ["élément du profil à mettre en avant pour ce poste"],
  "questionsToPrepare": ["question probable en entretien"],
  "questionsToAsk": ["question à poser au recruteur"]
}

Règles :
- "skills.technical" : langages, outils, méthodes ; "skills.soft" : savoir-être. Les compétences demandées par l'annonce, sans en ajouter : 30 compétences techniques et 15 savoir-être au plus, les plus importantes d'abord, chacune une seule fois.
- "required" : true si l'annonce la présente comme obligatoire, false si elle est souhaitée ou appréciée.
- "inProfile" : true seulement si le profil du candidat mentionne cette compétence ; sinon false.
- N'invente rien : seules l'annonce et le profil comptent ; aucune information extérieure sur l'entreprise.
- Aucune note ni pourcentage de compatibilité.
- 3 à 6 éléments pour "strengths", "questionsToPrepare" et "questionsToAsk".
- ${DATA_RULE}`;

/** Demande d'analyse : l'Annonce et le Profil sans e-mail ni téléphone (BR-007-02), réponse en JSON. */
export function buildJobAnalysisRequest(posting: AssistantPosting, profile: AssistantProfile): GenerationRequest {
  const prompt = ["Analyse l'annonce ci-dessous pour ce candidat.", "", postingBlock(posting), "", profileBlock(profile)].join(
    "\n",
  );
  return { system: SYSTEM, prompt, json: true };
}

/** L'analyse lue dans la réponse, ou `null` si elle n'a pas la forme attendue (BR-007-04). */
export function parseJobAnalysis(answer: string): JobAnalysis | null {
  return parseAssistantJson(answer, jobAnalysisSchema);
}
