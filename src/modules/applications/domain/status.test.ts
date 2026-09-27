import { describe, expect, it } from "vitest";

import { APPLICATION_STATUSES } from "@/modules/applications/domain/application";
import {
  ACTIVE_STATUSES,
  allowedTransitions,
  canTransition,
  isActive,
  isDefinitive,
} from "@/modules/applications/domain/status";

// Recopié à la main depuis la table BR-001-05 de specs/001-application-management.md.
const ALLOWED_BY_SPEC = [
  "DRAFT → APPLIED",
  "APPLIED → INTERVIEW",
  "APPLIED → REJECTED",
  "APPLIED → ARCHIVED",
  "INTERVIEW → ACCEPTED",
  "INTERVIEW → REJECTED",
  "INTERVIEW → ARCHIVED",
  "ARCHIVED → APPLIED",
  "ARCHIVED → INTERVIEW",
];

const ALL_PAIRS = APPLICATION_STATUSES.flatMap((from) =>
  APPLICATION_STATUSES.map((to) => ({ from, to })),
);

describe("machine à états des statuts (BR-001-05)", () => {
  it("AC-001-05 autorise APPLIED → INTERVIEW", () => {
    expect(canTransition("APPLIED", "INTERVIEW")).toBe(true);
  });

  it("AC-001-06 refuse DRAFT → ACCEPTED", () => {
    expect(canTransition("DRAFT", "ACCEPTED")).toBe(false);
  });

  it("AC-001-08 refuse REJECTED → APPLIED", () => {
    expect(canTransition("REJECTED", "APPLIED")).toBe(false);
  });

  it("AC-001-09 autorise la Réouverture ARCHIVED → INTERVIEW", () => {
    expect(canTransition("ARCHIVED", "INTERVIEW")).toBe(true);
  });

  it("AC-001-07 ne propose aucune transition depuis REJECTED", () => {
    expect(allowedTransitions("REJECTED")).toEqual([]);
  });

  it("propose depuis APPLIED les transitions de la spec", () => {
    expect(allowedTransitions("APPLIED")).toEqual(["INTERVIEW", "REJECTED", "ARCHIVED"]);
  });

  // CONTEXT.md : Candidature active = Brouillon, Postulée, Entretien ; Statut définitif = Acceptée, Refusée.
  it.each([
    { status: "DRAFT", active: true, definitive: false },
    { status: "APPLIED", active: true, definitive: false },
    { status: "INTERVIEW", active: true, definitive: false },
    { status: "ARCHIVED", active: false, definitive: false },
    { status: "ACCEPTED", active: false, definitive: true },
    { status: "REJECTED", active: false, definitive: true },
  ] as const)(
    "$status : active = $active, définitif = $definitive",
    ({ status, active, definitive }) => {
      expect(isActive(status)).toBe(active);
      expect(isDefinitive(status)).toBe(definitive);
    },
  );

  it("ACTIVE_STATUSES liste les statuts d'une Candidature active", () => {
    expect(ACTIVE_STATUSES).toEqual(["DRAFT", "APPLIED", "INTERVIEW"]);
  });

  it.each(ALL_PAIRS)("$from → $to suit la table de la spec", ({ from, to }) => {
    expect(canTransition(from, to)).toBe(ALLOWED_BY_SPEC.includes(`${from} → ${to}`));
  });
});
