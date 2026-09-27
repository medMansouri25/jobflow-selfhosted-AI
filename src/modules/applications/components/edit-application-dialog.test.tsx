import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ApplicationFormState } from "@/modules/applications/form-state";
import { EditApplicationDialog } from "@/modules/applications/components/edit-application-dialog";

const saving = async (): Promise<ApplicationFormState> => ({
  status: "success",
  message: "Candidature mise à jour.",
});

describe("fenêtre de modification d'une Candidature", () => {
  it("s'ouvre depuis « Modifier », pré-remplie, et se ferme après un enregistrement réussi", async () => {
    render(
      <EditApplicationDialog
        action={saving}
        companyName="Sanofi"
        initialValues={{ companyName: "Sanofi", jobTitle: "Ingénieur SI" }}
        attachments={[]}
      />,
    );
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Modifier" }));
    const dialog = screen.getByRole("dialog", { name: "Modifier — Sanofi" });
    expect((screen.getByLabelText(/Intitulé du poste/) as HTMLInputElement).value).toBe("Ingénieur SI");
    expect(dialog).toBeDefined();

    fireEvent.submit(screen.getByRole("form", { name: "Modifier la candidature" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("reste ouverte et affiche l'avertissement quand la modification est faite mais qu'un fichier reste à supprimer", async () => {
    const savedWithWarning = async (): Promise<ApplicationFormState> => ({
      status: "warning",
      message: "Candidature mise à jour. Le fichier « CV_v1.pdf » est resté sur UploadThing : supprime-le depuis ton tableau de bord UploadThing.",
    });
    render(
      <EditApplicationDialog action={savedWithWarning} companyName="Sanofi" initialValues={{}} attachments={[]} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Modifier" }));

    fireEvent.submit(screen.getByRole("form", { name: "Modifier la candidature" }));

    expect((await screen.findByRole("status")).textContent).toContain("CV_v1.pdf");
    expect(screen.getByRole("dialog")).toBeDefined();
  });
});

