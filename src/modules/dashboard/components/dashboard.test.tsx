import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Dashboard } from "@/modules/dashboard/components/dashboard";

const EMPTY = { APPLIED: 0, INTERVIEW: 0, REJECTED: 0 };

describe("tableau de bord", () => {
  it("s'intitule Tableau de bord", () => {
    render(<Dashboard counts={EMPTY} recent={[]} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Tableau de bord" }),
    ).toBeDefined();
  });

  it("présente la répartition des trois statuts, et d'aucun autre", () => {
    render(<Dashboard counts={EMPTY} recent={[]} />);
    const distribution = screen.getByRole("region", { name: "Répartition par statut" });

    for (const label of ["Postulée", "Entretien", "Refusée"]) {
      expect(distribution.textContent).toContain(label);
    }
    for (const removed of ["Brouillon", "Acceptée", "Classée"]) {
      expect(distribution.textContent).not.toContain(removed);
    }
  });

  it("compte les candidatures et les entretiens, sans cartes « Actives » ni « Envoyées »", () => {
    render(
      <Dashboard
        counts={{ ...EMPTY, APPLIED: 4, INTERVIEW: 5, REJECTED: 3 }}
        recent={[]}
      />,
    );
    const kpis = screen.getByRole("region", { name: "Indicateurs" });

    expect(within(kpis).getByText("Candidatures").parentElement?.textContent).toContain("12");
    expect(within(kpis).getByText("Entretiens").parentElement?.textContent).toContain("5");
    expect(screen.queryByText(/activ/i)).toBeNull();
    expect(screen.queryByText("Envoyées")).toBeNull();
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
