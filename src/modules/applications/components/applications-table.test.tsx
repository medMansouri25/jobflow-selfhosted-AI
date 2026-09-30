import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApplicationsTable } from "@/modules/applications/components/applications-table";

describe("tableau des candidatures", () => {
  it("affiche un état vide quand il n'y a aucune candidature", () => {
    render(<ApplicationsTable applications={[]} />);

    expect(screen.getByText("Aucune candidature pour l'instant")).toBeDefined();
  });

  it("affiche chaque candidature avec ses libellés français", () => {
    render(
      <ApplicationsTable
        applications={[
          {
            id: "1",
            companyName: "OVHcloud",
            jobTitle: "Cloud Engineer",
            location: "Roubaix",
            contractType: "CDI",
            source: "WELCOME_TO_THE_JUNGLE",
            appliedAt: new Date("2026-09-12T00:00:00Z"),
            status: "INTERVIEW",
          },
        ]}
      />,
    );
    const row = screen.getByRole("row", { name: /OVHcloud/ });

    expect(within(row).getByText("Cloud Engineer")).toBeDefined();
    expect(within(row).getByText("Welcome to the Jungle")).toBeDefined();
    expect(within(row).getByText("Entretien")).toBeDefined();
  });

  it("mène à la fiche de chaque candidature depuis le nom de l'Entreprise", () => {
    render(
      <ApplicationsTable
        applications={[
          {
            id: "3aca6b3f-d33c-4971-8de8-5ac19f8db9ab",
            companyName: "Sanofi",
            jobTitle: "Ingénieur SI",
            location: "Le Mans",
            contractType: "CDI",
            source: "OTHER",
            appliedAt: new Date("2026-09-27T00:00:00Z"),
            status: "APPLIED",
          },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Sanofi" }).getAttribute("href")).toBe(
      "/applications/3aca6b3f-d33c-4971-8de8-5ac19f8db9ab",
    );
  });

  it("dit qu'aucune candidature ne correspond aux filtres, et propose de les réinitialiser", () => {
    render(<ApplicationsTable applications={[]} filtered />);

    expect(screen.getByText("Aucune candidature ne correspond.")).toBeDefined();
    expect(screen.getByRole("link", { name: "Réinitialiser les filtres" }).getAttribute("href")).toBe("/applications");
    expect(screen.queryByText("Aucune candidature pour l'instant")).toBeNull();
  });
});

