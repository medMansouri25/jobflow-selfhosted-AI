// Machine à états des statuts (SPEC-001 BR-001-05). TypeScript pur : ni Next.js, ni Prisma.

import type { ApplicationStatus } from "@/modules/applications/domain/application";

/** Table BR-001-05 : les seules transitions autorisées depuis chaque statut. */
export const STATUS_TRANSITIONS = {
  APPLIED: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["REJECTED"],
  REJECTED: [],
} as const satisfies Record<ApplicationStatus, readonly ApplicationStatus[]>;

/** Statut qu'une transition peut atteindre (Postulée n'est qu'un statut de création). */
export type TransitionTarget = (typeof STATUS_TRANSITIONS)[ApplicationStatus][number];

/** Statuts vers lesquels on peut passer depuis `from`, dans l'ordre de la table. */
export function allowedTransitions(from: ApplicationStatus): readonly TransitionTarget[] {
  return STATUS_TRANSITIONS[from];
}

export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return (STATUS_TRANSITIONS[from] as readonly ApplicationStatus[]).includes(to);
}

/** Statut définitif : aucune transition sortante, donc aucun retour possible. */
export function isDefinitive(status: ApplicationStatus): boolean {
  return STATUS_TRANSITIONS[status].length === 0;
}
