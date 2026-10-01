import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { FormState } from "@/lib/form-state";
import { JobAnalysisSection } from "@/modules/applications/components/job-analysis-section";

const noop = async (state: FormState) => state;

const ANALYSIS = {
  summary: "Poste DevOps orienté CI/CD.",
  skills: {
    technical: [
      { name: "Kubernetes", required: true, inProfile: true },
      { name: "Terraform", required: false, inProfile: false },
    ],
    soft: [{ name: "Travail en équipe", required: true, inProfile: false }],
  },
  strengths: ["Stage DevOps"],
  questionsToPrepare: ["Parlez-nous d'un pipeline."],
  questionsToAsk: ["Quelle est la taille de l'équipe ?"],
};

describe("section Analyse de l'annonce", () => {
  it("FR-007-06 propose d'analyser, avec le rappel de ce qui part chez Google", () => {
    render(<JobAnalysisSection action={noop} analysis={null} hasPosting />);

    expect(screen.getByRole("button", { name: "Analyser l'annonce" })).toBeDefined();
    expect(screen.getByText(/seront envoyés à Google Gemini/)).toBeDefined();
  });

  it("BR-007-01 invite à coller l'annonce quand elle manque", () => {
    render(<JobAnalysisSection action={noop} analysis={null} hasPosting={false} />);

    expect((screen.getByRole("button", { name: "Analyser l'annonce" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("AC-007-01 affiche les cinq rubriques et propose de relancer", () => {
    render(<JobAnalysisSection action={noop} analysis={ANALYSIS} hasPosting />);

    for (const heading of ["En bref", "Compétences demandées pour le poste", "Tes atouts pour ce poste", "Questions à préparer", "Questions à poser"]) {
      expect(screen.getByRole("heading", { name: heading })).toBeDefined();
    }
    expect(screen.getByText("Poste DevOps orienté CI/CD.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Relancer l'analyse" })).toBeDefined();
  });

  it("AC-007-02 sépare techniques et savoir-être, avec obligatoire / souhaitée et dans ton profil / à renforcer", () => {
    render(<JobAnalysisSection action={noop} analysis={ANALYSIS} hasPosting />);

    const technical = screen.getByRole("list", { name: "Compétences techniques" });
    const [kubernetes, terraform] = within(technical).getAllByRole("listitem");
    expect(kubernetes.textContent).toMatch(/Kubernetes.*Obligatoire.*Dans ton profil/);
    expect(terraform.textContent).toMatch(/Terraform.*Souhaitée.*À renforcer/);
    const soft = screen.getByRole("list", { name: "Savoir-être" });
    expect(within(soft).getByRole("listitem").textContent).toMatch(/Travail en équipe.*Obligatoire.*À renforcer/);
  });
});
