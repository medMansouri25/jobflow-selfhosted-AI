import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ApplicationFormState } from "@/modules/applications/form-state";
import {
  AddInterviewDialog,
  DeleteInterviewButton,
  EditInterviewDialog,
} from "@/modules/applications/components/interview-dialogs";

const success = async (): Promise<ApplicationFormState> => ({ status: "success", message: "OK" });

describe("fenêtres d'Entretien", () => {
  it("FR-003-01 ouvre « Ajouter un entretien » et se ferme après un enregistrement réussi", async () => {
    render(<AddInterviewDialog action={success} />);

    fireEvent.click(screen.getByRole("button", { name: "Ajouter un entretien" }));
    fireEvent.submit(screen.getByRole("form", { name: "Nouvel entretien" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("FR-003-02 pré-remplit la modification", () => {
    render(
      <EditInterviewDialog action={success} label="Entretien RH" initialValues={{ interviewer: "Julie Martin" }} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Modifier : Entretien RH" }));

    expect((screen.getByLabelText(/Interlocuteur/) as HTMLInputElement).value).toBe("Julie Martin");
  });

  it("FR-003-03 demande confirmation avant de supprimer, puis se ferme", async () => {
    render(<DeleteInterviewButton action={success} label="Entretien Technique du mer. 14 oct." />);

    fireEvent.click(screen.getByRole("button", { name: "Supprimer : Entretien Technique du mer. 14 oct." }));
    expect(screen.getByRole("alertdialog").textContent).toContain("Entretien Technique du mer. 14 oct.");
    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });
});
