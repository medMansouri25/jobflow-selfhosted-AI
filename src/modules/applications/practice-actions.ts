"use server";

import { getTextGenerator } from "@/lib/ai";
import { getCurrentUserId } from "@/lib/current-user";
import { domainErrorToFormState } from "@/lib/errors";
import { debriefPractice, givePracticeFeedback, startPractice } from "@/modules/applications/practice";
import { type Exchange, type Feedback, PRACTICE_QUESTIONS } from "@/modules/applications/practice-request";

// Étapes d'une séance d'entraînement (SPEC-009, B), appelées par le composant de la séance.
// Rien n'est enregistré ; une règle métier ou une panne de l'assistant revient en message.

export type PracticeResult<T> = { ok: true; data: T } | { ok: false; message: string };

async function attempt<T>(step: () => Promise<T>): Promise<PracticeResult<T>> {
  try {
    return { ok: true, data: await step() };
  } catch (error) {
    return { ok: false, message: domainErrorToFormState(error).message };
  }
}

export async function startPracticeAction(interviewId: string): Promise<PracticeResult<string[]>> {
  return attempt(async () => startPractice(await getCurrentUserId(), interviewId, getTextGenerator()));
}

export async function practiceFeedbackAction(
  interviewId: string,
  question: string,
  answer: string,
): Promise<PracticeResult<Feedback>> {
  return attempt(async () =>
    givePracticeFeedback(await getCurrentUserId(), interviewId, String(question), String(answer), getTextGenerator()),
  );
}

export async function practiceDebriefAction(
  interviewId: string,
  exchanges: Exchange[],
): Promise<PracticeResult<string[]>> {
  // Bornée ici, avant toute copie : le navigateur peut envoyer n'importe quel tableau.
  const safe = Array.isArray(exchanges)
    ? exchanges.slice(0, PRACTICE_QUESTIONS).map((exchange) => ({ question: String(exchange?.question ?? ""), answer: String(exchange?.answer ?? "") }))
    : [];
  return attempt(async () => debriefPractice(await getCurrentUserId(), interviewId, safe, getTextGenerator()));
}
