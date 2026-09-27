import { describe, expect, it } from "vitest";

import { toFormValues } from "@/modules/applications/form-values";

describe("valeurs du formulaire de modification", () => {
  it("reprend chaque champ enregistré sous la forme saisie dans le formulaire", () => {
    expect(
      toFormValues({
        company: { name: "Sanofi" },
        jobTitle: "Ingénieur SI",
        location: "Le Mans",
        contractType: "CDI",
        source: "OTHER",
        jobUrl: null,
        jobDescription: "Missions :\nRun",
        salaryMin: 42000,
        salaryMax: null,
        salaryCurrency: "EUR",
        salaryPeriod: "YEARLY",
        appliedAt: new Date("2026-09-27T00:00:00Z"),
        notes: null,
      }),
    ).toEqual({
      companyName: "Sanofi",
      jobTitle: "Ingénieur SI",
      location: "Le Mans",
      contractType: "CDI",
      source: "OTHER",
      jobUrl: "",
      jobDescription: "Missions :\nRun",
      salaryMin: "42000",
      salaryMax: "",
      salaryCurrency: "EUR",
      salaryPeriod: "YEARLY",
      appliedAt: "2026-09-27",
      notes: "",
    });
  });
});
