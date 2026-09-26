import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("tableau de bord", () => {
  it("s'intitule Tableau de bord", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Tableau de bord" }),
    ).toBeDefined();
  });

  it("présente la répartition des six statuts", () => {
    render(<Home />);
    const distribution = screen.getByRole("region", { name: "Répartition par statut" });

    for (const label of ["Brouillon", "Postulée", "Entretien", "Acceptée", "Refusée", "Classée"]) {
      expect(distribution.textContent).toContain(label);
    }
  });
});
