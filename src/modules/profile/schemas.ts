import { z } from "zod";

import { emptyToUndefined, optionalText } from "@/lib/form-fields";

const TEXT_MAX = 20_000;

/** Formulaire du Profil (SPEC-006) : tout est facultatif ; un champ vidé est effacé (BR-006-02). */
export const profileSchema = z.object({
  fullName: optionalText(200),
  targetRole: optionalText(200),
  location: optionalText(200),
  email: z.preprocess(
    emptyToUndefined,
    z.email({ error: "Adresse e-mail invalide" }).max(200).optional(),
  ),
  phone: optionalText(40),
  linkedinUrl: z.preprocess(
    emptyToUndefined,
    z.url({ protocol: /^https?$/, error: "Lien http ou https attendu" }).max(2048).optional(),
  ),
  about: optionalText(TEXT_MAX),
  experience: optionalText(TEXT_MAX),
  projects: optionalText(TEXT_MAX),
  skills: optionalText(TEXT_MAX),
  education: optionalText(TEXT_MAX),
  writingSamples: optionalText(TEXT_MAX),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const PROFILE_FIELDS = Object.keys(profileSchema.shape) as (keyof ProfileInput)[];
