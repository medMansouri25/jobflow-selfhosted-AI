/** Date du jour (AAAA-MM-JJ) dans le fuseau de l'utilisateur. */
export function todayInParis(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
}
