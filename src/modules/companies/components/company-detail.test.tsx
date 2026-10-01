import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CompanyDetail } from "@/modules/companies/components/company-detail";

const COMPANY = {
  id: "c1",
  name: "Thales",
  applications: [{ id: "a1", jobTitle: "Ingénieur DevOps", status: "INTERVIEW" as const, appliedAt: new Date("2026-09-16T00:00:00Z") }],
  interviews: [
    {
      id: "i1",
      scheduledAt: new Date("2026-10-16T12:00:00Z"),
      type: "TECHNICAL" as const,
      format: "VIDEO" as const,
      location: "https://meet.google.com/abc-defg-hij",
      application: { id: "a1", jobTitle: "Ingénieur DevOps", company: { name: "Thales" } },
    },
  ],
};

describe("fiche d'une entreprise", () => {
  it("liste ses Candidatures avec un lien vers chacune", () => {
    render(<CompanyDetail company={COMPANY} />);
    const applications = screen.getByRole("region", { name: "Candidatures (1)" });

    expect(within(applications).getByRole("link", { name: "Ingénieur DevOps" }).getAttribute("href")).toBe(
      "/applications/a1",
    );
    expect(applications.textContent).toContain("Entretien");
    expect(applications.textContent).toContain("Postulée le 16 sept. 2026");
  });

  it("liste ses Entretiens avec le bouton pour rejoindre la visio", () => {
    render(<CompanyDetail company={COMPANY} />);
    const interviews = screen.getByRole("region", { name: "Entretiens (1)" });

    expect(interviews.textContent).toContain("16 oct. 2026 · 14:00");
    expect(within(interviews).getByRole("link", { name: "Rejoindre sur Google Meet" })).toBeDefined();
  });

  it("dit quand il n'y a ni Candidature ni Entretien", () => {
    render(<CompanyDetail company={{ ...COMPANY, applications: [], interviews: [] }} />);

    expect(screen.getByText("Aucune candidature chez cette entreprise.")).toBeDefined();
    expect(screen.getByText("Aucun entretien avec cette entreprise.")).toBeDefined();
  });
});
