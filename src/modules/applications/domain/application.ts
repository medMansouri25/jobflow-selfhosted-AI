// Vocabulaire de la Candidature (CONTEXT.md, SPEC-001 §7). TypeScript pur : ni Next.js, ni Prisma.

export const APPLICATION_STATUSES = [
  "DRAFT",
  "APPLIED",
  "INTERVIEW",
  "ACCEPTED",
  "REJECTED",
  "ARCHIVED",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

/** Seuls statuts possibles à la création (FR-001-01). */
export const INITIAL_STATUSES = ["DRAFT", "APPLIED"] as const;
export type InitialStatus = (typeof INITIAL_STATUSES)[number];

export const CONTRACT_TYPES = [
  "CDI",
  "CDD",
  "INTERNSHIP",
  "APPRENTICESHIP",
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
  "REFERRAL",
  "SPONTANEOUS",
  "OTHER",
] as const;
export type ApplicationSource = (typeof APPLICATION_SOURCES)[number];

export const SALARY_PERIODS = ["YEARLY", "MONTHLY"] as const;
export type SalaryPeriod = (typeof SALARY_PERIODS)[number];
