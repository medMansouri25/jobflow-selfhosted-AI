import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ApplicationFormState } from "@/modules/applications/form-state";
import { ApplicationForm } from "@/modules/applications/components/application-form";

const noop = async (state: ApplicationFormState) => state;

describe("formulaire de candidature", () => {
  it("affiche les champs obligatoires étiquetés", () => {
    render(<ApplicationForm action={noop} />);

    expect(screen.getByLabelText(/Entreprise/)).toBeDefined();
    expect(screen.getByLabelText(/Intitulé du poste/)).toBeDefined();
  });

  it("enregistre en Brouillon ou directement comme Postulée selon le bouton choisi", () => {
    render(<ApplicationForm action={noop} />);

    const draft = screen.getByRole("button", { name: "Enregistrer en brouillon" });
    const applied = screen.getByRole("button", {
      name: "Enregistrer comme postulée",
    });
    expect([draft.getAttribute("name"), draft.getAttribute("value")]).toEqual([
      "status",
      "DRAFT",
    ]);
    expect([applied.getAttribute("name"), applied.getAttribute("value")]).toEqual([
      "status",
      "APPLIED",
    ]);
  });

  it("appelle onCancel quand on clique sur Annuler", () => {
    const onCancel = vi.fn();
    render(<ApplicationForm action={noop} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(onCancel).toHaveBeenCalledOnce();
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
