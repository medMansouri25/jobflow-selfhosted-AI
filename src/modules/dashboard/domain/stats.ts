// Statistiques du tableau de bord (SPEC-002), en TypeScript pur : les dates sont des jours AAAA-MM-JJ.

/** Nombre de semaines affichées, semaine en cours comprise (FR-002-06). */
export const WEEKS_SHOWN = 8;

export type WeekCount = { weekStart: string; count: number };

/** Pourcentage arrondi à l'unité ; `null` sans aucune Candidature (BR-002-03). */
export function rate(part: number, total: number): number | null {
  return total === 0 ? null : Math.round((part / total) * 100);
}

/** Lundi de la plus ancienne semaine affichée : les Candidatures antérieures ne comptent pas. */
export function oldestWeekShown(today: string): string {
  return addDays(mondayOf(today), -7 * (WEEKS_SHOWN - 1));
}

/** Candidatures par semaine (lundi → dimanche), de la plus ancienne à la semaine en cours (BR-002-04). */
export function weeklyCounts(appliedDates: string[], today: string): WeekCount[] {
  const oldest = oldestWeekShown(today);
  const weeks = Array.from({ length: WEEKS_SHOWN }, (_, i) => ({
    weekStart: addDays(oldest, 7 * i),
    count: 0,
  }));
  for (const day of appliedDates) {
    const week = weeks.find((w) => w.weekStart === mondayOf(day));
    if (week) week.count++;
  }
  return weeks;
}

function mondayOf(day: string): string {
  const daysSinceMonday = (toUtc(day).getUTCDay() + 6) % 7;
  return addDays(day, -daysSinceMonday);
}

function addDays(day: string, days: number): string {
  const date = toUtc(day);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Calcul sur des jours calendaires en UTC : aucun décalage horaire ne peut changer de jour.
function toUtc(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}
