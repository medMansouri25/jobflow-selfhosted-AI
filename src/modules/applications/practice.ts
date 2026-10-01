import { AiError, type TextGenerator } from "@/lib/ai";
import { db } from "@/lib/db";
import { DomainError } from "@/lib/errors";
import { loadAssistantInputs } from "@/modules/applications/assistant-inputs";
import { findOwnedInterview } from "@/modules/applications/interviews";
import {
  buildDebriefRequest,
  buildFeedbackRequest,
  buildPracticeQuestionsRequest,
  type Exchange,
  type Feedback,
  MAX_ANSWER,
  parseDebrief,
  parseFeedback,
  parsePracticeQuestions,
  PRACTICE_QUESTIONS,
} from "@/modules/applications/practice-request";

// Entraînement à un Entretien (SPEC-009, B) : rien n'est enregistré (BR-009-04), chaque étape
// vérifie l'appartenance de l'Entretien.

const BAD_FORMAT = "L'assistant IA n'a pas répondu dans le format attendu. Réessaie.";

async function inputs(userId: string, interviewId: string) {
  const interview = await findOwnedInterview(db, userId, interviewId);
  return { interview, ...(await loadAssistantInputs(userId, interview.applicationId)) };
}

/** Les 5 questions d'une nouvelle séance (FR-009-05). */
export async function startPractice(userId: string, interviewId: string, generator: TextGenerator): Promise<string[]> {
  const { interview, posting, profile } = await inputs(userId, interviewId);
  const questions = parsePracticeQuestions(
    await generator.generate(buildPracticeQuestionsRequest(interview, posting, profile)),
  );
  if (!questions) throw new AiError(BAD_FORMAT);
  return questions;
}

/** Le retour sur une réponse écrite (FR-009-06). */
export async function givePracticeFeedback(
  userId: string,
  interviewId: string,
  question: string,
  answer: string,
  generator: TextGenerator,
): Promise<Feedback> {
  if (!answer.trim()) throw new DomainError("PRACTICE_EMPTY_ANSWER", "Écris ta réponse avant de l'envoyer.");
  if (answer.length > MAX_ANSWER) {
    throw new DomainError("PRACTICE_LONG_ANSWER", `Ta réponse dépasse ${MAX_ANSWER} caractères : raccourcis-la.`);
  }
  const { interview, posting, profile } = await inputs(userId, interviewId);
  const feedback = parseFeedback(
    await generator.generate(buildFeedbackRequest(interview, posting, profile, question.slice(0, 1_500), answer)),
  );
  if (!feedback) throw new AiError(BAD_FORMAT);
  return feedback;
}

/** Le bilan de la séance (FR-009-07), à partir de ses échanges seulement. */
export async function debriefPractice(
  userId: string,
  interviewId: string,
  exchanges: Exchange[],
  generator: TextGenerator,
): Promise<string[]> {
  const interview = await findOwnedInterview(db, userId, interviewId);
  const kept = exchanges
    .slice(0, PRACTICE_QUESTIONS)
    .map(({ question, answer }) => ({ question: question.slice(0, 1_500), answer: answer.slice(0, MAX_ANSWER) }));
  const points = parseDebrief(await generator.generate(buildDebriefRequest(interview, kept)));
  if (!points) throw new AiError(BAD_FORMAT);
  return points;
}

/** L'Entretien et sa Candidature, pour l'en-tête de la page d'entraînement. */
export async function getPracticeInterview(userId: string, interviewId: string) {
  const interview = await findOwnedInterview(db, userId, interviewId);
  const application = await db.application.findUniqueOrThrow({
    where: { id: interview.applicationId },
    select: { id: true, jobTitle: true, company: { select: { name: true } } },
  });
  return { interview, application };
}
