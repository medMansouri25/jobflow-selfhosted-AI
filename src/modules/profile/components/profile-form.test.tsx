import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ApplicationFormState } from "@/modules/applications/form-state";
import { ProfileForm } from "@/modules/profile/components/profile-form";

const noop = async (state: ApplicationFormState) => state;

describe("formulaire du profil", () => {
  it("AC-006-01 propose les champs courts et les six zones de texte, vides la première fois", () => {
    render(<ProfileForm action={noop} />);

    for (const label of [/Nom complet/, /Poste recherché/, /Localisation/, /E-mail/, /Téléphone/, /LinkedIn/]) {
      expect((screen.getByLabelText(label) as HTMLInputElement).value).toBe("");
    }
    for (const label of [/À propos de moi/, /Expériences/, /Projets/, /Compétences/, /Formations/, /Exemples de textes/]) {
      expect(screen.getByLabelText(label).tagName).toBe("TEXTAREA");
    }
  });

  it("se pré-remplit avec le profil enregistré", () => {
    render(<ProfileForm action={noop} initialValues={{ fullName: "Mohammed M.", skills: "TypeScript\nDocker" }} />);

    expect((screen.getByLabelText(/Nom complet/) as HTMLInputElement).value).toBe("Mohammed M.");
    expect((screen.getByLabelText(/Compétences/) as HTMLTextAreaElement).value).toBe("TypeScript\nDocker");
  });

  it("AC-006-04 affiche l'erreur sous le champ et garde la saisie", async () => {
    const rejecting = async (): Promise<ApplicationFormState> => ({
      status: "error",
      message: "Certains champs sont à corriger.",
      fieldErrors: { email: ["Adresse e-mail invalide"] },
      values: { email: "pas-un-email", fullName: "Mohammed M." },
    });
    render(<ProfileForm action={rejecting} />);

    fireEvent.submit(screen.getByRole("form", { name: "Profil" }));

    expect(await screen.findByText("Adresse e-mail invalide")).toBeDefined();
    expect((screen.getByLabelText(/Nom complet/) as HTMLInputElement).value).toBe("Mohammed M.");
  });

  it("AC-006-02 confirme l'enregistrement", async () => {
    const saving = async (): Promise<ApplicationFormState> => ({ status: "success", message: "Profil enregistré." });
    render(<ProfileForm action={saving} />);

    fireEvent.submit(screen.getByRole("form", { name: "Profil" }));

    expect(await screen.findByText("Profil enregistré.")).toBeDefined();
  });
});
