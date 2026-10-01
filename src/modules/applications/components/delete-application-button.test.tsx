import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { FormState } from "@/lib/form-state";
import { DeleteApplicationButton } from "@/modules/applications/components/delete-application-button";

function recording() {
  const calls: number[] = [];
  const action = async (state: FormState) => {
    calls.push(1);
    return state;
  };
  return { calls, action };
}

describe("bouton Supprimer de la fiche", () => {
  it("AC-001-13 demande confirmation en rappelant le poste et l'Entreprise ; Annuler ne supprime rien", async () => {
    const { calls, action } = recording();
    render(<DeleteApplicationButton action={action} jobTitle="Ingénieur SI" companyName="Sanofi" />);

    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog.textContent).toContain("« Ingénieur SI » chez Sanofi");
    expect(dialog.textContent).toContain("irréversible");

    fireEvent.click(within(dialog).getByRole("button", { name: "Annuler" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(calls).toEqual([]);
  });

  it("supprime après confirmation, et garde la fenêtre ouverte pour dire quel fichier reste chez UploadThing", async () => {
    const calls: number[] = [];
    const deletedWithWarning = async (): Promise<FormState> => {
      calls.push(1);
      return {
        status: "warning",
        message: "Candidature supprimée. Le fichier « CV.pdf » est resté sur UploadThing : supprime-le depuis ton tableau de bord UploadThing.",
      };
    };
    render(<DeleteApplicationButton action={deletedWithWarning} jobTitle="Ingénieur SI" companyName="Sanofi" />);
    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    const dialog = await screen.findByRole("alertdialog");

    fireEvent.click(within(dialog).getByRole("button", { name: "Supprimer" }));

    expect((await within(dialog).findByRole("status")).textContent).toContain("CV.pdf");
    expect(calls).toEqual([1]);
    expect(within(dialog).getByRole("link", { name: "Retour à la liste" }).getAttribute("href")).toBe("/applications");
  });
});

