import { z } from "zod";

// Briques Zod communes aux formulaires (Candidature, Entretien, Profil).

/** Un champ de formulaire vide arrive sous forme de chaîne vide : on le traite comme absent. */
export const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

/** Texte facultatif, nettoyé, limité à `max` caractères. */
export const optionalText = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max, `${max} caractères maximum`).optional());
