import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
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

  it("ne fige pas de date dans le HTML pré-rendu (la page est statique, rendue au build)", () => {
    const html = renderToString(<ApplicationForm action={noop} />);
    const dateInput = html.match(/<input[^>]*name="appliedAt"[^>]*>/)?.[0];

    expect(dateInput).toBeDefined();
    expect(dateInput).not.toMatch(/value="\d{4}-/);
  });

  it("propose d'y joindre le CV et la lettre de motivation en PDF", () => {
    render(<ApplicationForm action={noop} />);

    for (const [label, name] of [
      [/^CV/, "cv"],
      [/^Lettre de motivation/, "coverLetter"],
    ] as const) {
      const input = screen.getByLabelText(label) as HTMLInputElement;
      expect([input.type, input.name, input.accept]).toEqual(["file", name, "application/pdf"]);
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
