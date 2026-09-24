import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ApplicationFormState } from "@/modules/applications/form-state";
import { ApplicationForm } from "@/modules/applications/components/application-form";

const noop = async (state: ApplicationFormState) => state;

describe("formulaire de candidature", () => {
  it("démarre en Brouillon avec les champs obligatoires étiquetés", () => {
    render(<ApplicationForm action={noop} />);

    expect(screen.getByLabelText(/Entreprise/)).toBeDefined();
    expect(screen.getByLabelText(/Intitulé du poste/)).toBeDefined();
    expect(
      (screen.getByRole("radio", { name: /Brouillon/ }) as HTMLInputElement)
        .checked,
    ).toBe(true);
  });

  it("affiche l'erreur renvoyée par le serveur sous le champ et conserve la saisie", async () => {
    const rejectingAction = async (): Promise<ApplicationFormState> => ({
      status: "error",
      message: "Certains champs sont à corriger.",
      fieldErrors: { jobTitle: ["L'intitulé du poste est obligatoire"] },
      values: { companyName: "Thales" },
    });
    render(<ApplicationForm action={rejectingAction} />);

    fireEvent.submit(screen.getByRole("form", { name: "Nouvelle candidature" }));

    expect(
      await screen.findByText("L'intitulé du poste est obligatoire"),
    ).toBeDefined();
    expect(
      (screen.getByLabelText(/Entreprise/) as HTMLInputElement).value,
    ).toBe("Thales");
  });
});
