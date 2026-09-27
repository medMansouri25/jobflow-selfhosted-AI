import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Dashboard } from "@/modules/dashboard/components/dashboard";

const EMPTY = { DRAFT: 0, APPLIED: 0, INTERVIEW: 0, ACCEPTED: 0, REJECTED: 0, ARCHIVED: 0 };

describe("tableau de bord", () => {
  it("s'intitule Tableau de bord", () => {
    render(<Dashboard counts={EMPTY} recent={[]} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Tableau de bord" }),
    ).toBeDefined();
  });

  it("présente la répartition des six statuts", () => {
    render(<Dashboard counts={EMPTY} recent={[]} />);
    const distribution = screen.getByRole("region", { name: "Répartition par statut" });

    for (const label of ["Brouillon", "Postulée", "Entretien", "Acceptée", "Refusée", "Classée"]) {
      expect(distribution.textContent).toContain(label);
    }
  });

  it("compte les candidatures et les actives à partir des statuts", () => {
    render(
      <Dashboard
        counts={{ ...EMPTY, DRAFT: 2, APPLIED: 4, INTERVIEW: 5, REJECTED: 3, ARCHIVED: 2 }}
        recent={[]}
      />,
    );
    const kpis = screen.getByRole("region", { name: "Indicateurs" });

    expect(within(kpis).getByText("16")).toBeDefined();
    expect(within(kpis).getByText("11")).toBeDefined();
  });

  it("liste les candidatures récentes avec leur statut", () => {
    render(
      <Dashboard
        counts={{ ...EMPTY, APPLIED: 1 }}
        recent={[
          {
            id: "1",
            companyName: "Doctolib",
            jobTitle: "Platform Engineer",
            status: "APPLIED",
            updatedAt: new Date("2026-09-26T10:00:00Z"),
          },
        ]}
      />,
    );
    const recent = screen.getByRole("region", { name: "Candidatures récentes" });

    expect(within(recent).getByText("Doctolib")).toBeDefined();
    expect(within(recent).getByText("Postulée")).toBeDefined();
  });
});
