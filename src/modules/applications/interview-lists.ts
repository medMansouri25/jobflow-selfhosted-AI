import { db } from "@/lib/db";

// Entretiens toutes Candidatures confondues : tableau de bord (FR-003-06) et page « Entretiens » (FR-003-07).

const WITH_APPLICATION = {
  application: { select: { id: true, jobTitle: true, company: { select: { name: true } } } },
} as const;

/** Les `limit` prochains Entretiens (après `now`, BR-003-07), du plus proche au plus lointain. */
export async function listUpcomingInterviews(userId: string, now: Date, limit: number) {
  return db.interview.findMany({
    where: { userId, scheduledAt: { gt: now } },
    orderBy: { scheduledAt: "asc" },
    take: limit,
    include: WITH_APPLICATION,
  });
}

/** Tous les Entretiens : à venir (plus proche d'abord), puis passés (plus récent d'abord). */
export async function listInterviews(userId: string, now: Date) {
  const [upcoming, past] = await Promise.all([
    db.interview.findMany({
      where: { userId, scheduledAt: { gt: now } },
      orderBy: { scheduledAt: "asc" },
      include: WITH_APPLICATION,
    }),
    db.interview.findMany({
      where: { userId, scheduledAt: { lte: now } },
      orderBy: { scheduledAt: "desc" },
      include: WITH_APPLICATION,
    }),
  ]);
  return { upcoming, past };
}

export type InterviewListItem = Awaited<ReturnType<typeof listUpcomingInterviews>>[number];

/** Nombre d'Entretiens à venir (en-tête du tableau de bord). */
export async function countUpcomingInterviews(userId: string, now: Date) {
  return db.interview.count({ where: { userId, scheduledAt: { gt: now } } });
}
