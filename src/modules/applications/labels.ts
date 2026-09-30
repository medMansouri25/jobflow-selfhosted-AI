import type { TransitionTarget } from "@/modules/applications/domain/status";
import type { ListSort } from "@/modules/applications/schemas";
import type {
  ApplicationSource,
  AttachmentKind,
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

/** Bouton qui mène à un statut (bloc « Statut » de la fiche). */
export const TRANSITION_LABELS: Record<TransitionTarget, string> = {
  INTERVIEW: "Passer en Entretien",
  REJECTED: "Marquer Refusée",
};

export const ATTACHMENT_KIND_LABELS: Record<AttachmentKind, string> = {
  CV: "CV",
  COVER_LETTER: "Lettre de motivation",
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

/** Tris de la liste (FR-001-11). */
export const LIST_SORT_LABELS: Record<ListSort, string> = {
  modifiee: "Dernière modification",
  candidature: "Date de candidature",
  entreprise: "Entreprise (A → Z)",
};

