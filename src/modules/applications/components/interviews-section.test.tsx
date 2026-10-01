import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  InterviewsSection,
  type InterviewItem,
} from "@/modules/applications/components/interviews-section";

function interview(overrides: Partial<InterviewItem> = {}): InterviewItem {
  return {
    id: "a2f0c9e4-3b1d-4c5e-8f6a-7b8c9d0e1f2a",
    scheduledAt: new Date("2026-10-14T08:30:00Z"),
    type: "TECHNICAL",
    format: "VIDEO",
    location: null,
    interviewer: null,
    preparation: null,
    debrief: null,
    aiPreparation: null,
    ...overrides,
  };
}

const ADD = <button type="button">Ajouter un entretien</button>;

describe("section Entretiens de la fiche", () => {
  it("AC-003-05 affiche la date et l'heure de Paris, le type et le format", () => {
    render(<InterviewsSection status="INTERVIEW" interviews={[interview()]} add={ADD} />);
    const item = screen.getByRole("listitem");

    expect(item.textContent).toContain("14 oct. 2026");
    expect(item.textContent).toContain("10:30");
    expect(item.textContent).toContain("Technique");
    expect(item.textContent).toContain("Visio");
  });

  it("FR-003-04 garde l'ordre reçu (date croissante) et montre interlocuteur, préparation et compte rendu en texte brut", () => {
    render(
      <InterviewsSection
        status="INTERVIEW"
        add={ADD}
        interviews={[
          interview({ id: "1", type: "HR", interviewer: "Julie Martin, RH", preparation: "<b>Pitch</b>" }),
          interview({ id: "2", type: "MANAGER", scheduledAt: new Date("2026-10-20T12:00:00Z"), debrief: "Très bien" }),
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");

    expect(items.map((item) => within(item).getByText(/^(RH|Manager)$/).textContent)).toEqual(["RH", "Manager"]);
    expect(items[0].textContent).toContain("Julie Martin, RH");
    expect(within(items[0]).getByText("<b>Pitch</b>")).toBeDefined();
    expect(items[1].textContent).toContain("Très bien");
  });

  it("rend cliquable un lien http(s), jamais un autre texte", () => {
    render(
      <InterviewsSection
        status="INTERVIEW"
        add={ADD}
        interviews={[
          interview({ id: "1", location: "https://meet.google.com/abc-defg-hij" }),
          interview({ id: "2", location: "javascript:alert(1)" }),
        ]}
      />,
    );

    const link = screen.getByRole("link", { name: "https://meet.google.com/abc-defg-hij" });
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("AC-003-03 ne propose pas d'ajouter un entretien à une Candidature Refusée", () => {
    render(<InterviewsSection status="REJECTED" interviews={[]} add={ADD} />);

    expect(screen.queryByRole("button", { name: "Ajouter un entretien" })).toBeNull();
  });

  it("propose d'ajouter un entretien, avec un message quand il n'y en a pas encore", () => {
    render(<InterviewsSection status="APPLIED" interviews={[]} add={ADD} />);

    expect(screen.getByRole("button", { name: "Ajouter un entretien" })).toBeDefined();
    expect(screen.getByText(/Aucun entretien pour l'instant/)).toBeDefined();
  });
});
