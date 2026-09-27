/** Taille d'une pièce jointe : « 234 Ko », « 1,4 Mo » — jamais « 0 Ko ». */
const sizeFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export function formatFileSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} Ko`
    : `${sizeFormat.format(bytes / (1024 * 1024))} Mo`;
}
