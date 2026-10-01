/** Taille d'une pièce jointe : « 234 Ko », « 1,4 Mo » — jamais « 0 Ko ». */
const sizeFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export function formatFileSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} Ko`
    : `${sizeFormat.format(bytes / (1024 * 1024))} Mo`;
}

// « mer. 14 oct. 2026 · 10:30 », toujours à l'heure de Paris (SPEC-003 §6).
const dayFormat = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Paris",
});
const timeFormat = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

export function formatInterviewDate(instant: Date): string {
  return `${dayFormat.format(instant)} · ${timeFormat.format(instant)}`;
}
