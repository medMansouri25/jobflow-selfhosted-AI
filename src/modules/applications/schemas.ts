import { z } from "zod";

import {
  APPLICATION_SOURCES,
  CONTRACT_TYPES,
  CURRENCIES,
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

export const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

/**
 * Pièce jointe facultative : PDF de 4 Mo maximum. Un champ fichier laissé vide arrive
 * comme un fichier sans nom de 0 octet : il vaut « pas de fichier ».
 */
const pdfAttachment = (label: string) =>
  z.preprocess(
    (value) => (value instanceof File && value.size === 0 && !value.name ? undefined : value),
    z
      .instanceof(File)
      .refine(
        (file) => file.type === "application/pdf" && file.size <= MAX_ATTACHMENT_BYTES,
        `${label} doit être un PDF de 4 Mo maximum`,
      )
      .optional(),
  );

/** Champ obligatoire : vide ou absent → message nommant le champ (BR-001-02). */
const required = <T extends z.ZodType<unknown, string>>(schema: T, label: string) =>
  z.preprocess(
    (value) => emptyToUndefined(value) ?? "",
    z.string().trim().min(1, `${label} est obligatoire`).pipe(schema),
  );

/**
 * Création d'une Candidature (SPEC-001) : toujours Postulée, donc localisation, contrat,
 * source et date toujours obligatoires. `today` (AAAA-MM-JJ) est passé en paramètre
 * pour que la règle « pas de date future » reste testable et déterministe.
 */
export function createApplicationSchema(today: string) {
  return z
    .object({
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
      location: required(z.string().max(200, "200 caractères maximum"), "La localisation"),
      contractType: required(z.enum(CONTRACT_TYPES), "Le type de contrat"),
      source: required(z.enum(APPLICATION_SOURCES), "La source de l'Annonce"),
      jobUrl: httpUrl,
      jobDescription: optionalText(50_000),
      salaryMin: optionalAmount,
      salaryMax: optionalAmount,
      salaryCurrency: z.preprocess(
        (value) => emptyToUndefined(value) ?? "EUR",
        z.enum(CURRENCIES, { error: "Devise non prise en charge" }),
      ),
      salaryPeriod: optionalEnum(SALARY_PERIODS),
      appliedAt: required(z.iso.date("Date invalide"), "La date de candidature"),
      notes: optionalText(20_000),
      cv: pdfAttachment("Le CV"),
      coverLetter: pdfAttachment("La lettre de motivation"),
    })
    .superRefine((input, ctx) => {
      if (input.appliedAt > today) {
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
