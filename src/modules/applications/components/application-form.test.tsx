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

  it("n'a qu'un bouton d'enregistrement, sans choix de statut", () => {
    render(<ApplicationForm action={noop} />);

    const submits = screen
      .getAllByRole("button")
      .filter((button) => button.getAttribute("type") === "submit");
    expect(submits.map((button) => button.textContent)).toEqual(["Enregistrer"]);
    expect(submits[0].getAttribute("name")).toBeNull();
  });

  it("propose la date du jour (Europe/Paris) comme date de candidature", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-27T23:30:00Z")); // déjà le 28 à Paris
    try {
      render(<ApplicationForm action={noop} />);

      expect(
        (screen.getByLabelText(/Date de candidature/) as HTMLInputElement).value,
      ).toBe("2026-09-28");
    } finally {
      vi.useRealTimers();
    }
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
