import type {
  ApplicationSource,
  ApplicationStatus,
  ContractType,
  SalaryPeriod,
} from "@/modules/applications/domain/application";

// Dictionnaire unique code → libellé français : les codes ne sont jamais affichés.

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Postulée",
  INTERVIEW: "Entretien",
  REJECTED: "Refusée",
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  CDI: "CDI",
  CDD: "CDD",
  INTERNSHIP: "Stage",
  APPRENTICESHIP: "Alternance",
  GRADUATE_PROGRAM: "Graduate Program",
  FREELANCE: "Freelance",
  TEMPORARY: "Intérim",
  OTHER: "Autre",
};

export const SOURCE_LABELS: Record<ApplicationSource, string> = {
  LINKEDIN: "LinkedIn",
  INDEED: "Indeed",
  WELCOME_TO_THE_JUNGLE: "Welcome to the Jungle",
  APEC: "APEC",
  FRANCE_TRAVAIL: "France Travail",
  COMPANY_WEBSITE: "Site carrière",
  SCHOOL: "École",
  REFERRAL: "Réseau / cooptation",
  SPONTANEOUS: "Candidature spontanée",
  OTHER: "Autre",
};

export const SALARY_PERIOD_LABELS: Record<SalaryPeriod, string> = {
  YEARLY: "Annuel",
  MONTHLY: "Mensuel",
};
