/** Date du jour (AAAA-MM-JJ) dans le fuseau de l'utilisateur. */
export function todayInParis(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
}

const PARIS = "Europe/Paris";

// « 2026-10-14T10:30 » à Paris, champ par champ (format suédois : AAAA-MM-JJ HH:MM).
const parisParts = new Intl.DateTimeFormat("sv-SE", {
  timeZone: PARIS,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Instant UTC → date et heure à Paris (AAAA-MM-JJTHH:MM), le format d'un champ `datetime-local`. */
export function utcToParisLocal(instant: Date): string {
  return parisParts.format(instant).replace(" ", "T");
}

/**
 * Date et heure saisies à Paris (AAAA-MM-JJTHH:MM) → instant UTC. Le décalage (UTC+1 ou UTC+2)
 * est celui de Paris à cette date : on part de l'heure lue comme UTC, puis on corrige de l'écart.
 */
export function parisLocalToUtc(local: string): Date {
  const asUtc = new Date(`${local}:00Z`);
  if (Number.isNaN(asUtc.getTime())) return asUtc; // date impossible (mois 13, 25 h) : « Invalid Date »
  const offset = asUtc.getTime() - new Date(`${utcToParisLocal(asUtc)}:00Z`).getTime();
  const guess = new Date(asUtc.getTime() + offset);
  // Le décalage a pu changer entre les deux instants (passage à l'heure d'été / d'hiver) : on le recalcule.
  const correction = new Date(`${utcToParisLocal(guess)}:00Z`).getTime() - asUtc.getTime();
  return new Date(guess.getTime() - correction);
}
