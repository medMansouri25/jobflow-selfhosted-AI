import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { FormState } from "@/lib/form-state";
import { CoverLetterSection } from "@/modules/applications/components/cover-letter-section";

const noop = async (state: FormState) => state;

describe("section Lettre de motivation", () => {
  it("FR-008-05 rappelle ce qui part chez Google avant de rédiger", () => {
    render(<CoverLetterSection generateAction={noop} saveAction={noop} draft={null} hasPosting />);

    expect(screen.getByRole("button", { name: "Rédiger la lettre avec l'IA" })).toBeDefined();
    expect(screen.getByText(/seront envoyés à Google Gemini/)).toBeDefined();
    expect(screen.getByLabelText(/Consignes/)).toBeDefined();
  });

  it("BR-008-01 invite à coller l'annonce quand elle manque", () => {
    render(<CoverLetterSection generateAction={noop} saveAction={noop} draft={null} hasPosting={false} />);

    expect((screen.getByRole("button", { name: "Rédiger la lettre avec l'IA" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/Colle la description de l'annonce/)).toBeDefined();
  });

  it("AC-008-01 affiche le brouillon généré dans une zone modifiable", async () => {
    const generate = async (): Promise<FormState> => ({
      status: "success",
      message: "Brouillon rédigé.",
      values: { draft: "Mohammed M.\n\nMadame, Monsieur," },
    });
    render(<CoverLetterSection generateAction={generate} saveAction={noop} draft={null} hasPosting />);

    fireEvent.submit(screen.getByRole("form", { name: "Rédiger la lettre" }));

    await waitFor(() =>
      expect((screen.getByLabelText("Brouillon") as HTMLTextAreaElement).value).toBe("Mohammed M.\n\nMadame, Monsieur,"),
    );
    // Le libellé « Régénérer » n'apparaît qu'à la fin de la transition : on l'attend.
    expect(await screen.findByRole("button", { name: "Régénérer" })).toBeDefined();
  });

  it("AC-008-05 enregistre la version modifiée", async () => {
    const save = vi.fn(async (_state: FormState, formData: FormData): Promise<FormState> => ({
      status: "success",
      message: "Brouillon enregistré.",
      values: { draft: String(formData.get("draft")) },
    }));
    render(<CoverLetterSection generateAction={noop} saveAction={save} draft="Ancien" hasPosting />);

    fireEvent.change(screen.getByLabelText("Brouillon"), { target: { value: "Ma version" } });
    fireEvent.submit(screen.getByRole("form", { name: "Brouillon de lettre" }));

    expect(await screen.findByText("Brouillon enregistré.")).toBeDefined();
    expect(save.mock.calls[0][1].get("draft")).toBe("Ma version");
  });

  it("FR-008-04 copie le brouillon tel qu'il est affiché", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CoverLetterSection generateAction={noop} saveAction={noop} draft="Ma lettre" hasPosting />);

    fireEvent.change(screen.getByLabelText("Brouillon"), { target: { value: "Ma lettre corrigée" } });
    fireEvent.click(screen.getByRole("button", { name: "Copier" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("Ma lettre corrigée"));
    expect(await screen.findByRole("button", { name: "Copié !" })).toBeDefined();
  });

  it("sélectionne le texte et le dit quand la copie est impossible", async () => {
    Object.assign(navigator, { clipboard: undefined });
    render(<CoverLetterSection generateAction={noop} saveAction={noop} draft="Ma lettre" hasPosting />);

    fireEvent.click(screen.getByRole("button", { name: "Copier" }));

    expect(await screen.findByText(/Copie impossible/)).toBeDefined();
  });
});
