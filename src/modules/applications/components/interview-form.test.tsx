import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ApplicationFormState } from "@/modules/applications/form-state";
import { InterviewForm } from "@/modules/applications/components/interview-form";

const noop = async (state: ApplicationFormState) => state;

describe("formulaire d'Entretien", () => {
  it("demande la date et l'heure, le type et le format, puis les champs facultatifs", () => {
    render(<InterviewForm action={noop} />);

    const date = screen.getByLabelText(/Date et heure/) as HTMLInputElement;
    expect([date.type, date.name]).toEqual(["datetime-local", "scheduledAt"]);
    for (const label of [/^Type/, /^Format/, /Lieu ou lien/, /Interlocuteur/, /Préparation/, /Compte rendu/]) {
      expect(screen.getByLabelText(label)).toBeDefined();
    }
  });

  it("se pré-remplit avec un Entretien existant", () => {
    render(
      <InterviewForm
        action={noop}
        label="Modifier l'entretien"
        initialValues={{ scheduledAt: "2026-10-14T10:30", interviewer: "Julie Martin", debrief: "Bien" }}
      />,
    );

    expect(screen.getByRole("form", { name: "Modifier l'entretien" })).toBeDefined();
    expect((screen.getByLabelText(/Date et heure/) as HTMLInputElement).value).toBe("2026-10-14T10:30");
    expect((screen.getByLabelText(/Interlocuteur/) as HTMLInputElement).value).toBe("Julie Martin");
    expect((screen.getByLabelText(/Compte rendu/) as HTMLTextAreaElement).value).toBe("Bien");
  });

  it("AC-003-04 affiche l'erreur du serveur sous le champ et garde la saisie", async () => {
    const rejecting = async (): Promise<ApplicationFormState> => ({
      status: "error",
      message: "Certains champs sont à corriger.",
      fieldErrors: { type: ["Le type est obligatoire"] },
      values: { interviewer: "Julie Martin" },
    });
    render(<InterviewForm action={rejecting} />);

    fireEvent.submit(screen.getByRole("form", { name: "Nouvel entretien" }));

    expect(await screen.findByText("Le type est obligatoire")).toBeDefined();
    expect((screen.getByLabelText(/Interlocuteur/) as HTMLInputElement).value).toBe("Julie Martin");
  });

  it("appelle onCancel sur « Annuler »", () => {
    const onCancel = vi.fn();
    render(<InterviewForm action={noop} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
