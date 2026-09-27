// Machine à états des statuts (SPEC-001 BR-001-05). TypeScript pur : ni Next.js, ni Prisma.

import type { ApplicationStatus } from "@/modules/applications/domain/application";

/** Table BR-001-05 : les seules transitions autorisées depuis chaque statut. */
export const STATUS_TRANSITIONS: Readonly<
  Record<ApplicationStatus, readonly ApplicationStatus[]>
> = {
  DRAFT: ["APPLIED"],
  APPLIED: ["INTERVIEW", "REJECTED", "ARCHIVED"],
  INTERVIEW: ["ACCEPTED", "REJECTED", "ARCHIVED"],
  ARCHIVED: ["APPLIED", "INTERVIEW"],
  ACCEPTED: [],
  REJECTED: [],
};

/** Statuts vers lesquels on peut passer depuis `from`, dans l'ordre de la table. */
export function allowedTransitions(from: ApplicationStatus): readonly ApplicationStatus[] {
  return STATUS_TRANSITIONS[from];
}

export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to);
}

/** Statuts d'une Candidature active (CONTEXT.md) ; les autres sont ceux d'une Candidature terminée. */
export const ACTIVE_STATUSES = [
  "DRAFT",
  "APPLIED",
  "INTERVIEW",
] as const satisfies readonly ApplicationStatus[];

export function isActive(status: ApplicationStatus): boolean {
  return (ACTIVE_STATUSES as readonly ApplicationStatus[]).includes(status);
}

/** Statut définitif : aucune transition sortante, donc aucun retour possible. */
export function isDefinitive(status: ApplicationStatus): boolean {
  return STATUS_TRANSITIONS[status].length === 0;
}
