import { z } from "zod";

import {
  APPLICATION_SOURCES,
  APPLICATION_STATUSES,
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
/** « 4 Mo » : la limite telle qu'affichée, dérivée de la constante. */
export const MAX_ATTACHMENT_LABEL = `${MAX_ATTACHMENT_BYTES / (1024 * 1024)} Mo`;

/**
 * Pièce jointe facultative : PDF de 4 Mo maximum. Un champ fichier laissé vide arrive comme un
 * fichier de 0 octet (nommé « blob » par les Server Actions) : il vaut « pas de fichier ».
 */
const pdfAttachment = (label: string) =>
  z.preprocess(
    (value) => (value instanceof File && value.size === 0 ? undefined : value),
    z
      .instanceof(File)
      .refine(
        (file) => file.type === "application/pdf" && file.size <= MAX_ATTACHMENT_BYTES,
        `${label} doit être un PDF de ${MAX_ATTACHMENT_LABEL} maximum`,
      )
      .optional(),
  );

/** Champ obligatoire : vide ou absent → message nommant le champ (BR-001-02). */
const required = <T extends z.ZodType<unknown, string>>(schema: T, label: string) =>
  z.preprocess(
    (value) => emptyToUndefined(value) ?? "",
    z.string().trim().min(1, `${label} est obligatoire`).pipe(schema),
  );

/** Champs saisis d'une Candidature, communs à la création et à la modification (FR-001-02). */
const applicationFields = {
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
};

/** Règles entre plusieurs champs : date non future (BR-001-03), salaire (BR-001-04). */
function crossFieldRules(today: string) {
  return (
    input: {
      appliedAt: string;
      salaryMin?: number;
      salaryMax?: number;
      salaryPeriod?: string;
    },
    ctx: z.RefinementCtx,
  ) => {
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
    const hasAmount = input.salaryMin !== undefined || input.salaryMax !== undefined;
    if (hasAmount && !input.salaryPeriod) {
      ctx.addIssue({
        code: "custom",
        path: ["salaryPeriod"],
        message: "Précise la période du salaire",
      });
    }
  };
}

/** Case à cocher HTML : « on » quand elle est cochée, absente sinon. */
const checkbox = z.preprocess((value) => value === "on" || value === true, z.boolean());

/**
 * Création d'une Candidature (SPEC-001) : toujours Postulée, donc localisation, contrat,
 * source et date toujours obligatoires. `today` (AAAA-MM-JJ) est passé en paramètre
 * pour que la règle « pas de date future » reste testable et déterministe.
 */
export function createApplicationSchema(today: string) {
  return z.object(applicationFields).superRefine(crossFieldRules(today));
}

/**
 * Modification d'une Candidature (FR-001-02) : mêmes champs et mêmes règles, sans statut.
 * Une pièce jointe actuelle se garde (rien), se remplace (nouveau fichier) ou se retire (case cochée).
 */
export function updateApplicationSchema(today: string) {
  return z
    .object({ ...applicationFields, removeCv: checkbox, removeCoverLetter: checkbox })
    .superRefine(crossFieldRules(today));
}

export type UpdateApplicationInput = z.infer<ReturnType<typeof updateApplicationSchema>>;

export type CreateApplicationInput = z.infer<
  ReturnType<typeof createApplicationSchema>
>;

/** Changement de statut (FR-001-05) : la cible doit être un statut connu ; la transition est vérifiée par le service. */
export const changeStatusSchema = z.object({
  to: z.enum(APPLICATION_STATUSES, { error: "Statut inconnu" }),
});

/** Tris de la liste (FR-001-11) ; `modifiee` = dernière modification, du plus récent au plus ancien. */
export const LIST_SORTS = ["modifiee", "candidature", "entreprise"] as const;
export type ListSort = (typeof LIST_SORTS)[number];

/** Valeur de `values`, ou `undefined` : un paramètre d'adresse inconnu est ignoré, jamais une erreur. */
function oneOf<T extends readonly string[]>(values: T, value: unknown): T[number] | undefined {
  return typeof value === "string" && values.includes(value) ? value : undefined;
}

/**
 * Filtres de la liste lus depuis l'adresse (`?q=&statut=&statut=&contrat=&source=&tri=&page=`,
 * FR-001-09 à 12). Tolérant : une adresse modifiée à la main ne provoque jamais d'erreur.
 */
export const listApplicationsSchema = z
  .object({
    q: z.unknown().optional(),
    statut: z.unknown().optional(),
    contrat: z.unknown().optional(),
    source: z.unknown().optional(),
    tri: z.unknown().optional(),
    page: z.unknown().optional(),
  })
  .transform((raw) => {
    const statuses = (Array.isArray(raw.statut) ? raw.statut : [raw.statut])
      .map((value) => oneOf(APPLICATION_STATUSES, value))
      .filter((status) => status !== undefined);
    const q = typeof raw.q === "string" ? raw.q.trim().slice(0, 200) : "";
    const page = Number(raw.page);
    return {
      q: q || undefined,
      statuses,
      contractType: oneOf(CONTRACT_TYPES, raw.contrat),
      source: oneOf(APPLICATION_SOURCES, raw.source),
      sort: oneOf(LIST_SORTS, raw.tri) ?? "modifiee",
      page: Number.isInteger(page) && page >= 1 ? page : 1,
    };
  });

export type ListApplicationsInput = z.infer<typeof listApplicationsSchema>;

