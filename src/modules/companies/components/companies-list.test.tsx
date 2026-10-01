import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CompaniesList } from "@/modules/companies/components/companies-list";

const COMPANY = {
  id: "c1",
  name: "Thales",
  website: null,
  total: 3,
  counts: { APPLIED: 1, INTERVIEW: 1, REJECTED: 1 },
  lastActivity: new Date("2026-09-30T10:00:00Z"),
};

describe("liste des entreprises", () => {
  it("montre chaque Entreprise avec un lien vers sa fiche et ses Candidatures par statut", () => {
    render(<CompaniesList companies={[COMPANY]} />);
    const row = screen.getByRole("row", { name: /Thales/ });

    expect(within(row).getByRole("link", { name: "Thales" }).getAttribute("href")).toBe("/companies/c1");
    expect(row.textContent).toContain("3");
    expect(row.textContent).toMatch(/1 Postulée/);
    expect(row.textContent).toMatch(/1 Entretien/);
    expect(row.textContent).toMatch(/1 Refusée/);
    expect(row.textContent).toContain("30 sept. 2026");
  });

  it("dit qu'il n'y a pas encore d'Entreprise", () => {
    render(<CompaniesList companies={[]} />);

    expect(screen.getByText(/Aucune entreprise pour l'instant/)).toBeDefined();
  });
});
