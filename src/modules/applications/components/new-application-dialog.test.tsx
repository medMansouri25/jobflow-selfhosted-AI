import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ApplicationFormState } from "@/modules/applications/form-state";
import { NewApplicationDialog } from "@/modules/applications/components/new-application-dialog";

const noop = async (state: ApplicationFormState) => state;

describe("fenêtre de nouvelle candidature", () => {
  it("s'ouvre depuis le bouton Nouvelle candidature et se ferme avec Annuler", () => {
    render(<NewApplicationDialog action={noop} />);
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Nouvelle candidature/ }));
    expect(screen.getByRole("dialog", { name: "Nouvelle candidature" })).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("se ferme après un enregistrement réussi", async () => {
    const savingAction = async (): Promise<ApplicationFormState> => ({
      status: "success",
      message: "Candidature enregistrée.",
    });
    render(<NewApplicationDialog action={savingAction} />);
    fireEvent.click(screen.getByRole("button", { name: /Nouvelle candidature/ }));

    fireEvent.submit(screen.getByRole("form", { name: "Nouvelle candidature" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("reste ouverte quand le serveur renvoie une erreur", async () => {
    const rejectingAction = async (): Promise<ApplicationFormState> => ({
      status: "error",
      message: "Certains champs sont à corriger.",
    });
    render(<NewApplicationDialog action={rejectingAction} />);
    fireEvent.click(screen.getByRole("button", { name: /Nouvelle candidature/ }));

    fireEvent.submit(screen.getByRole("form", { name: "Nouvelle candidature" }));

    expect(await screen.findByText("Certains champs sont à corriger.")).toBeDefined();
    expect(screen.getByRole("dialog")).toBeDefined();
  });
});
