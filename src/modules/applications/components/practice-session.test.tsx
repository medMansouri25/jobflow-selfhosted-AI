import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PracticeSession } from "@/modules/applications/components/practice-session";

const QUESTIONS = ["Q1 ?", "Q2 ?", "Q3 ?", "Q4 ?", "Q5 ?"];
const FEEDBACK = { good: ["Réponse claire"], improve: ["Ajoute un exemple"], betterAnswer: "Pendant mon stage…" };

function actions() {
  return {
    start: vi.fn(async () => ({ ok: true as const, data: QUESTIONS })),
    feedback: vi.fn(async () => ({ ok: true as const, data: FEEDBACK })),
    debrief: vi.fn(async () => ({ ok: true as const, data: ["Point 1", "Point 2", "Point 3"] })),
  };
}

async function answer(text: string) {
  fireEvent.change(screen.getByLabelText("Ta réponse"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Envoyer ma réponse" }));
  await screen.findByText("Pendant mon stage…");
}

describe("séance d'entraînement", () => {
  it("AC-009-05 lance la séance et affiche la première question", async () => {
    const fake = actions();
    render(<PracticeSession {...fake} />);

    fireEvent.click(screen.getByRole("button", { name: "Commencer la séance" }));

    expect(await screen.findByText("Q1 ?")).toBeDefined();
    expect(screen.getByText("Question 1 / 5")).toBeDefined();
  });

  it("AC-009-06 affiche le retour sur la réponse, puis la question suivante", async () => {
    const fake = actions();
    render(<PracticeSession {...fake} />);
    fireEvent.click(screen.getByRole("button", { name: "Commencer la séance" }));
    await screen.findByText("Q1 ?");

    await answer("Je suis ingénieur.");

    expect(fake.feedback).toHaveBeenCalledWith("Q1 ?", "Je suis ingénieur.");
    expect(screen.getByText("Réponse claire")).toBeDefined();
    expect(screen.getByText("Ajoute un exemple")).toBeDefined();
    fireEvent.click(await screen.findByRole("button", { name: "Question suivante" }));
    expect(await screen.findByText("Q2 ?")).toBeDefined();
  });

  it("AC-009-07 fait le bilan après la 5ᵉ réponse et propose une nouvelle séance", async () => {
    const fake = actions();
    render(<PracticeSession {...fake} />);
    fireEvent.click(screen.getByRole("button", { name: "Commencer la séance" }));
    await screen.findByText("Q1 ?");

    for (let i = 0; i < 5; i++) {
      await answer(`Réponse ${i + 1}`);
      fireEvent.click(await screen.findByRole("button", { name: i < 4 ? "Question suivante" : "Voir le bilan" }));
      if (i < 4) await screen.findByText(QUESTIONS[i + 1]);
    }

    expect(await screen.findByText("Point 2")).toBeDefined();
    expect(fake.debrief).toHaveBeenCalledWith(
      QUESTIONS.map((question, i) => ({ question, answer: `Réponse ${i + 1}` })),
    );
    expect(screen.getByRole("button", { name: "Nouvelle séance" })).toBeDefined();
  });

  it("affiche le message d'erreur de l'assistant et permet de réessayer", async () => {
    const fake = actions();
    fake.start.mockResolvedValueOnce({ ok: false as const, message: "La limite gratuite est atteinte." } as never);
    render(<PracticeSession {...fake} />);

    fireEvent.click(screen.getByRole("button", { name: "Commencer la séance" }));

    expect(await screen.findByText("La limite gratuite est atteinte.")).toBeDefined();
    await waitFor(() =>
      expect((screen.getByRole("button", { name: "Commencer la séance" }) as HTMLButtonElement).disabled).toBe(false),
    );
  });
});
