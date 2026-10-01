import type { Prisma } from "@/generated/prisma/client";

import { parisLocalToUtc, utcToParisLocal } from "@/lib/dates";
import { addDays } from "@/lib/days";
import { db } from "@/lib/db";

// Entretiens toutes Candidatures confondues : tableau de bord (FR-003-06) et page « Entretiens » (FR-003-07).

/** Ce qu'affiche une liste d'Entretiens (le lieu pour le bouton « Rejoindre ») : ni préparation ni compte rendu. */
const LIST_FIELDS = {
  id: true,
  scheduledAt: true,
  type: true,
  format: true,
  location: true,
  application: { select: { id: true, jobTitle: true, company: { select: { name: true } } } },
} satisfies Prisma.InterviewSelect;

/** « À venir » = après `now` (BR-003-07). */
const upcoming = (userId: string, now: Date) => ({ userId, scheduledAt: { gt: now } });

/** Les `limit` prochains Entretiens (tous si `limit` est absent), du plus proche au plus lointain. */
export async function listUpcomingInterviews(userId: string, now: Date, limit?: number) {
  return db.interview.findMany({
    where: upcoming(userId, now),
    // `id` départage deux Entretiens à la même heure : l'ordre reste stable d'un chargement à l'autre.
    orderBy: [{ scheduledAt: "asc" }, { id: "asc" }],
    take: limit,
    select: LIST_FIELDS,
  });
}

/** Tous les Entretiens : à venir (plus proche d'abord), puis passés (plus récent d'abord). */
export async function listInterviews(userId: string, now: Date) {
  const [future, past] = await Promise.all([
    listUpcomingInterviews(userId, now),
    db.interview.findMany({
      where: { userId, scheduledAt: { lte: now } },
      orderBy: [{ scheduledAt: "desc" }, { id: "asc" }],
      select: LIST_FIELDS,
    }),
  ]);
  return { upcoming: future, past };
}

/** Nombre d'Entretiens à venir (en-tête du tableau de bord). */
export async function countUpcomingInterviews(userId: string, now: Date) {
  return db.interview.count({ where: upcoming(userId, now) });
}

/**
 * Entretiens du jour `firstDay` au jour `lastDay` inclus (jours de Paris, BR-004-01), rangés par jour
 * puis par heure croissante : `{ "2026-10-14": [...] }`. Agenda (SPEC-004).
 */
export async function listInterviewsByDay(userId: string, firstDay: string, lastDay: string) {
  const interviews = await db.interview.findMany({
    where: {
      userId,
      scheduledAt: {
        gte: parisLocalToUtc(`${firstDay}T00:00`),
        lt: parisLocalToUtc(`${addDays(lastDay, 1)}T00:00`),
      },
    },
    orderBy: [{ scheduledAt: "asc" }, { id: "asc" }],
    select: LIST_FIELDS,
  });
  const byDay: Record<string, typeof interviews> = {};
  for (const interview of interviews) {
    const day = utcToParisLocal(interview.scheduledAt).slice(0, 10);
    (byDay[day] ??= []).push(interview);
  }
  return byDay;
}
