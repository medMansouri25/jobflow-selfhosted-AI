import { z } from "zod";

import {
  APPLICATION_SOURCES,
  CONTRACT_TYPES,
  INITIAL_STATUSES,
  SALARY_PERIODS,
} from "@/modules/applications/domain/application";

// Un champ de formulaire vide arrive sous forme de chaîne vide : on le traite comme absent.
const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalText = (max: number) =>
  z.preprocess(
    emptyToUndefined,
    z.string().trim().max(max, `${max} caractères maximum`).optional(),
  );

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(emptyToUndefined, z.enum(values).optional());

const optionalAmount = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ error: "Montant invalide" })
    .int("Montant entier attendu")
    .positive("Montant positif attendu")
    .optional(),
);

const httpUrl = z.preprocess(
  emptyToUndefined,
  z
    .url({ protocol: /^https?$/, error: "URL http ou https attendue" })
    .max(2048)
    .optional(),
);

/**
 * Création d'une Candidature (SPEC-001). `today` (AAAA-MM-JJ) est passé en paramètre
 * pour que la règle « pas de date future » reste testable et déterministe.
 */
export function createApplicationSchema(today: string) {
  return z
    .object({
      status: z.enum(INITIAL_STATUSES, {
        error: "Statut initial : Brouillon ou Postulée",
      }),
      companyName: z
        .string()
        .trim()
        .min(1, "L'Entreprise est obligatoire")
        .max(200, "200 caractères maximum"),
      jobTitle: z
        .string()
        .trim()
        .min(1, "L'intitulé du poste est obligatoire")
        .max(200, "200 caractères maximum"),
      location: optionalText(200),
      contractType: optionalEnum(CONTRACT_TYPES),
      source: optionalEnum(APPLICATION_SOURCES),
      jobUrl: httpUrl,
      jobDescription: optionalText(50_000),
      salaryMin: optionalAmount,
      salaryMax: optionalAmount,
      salaryCurrency: z.preprocess(
        (value) => emptyToUndefined(value) ?? "EUR",
        z.string().regex(/^[A-Z]{3}$/, "Code devise sur 3 lettres (ex. EUR)"),
      ),
      salaryPeriod: optionalEnum(SALARY_PERIODS),
      appliedAt: z.preprocess(
        emptyToUndefined,
        z.iso.date("Date invalide").optional(),
      ),
      cvLabel: optionalText(200),
      coverLetter: optionalText(20_000),
      notes: optionalText(20_000),
    })
    .superRefine((input, ctx) => {
      if (input.status === "APPLIED" && !input.appliedAt) {
        ctx.addIssue({
          code: "custom",
          path: ["appliedAt"],
          message: "La date de candidature est obligatoire pour une candidature Postulée",
        });
      }
      if (input.appliedAt && input.appliedAt > today) {
        ctx.addIssue({
          code: "custom",
          path: ["appliedAt"],
          message: "La date de candidature ne peut pas être dans le futur",
        });
      }
      if (
        input.salaryMin !== undefined &&
        input.salaryMax !== undefined &&
        input.salaryMin > input.salaryMax
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["salaryMax"],
          message: "Le maximum doit être supérieur ou égal au minimum",
        });
      }
      const hasAmount =
        input.salaryMin !== undefined || input.salaryMax !== undefined;
      if (hasAmount && !input.salaryPeriod) {
        ctx.addIssue({
          code: "custom",
          path: ["salaryPeriod"],
          message: "Précise la période du salaire",
        });
      }
    });
}

export type CreateApplicationInput = z.infer<
  ReturnType<typeof createApplicationSchema>
>;
