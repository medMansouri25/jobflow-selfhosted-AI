import { describe, expect, it } from "vitest";

import { DomainError, NotFoundError, domainErrorToFormState } from "@/lib/errors";

describe("erreurs métier", () => {
  it("transforme une erreur métier en message de formulaire", () => {
    const state = domainErrorToFormState(
      new DomainError("INVALID_TRANSITION", "Cette candidature est déjà refusée."),
    );

    expect(state).toEqual({
      status: "error",
      message: "Cette candidature est déjà refusée.",
    });
  });

  it("reconnaît une ressource introuvable comme erreur métier", () => {
    const error = new NotFoundError("Candidature introuvable.");

    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe("NOT_FOUND");
  });

  it("relance toute erreur qui n'est pas une erreur métier", () => {
    const unexpected = new Error("connexion refusée");

    expect(() => domainErrorToFormState(unexpected)).toThrow(unexpected);
  });
});
