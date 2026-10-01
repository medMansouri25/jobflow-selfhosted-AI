"use server";

import { getTextGenerator } from "@/lib/ai";
import { getCurrentUserId } from "@/lib/current-user";
import { DomainError } from "@/lib/errors";
import { debriefPractice, givePracticeFeedback, startPractice } from "@/modules/applications/practice";
import type { Exchange, Feedback } from "@/modules/applications/practice-request";

// Étapes d'une séance d'entraînement (SPEC-009, B), appelées par le composant de la séance.
// Rien n'est enregistré ; une règle métier ou une panne de l'assistant revient en message.

export type PracticeResult<T> = { ok: true; data: T } | { ok: false; message: string };

async function attempt<T>(step: () => Promise<T>): Promise<PracticeResult<T>> {
  try {
    return { ok: true, data: await step() };
  } catch (error) {
    if (error instanceof DomainError) return { ok: false, message: error.message };
    throw error;
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
  const safe = Array.isArray(exchanges)
    ? exchanges.map((exchange) => ({ question: String(exchange?.question ?? ""), answer: String(exchange?.answer ?? "") }))
    : [];
  return attempt(async () => debriefPractice(await getCurrentUserId(), interviewId, safe, getTextGenerator()));
}
