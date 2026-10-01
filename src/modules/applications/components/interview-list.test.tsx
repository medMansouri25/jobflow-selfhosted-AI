import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InterviewList, type InterviewListEntry } from "@/modules/applications/components/interview-list";

const ENTRY: InterviewListEntry = {
  id: "i1",
  scheduledAt: new Date("2026-10-14T08:30:00Z"),
  type: "TECHNICAL",
  format: "VIDEO",
  application: { id: "a1", jobTitle: "Ingénieur logiciel", company: { name: "Airbus" } },
};

describe("liste d'entretiens", () => {
  it("AC-003-07 montre la date et l'heure de Paris, le type, l'Entreprise et un lien vers la Candidature", () => {
    render(<InterviewList interviews={[ENTRY]} empty="Aucun" />);
    const item = screen.getByRole("listitem");

    expect(item.textContent).toContain("14 oct. 2026 · 10:30");
    expect(item.textContent).toContain("Technique");
    expect(screen.getByRole("link", { name: /Airbus/ }).getAttribute("href")).toBe("/applications/a1");
  });

  it("affiche le message fourni quand la liste est vide", () => {
    render(<InterviewList interviews={[]} empty="Aucun entretien prévu." />);

    expect(screen.getByText("Aucun entretien prévu.")).toBeDefined();
  });
});
