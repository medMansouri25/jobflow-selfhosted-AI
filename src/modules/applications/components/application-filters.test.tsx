import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApplicationFilters } from "@/modules/applications/components/application-filters";
import { listApplicationsSchema } from "@/modules/applications/schemas";

describe("barre de filtres de la liste", () => {
  it("envoie en GET vers la liste et reprend les filtres en cours", () => {
    render(
      <ApplicationFilters
        filters={listApplicationsSchema.parse({
          q: "thal",
          statut: ["APPLIED", "REJECTED"],
          contrat: "CDI",
          tri: "entreprise",
        })}
      />,
    );
    const form = screen.getByRole("search", { name: "Filtrer les candidatures" }) as HTMLFormElement;

    expect([form.getAttribute("method"), form.getAttribute("action")]).toEqual(["get", "/applications"]);
    expect((screen.getByLabelText(/Rechercher/) as HTMLInputElement).value).toBe("thal");
    expect((screen.getByLabelText("Postulée") as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText("Entretien") as HTMLInputElement).checked).toBe(false);
    expect((screen.getByLabelText("Refusée") as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText("Contrat") as HTMLSelectElement).value).toBe("CDI");
    expect((screen.getByLabelText("Source") as HTMLSelectElement).value).toBe("");
    expect((screen.getByLabelText("Trier par") as HTMLSelectElement).value).toBe("entreprise");
    expect(screen.getByRole("button", { name: "Filtrer" }).getAttribute("type")).toBe("submit");
    expect(screen.getByRole("link", { name: "Réinitialiser" }).getAttribute("href")).toBe("/applications");
  });
});
