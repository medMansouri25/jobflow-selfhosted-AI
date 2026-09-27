import { describe, expect, it } from "vitest";

import { toColumns, toFormValues } from "@/modules/applications/form-values";
import { createApplicationSchema } from "@/modules/applications/schemas";

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

  it("fait l'aller-retour saisie → colonnes → formulaire sans rien perdre (date et champs vides compris)", () => {
    const typed = {
      companyName: "Sanofi",
      jobTitle: "Ingénieur SI",
      location: "Le Mans",
      contractType: "CDI",
      source: "OTHER",
      jobUrl: "",
      jobDescription: "Missions",
      salaryMin: "42000",
      salaryMax: "",
      salaryCurrency: "EUR",
      salaryPeriod: "YEARLY",
      appliedAt: "2026-09-27",
      notes: "",
    };

    const columns = toColumns(createApplicationSchema("2026-09-28").parse(typed));

    expect(toFormValues({ ...columns, company: { name: typed.companyName } })).toEqual(typed);
  });
});

