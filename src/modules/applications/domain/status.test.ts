import { describe, expect, it } from "vitest";

import { APPLICATION_STATUSES } from "@/modules/applications/domain/application";
import {
  allowedTransitions,
  canTransition,
  isDefinitive,
} from "@/modules/applications/domain/status";

// Recopié à la main depuis la décision du 2026-09-27 (CONTEXT.md, SPEC-001 BR-001-05).
const ALLOWED_BY_SPEC = [
  "APPLIED → INTERVIEW",
  "APPLIED → REJECTED",
  "INTERVIEW → REJECTED",
];

const ALL_PAIRS = APPLICATION_STATUSES.flatMap((from) =>
  APPLICATION_STATUSES.map((to) => ({ from, to })),
);

describe("machine à états des statuts (BR-001-05)", () => {
  it("ne connaît que Postulée, Entretien et Refusée", () => {
    expect(APPLICATION_STATUSES).toEqual(["APPLIED", "INTERVIEW", "REJECTED"]);
  });

  it("AC-001-05 autorise APPLIED → INTERVIEW", () => {
    expect(canTransition("APPLIED", "INTERVIEW")).toBe(true);
  });

  it("refuse le retour INTERVIEW → APPLIED", () => {
    expect(canTransition("INTERVIEW", "APPLIED")).toBe(false);
  });

  it("AC-001-08 refuse REJECTED → APPLIED", () => {
    expect(canTransition("REJECTED", "APPLIED")).toBe(false);
  });

  it("AC-001-07 ne propose aucune transition depuis REJECTED", () => {
    expect(allowedTransitions("REJECTED")).toEqual([]);
  });

  it("propose depuis APPLIED les transitions de la spec", () => {
    expect(allowedTransitions("APPLIED")).toEqual(["INTERVIEW", "REJECTED"]);
  });

  it.each([
    { status: "APPLIED", definitive: false },
    { status: "INTERVIEW", definitive: false },
    { status: "REJECTED", definitive: true },
  ] as const)("$status : définitif = $definitive", ({ status, definitive }) => {
    expect(isDefinitive(status)).toBe(definitive);
  });

  it.each(ALL_PAIRS)("$from → $to suit la table de la spec", ({ from, to }) => {
    expect(canTransition(from, to)).toBe(ALLOWED_BY_SPEC.includes(`${from} → ${to}`));
  });
});
