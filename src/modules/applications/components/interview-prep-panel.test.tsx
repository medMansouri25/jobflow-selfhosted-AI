import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { FormState } from "@/lib/form-state";
import { InterviewPrepPanel } from "@/modules/applications/components/interview-prep-panel";

const noop = async (state: FormState) => state;

const PREP = {
  questions: [
    { question: "Parlez-moi d'un pipeline CI.", hints: ["Stage DevOps : GitLab CI", "Citer un incident résolu"] },
    { question: "Pourquoi Thales ?", hints: [] },
  ],
  highlights: ["Docker et Kubernetes"],
  questionsToAsk: ["Quels outils d'observabilité ?"],
};

describe("fiche de préparation sous un entretien", () => {
  it("FR-009-01 propose de préparer l'entretien avec l'IA", () => {
    render(<InterviewPrepPanel action={noop} prep={null} label="Entretien RH" />);

    expect(screen.getByRole("button", { name: "Préparer avec l'IA" })).toBeDefined();
    expect(screen.getByText(/envoyés à Google Gemini/)).toBeDefined();
  });

  it("AC-009-01 affiche les questions avec leurs pistes, les points à mettre en avant et les questions à poser", () => {
    render(<InterviewPrepPanel action={noop} prep={PREP} label="Entretien RH" />);

    expect(screen.getByText("Parlez-moi d'un pipeline CI.")).toBeDefined();
    expect(screen.getByText("Citer un incident résolu")).toBeDefined();
    expect(screen.getByText("Docker et Kubernetes")).toBeDefined();
    expect(screen.getByText("Quels outils d'observabilité ?")).toBeDefined();
    expect(screen.getByRole("button", { name: "Refaire la fiche" })).toBeDefined();
  });

  it("FR-009-04 mène à l'entraînement de l'entretien", () => {
    render(<InterviewPrepPanel action={noop} prep={null} label="Entretien RH" practiceHref="/interviews/i1/practice" />);

    expect(screen.getByRole("link", { name: "M'entraîner" }).getAttribute("href")).toBe("/interviews/i1/practice");
  });
});
