// Jours calendaires AAAA-MM-JJ, calculés en UTC : aucun décalage horaire ne peut changer de jour.

function toUtc(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

export function addDays(day: string, days: number): string {
  const date = toUtc(day);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Lundi de la semaine du jour (les semaines vont du lundi au dimanche). */
export function mondayOf(day: string): string {
  return addDays(day, -((toUtc(day).getUTCDay() + 6) % 7));
}

/** Premier jour du mois, décalé de `months` mois. */
export function firstOfMonth(day: string, months = 0): string {
  const date = toUtc(day);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1)).toISOString().slice(0, 10);
}

/** Vrai pour un jour AAAA-MM-JJ qui existe (pas de 30 février), entre 1900 et 2999 : hors de là, `Date.UTC`
 * lit 0050 comme 1950 et l'an 0 ou 10 000 sortent du format. */
export function isValidDay(value: string): boolean {
  return /^(19|2\d)\d{2}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(toUtc(value).getTime()) && toUtc(value).toISOString().startsWith(value);
}
