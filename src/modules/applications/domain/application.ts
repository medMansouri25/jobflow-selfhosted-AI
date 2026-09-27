// Vocabulaire de la Candidature (CONTEXT.md, SPEC-001 §7). TypeScript pur : ni Next.js, ni Prisma.

/** Trois statuts seulement ; toute Candidature naît Postulée (FR-001-01). */
export const APPLICATION_STATUSES = ["APPLIED", "INTERVIEW", "REJECTED"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

/** Pièces jointes d'une Candidature (CONTEXT.md) : au plus une de chaque. */
export const ATTACHMENT_KINDS = ["CV", "COVER_LETTER"] as const;
export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number];

export const CONTRACT_TYPES = [
  "CDI",
  "CDD",
  "INTERNSHIP",
  "APPRENTICESHIP",
  "GRADUATE_PROGRAM",
  "FREELANCE",
  "TEMPORARY",
  "OTHER",
] as const;
export type ContractType = (typeof CONTRACT_TYPES)[number];

export const APPLICATION_SOURCES = [
  "LINKEDIN",
  "INDEED",
  "WELCOME_TO_THE_JUNGLE",
  "APEC",
  "FRANCE_TRAVAIL",
  "COMPANY_WEBSITE",
  "SCHOOL",
  "REFERRAL",
  "SPONTANEOUS",
  "OTHER",
] as const;
export type ApplicationSource = (typeof APPLICATION_SOURCES)[number];

export const CURRENCIES = ["EUR", "CHF", "GBP", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const SALARY_PERIODS = ["YEARLY", "MONTHLY"] as const;
export type SalaryPeriod = (typeof SALARY_PERIODS)[number];
