/** Clé de comparaison d'un nom d'Entreprise : sans casse, sans espaces superflus (BR-001-11). */
export function normalizeCompanyName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("fr-FR");
}

/** Nom affiché : tel que saisi, sans espaces superflus. */
export function cleanCompanyName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}
