import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createApplicationSchema } from "@/modules/applications/schemas";

const TODAY = "2026-09-24";

// Ce que le navigateur envoie : uniquement des chaînes, vides quand un champ n'est pas rempli.
function formInput(overrides: Record<string, string> = {}) {
  return {
    status: "DRAFT",
    companyName: "Thales",
    jobTitle: "Développeur backend",
    location: "",
    contractType: "",
    source: "",
    jobUrl: "",
    jobDescription: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "EUR",
    salaryPeriod: "",
    appliedAt: "",
    cvLabel: "",
    coverLetter: "",
    notes: "",
    ...overrides,
  };
}

function fieldErrors(input: Record<string, string>) {
  const result = createApplicationSchema(TODAY).safeParse(input);
  if (result.success) return {};
  return z.flattenError(result.error).fieldErrors as Record<string, string[]>;
}

describe("création d'une candidature", () => {
  it("accepte un Brouillon avec seulement l'Entreprise et l'intitulé du poste (BR-001-01)", () => {
    const result = createApplicationSchema(TODAY).safeParse(formInput());

    expect(result.success).toBe(true);
    expect(result.data?.location).toBeUndefined();
    expect(result.data?.salaryMin).toBeUndefined();
  });

  it("refuse un Brouillon sans intitulé de poste (AC-001-02)", () => {
    expect(fieldErrors(formInput({ jobTitle: "   " }))).toHaveProperty(
      "jobTitle",
    );
  });

  it("refuse une Candidature sans Entreprise", () => {
    expect(fieldErrors(formInput({ companyName: "" }))).toHaveProperty(
      "companyName",
    );
  });

  it("supprime les espaces autour du nom de l'Entreprise", () => {
    const result = createApplicationSchema(TODAY).safeParse(
      formInput({ companyName: "  Capgemini  " }),
    );

    expect(result.data?.companyName).toBe("Capgemini");
  });

  it("refuse une Candidature Postulée sans date de candidature (AC-001-03)", () => {
    expect(fieldErrors(formInput({ status: "APPLIED" }))).toHaveProperty(
      "appliedAt",
    );
  });

  it("accepte une Candidature Postulée datée d'aujourd'hui", () => {
    const result = createApplicationSchema(TODAY).safeParse(
      formInput({ status: "APPLIED", appliedAt: "2026-09-24" }),
    );

    expect(result.success).toBe(true);
  });

  it("refuse une date de candidature dans le futur (BR-001-03)", () => {
    expect(
      fieldErrors(formInput({ status: "APPLIED", appliedAt: "2026-09-25" })),
    ).toHaveProperty("appliedAt");
  });

  it("refuse un statut initial autre que Brouillon ou Postulée (FR-001-01)", () => {
    expect(fieldErrors(formInput({ status: "ACCEPTED" }))).toHaveProperty(
      "status",
    );
  });

  it("refuse un salaire minimum supérieur au maximum (AC-001-17)", () => {
    expect(
      fieldErrors(
        formInput({
          salaryMin: "50000",
          salaryMax: "40000",
          salaryPeriod: "YEARLY",
        }),
      ),
    ).toHaveProperty("salaryMax");
  });

  it("exige la période dès qu'un montant de salaire est saisi (BR-001-04)", () => {
    expect(fieldErrors(formInput({ salaryMin: "42000" }))).toHaveProperty(
      "salaryPeriod",
    );
  });

  it("convertit les montants saisis en nombres", () => {
    const result = createApplicationSchema(TODAY).safeParse(
      formInput({
        salaryMin: "42000",
        salaryMax: "48000",
        salaryPeriod: "YEARLY",
      }),
    );

    expect(result.data?.salaryMin).toBe(42000);
    expect(result.data?.salaryMax).toBe(48000);
  });

  it("refuse une URL d'Annonce qui n'est pas en http ou https (AC-001-18)", () => {
    expect(
      fieldErrors(formInput({ jobUrl: "javascript:alert(1)" })),
    ).toHaveProperty("jobUrl");
  });

  it("accepte une URL d'Annonce en https", () => {
    const result = createApplicationSchema(TODAY).safeParse(
      formInput({ jobUrl: "https://www.welcometothejungle.com/fr/jobs/123" }),
    );

    expect(result.success).toBe(true);
  });
});
