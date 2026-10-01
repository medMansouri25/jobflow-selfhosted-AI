import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { InterviewListEntry } from "@/modules/applications/components/interview-list";
import { Agenda } from "@/modules/agenda/components/agenda";

function entry(id: string, scheduledAt: string, overrides: Partial<InterviewListEntry> = {}): InterviewListEntry {
  return {
    id,
    scheduledAt: new Date(scheduledAt),
    type: "HR",
    format: "VIDEO",
    location: null,
    application: { id: `a-${id}`, jobTitle: "Ingénieur", company: { name: "Airbus" } },
    ...overrides,
  };
}

// Mercredi 14 octobre 2026 : 9 h et 14 h à Paris (UTC+2).
const BY_DAY = {
  "2026-10-14": [
    entry("1", "2026-10-14T07:00:00Z"),
    entry("2", "2026-10-14T12:00:00Z", {
      type: "MANAGER",
      location: "https://meet.google.com/abc-defg-hij",
      application: { id: "a-2", jobTitle: "Dev", company: { name: "Thales" } },
    }),
  ],
};

describe("agenda", () => {
  it("AC-004-02 vue semaine : les 7 jours, les Entretiens sous leur jour par heure croissante", () => {
    render(<Agenda view="semaine" date="2026-10-14" today="2026-10-14" byDay={BY_DAY} />);
    const days = screen.getAllByRole("listitem").filter((item) => item.dataset.day);

    expect(days.map((day) => day.dataset.day)).toEqual([
      "2026-10-12",
      "2026-10-13",
      "2026-10-14",
      "2026-10-15",
      "2026-10-16",
      "2026-10-17",
      "2026-10-18",
    ]);
    const wednesday = days[2];
    expect(wednesday.textContent).toMatch(/09:00.*Airbus.*14:00.*Thales/);
    expect(wednesday.getAttribute("aria-current")).toBe("date");
  });

  it("FR-004-07 propose de rejoindre la visio depuis l'agenda", () => {
    render(<Agenda view="semaine" date="2026-10-14" today="2026-10-14" byDay={BY_DAY} />);

    expect(screen.getByRole("link", { name: "Rejoindre sur Google Meet" }).getAttribute("href")).toBe(
      "https://meet.google.com/abc-defg-hij",
    );
    expect(screen.getByRole("link", { name: /Thales/ }).getAttribute("href")).toBe("/applications/a-2");
  });

  it("AC-004-03 mène à la période précédente, à aujourd'hui, à la suivante, et à l'autre vue", () => {
    render(<Agenda view="semaine" date="2026-10-14" today="2026-10-14" byDay={{}} />);
    const href = (name: string) => screen.getByRole("link", { name }).getAttribute("href");

    expect(href("Précédent")).toBe("/agenda?vue=semaine&date=2026-10-07");
    expect(href("Suivant")).toBe("/agenda?vue=semaine&date=2026-10-21");
    expect(href("Aujourd'hui")).toBe("/agenda");
    expect(href("Mois")).toBe("/agenda?vue=mois&date=2026-10-14");
  });

  it("AC-004-04 vue mois : semaines complètes et pastille du nombre d'Entretiens", () => {
    render(<Agenda view="mois" date="2026-10-01" today="2026-10-14" byDay={BY_DAY} />);
    const grid = screen.getByRole("grid", { name: "Octobre 2026" });

    expect(within(grid).getAllByRole("gridcell")).toHaveLength(35);
    expect(within(grid).getByRole("link", { name: "mer. 14 oct. : 2 entretiens" }).getAttribute("href")).toBe(
      "/agenda?vue=mois&date=2026-10-01&jour=2026-10-14",
    );
    expect(within(grid).getByRole("link", { name: "lun. 28 sept. : aucun entretien" })).toBeDefined();
  });

  it("AC-004-05 vue mois : le jour choisi affiche ses Entretiens sous la grille", () => {
    render(<Agenda view="mois" date="2026-10-01" day="2026-10-14" today="2026-10-14" byDay={BY_DAY} />);
    const selected = screen.getByRole("region", { name: "mercredi 14 octobre" });

    expect(within(selected).getAllByRole("listitem")).toHaveLength(2);
  });
});
