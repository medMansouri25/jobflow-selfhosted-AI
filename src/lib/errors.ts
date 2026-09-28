/** Violation d'une règle métier : affichée à l'utilisateur, jamais une panne. */
export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super("NOT_FOUND", message);
    this.name = "NotFoundError";
  }
}

/** Transition de statut refusée par la machine à états (BR-001-05), vérifiée sur le statut en base. */
export class InvalidTransitionError extends DomainError {
  constructor(message: string) {
    super("INVALID_TRANSITION", message);
    this.name = "InvalidTransitionError";
  }
}

/**
 * Convertit une `DomainError` en état d'action pour le formulaire.
 * Toute autre erreur est relancée : elle doit remonter jusqu'à `error.tsx`.
 */
export function domainErrorToFormState(error: unknown): {
  status: "error";
  message: string;
} {
  if (error instanceof DomainError) {
    return { status: "error", message: error.message };
  }
  throw error;
}
