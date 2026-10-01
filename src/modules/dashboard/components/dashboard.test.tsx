import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Dashboard } from "@/modules/dashboard/components/dashboard";
import { weeklyCounts } from "@/modules/dashboard/domain/stats";

const EMPTY = { APPLIED: 0, INTERVIEW: 0, REJECTED: 0 };
const NO_STATS = { responseRate: null, interviewRate: null, weeks: weeklyCounts([], "2026-10-07") };

describe("tableau de bord", () => {
  it("s'intitule Tableau de bord", () => {
    render(<Dashboard upcomingInterviews={[]} upcomingCount={0} stats={NO_STATS} counts={EMPTY} recent={[]} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Tableau de bord" }),
    ).toBeDefined();
  });

  it("présente la répartition des trois statuts, et d'aucun autre", () => {
    render(<Dashboard upcomingInterviews={[]} upcomingCount={0} stats={NO_STATS} counts={EMPTY} recent={[]} />);
    const distribution = screen.getByRole("region", { name: "Répartition par statut" });

    for (const label of ["Postulée", "Entretien", "Refusée"]) {
      expect(distribution.textContent).toContain(label);
    }
    for (const removed of ["Brouillon", "Acceptée", "Classée"]) {
      expect(distribution.textContent).not.toContain(removed);
    }
  });

  it("compte les candidatures et les entretiens, sans cartes « Actives » ni « Envoyées »", () => {
    render(
      <Dashboard upcomingInterviews={[]} upcomingCount={0} stats={NO_STATS}
        counts={{ ...EMPTY, APPLIED: 4, INTERVIEW: 5, REJECTED: 3 }}
        recent={[]}
      />,
    );
    const kpis = screen.getByRole("region", { name: "Indicateurs" });

    expect(within(kpis).getByText("Candidatures").parentElement?.textContent).toContain("12");
    expect(within(kpis).getByText("Entretiens").parentElement?.textContent).toContain("5");
    expect(screen.queryByText(/activ/i)).toBeNull();
    expect(screen.queryByText("Envoyées")).toBeNull();
  });

  it("liste les candidatures récentes avec leur statut", () => {
    render(
      <Dashboard upcomingInterviews={[]} upcomingCount={0} stats={NO_STATS}
        counts={{ ...EMPTY, APPLIED: 1 }}
        recent={[
          {
            id: "1",
            companyName: "Doctolib",
            jobTitle: "Platform Engineer",
            status: "APPLIED",
            updatedAt: new Date("2026-09-26T10:00:00Z"),
          },
        ]}
      />,
    );
    const recent = screen.getByRole("region", { name: "Candidatures récentes" });

    expect(within(recent).getByText("Doctolib")).toBeDefined();
    expect(within(recent).getByRole("link", { name: "Doctolib" }).getAttribute("href")).toBe(
      "/applications/1",
    );
    expect(within(recent).getByText("Postulée")).toBeDefined();
  });

  it("AC-002-01 affiche « — » pour les taux et 8 semaines à 0 sans aucune Candidature", () => {
    render(<Dashboard upcomingInterviews={[]} upcomingCount={0} stats={NO_STATS} counts={EMPTY} recent={[]} />);
    const kpis = screen.getByRole("region", { name: "Indicateurs" });
    const weeks = screen.getByRole("region", { name: "Candidatures par semaine" });

    expect(within(kpis).getByText("Taux de réponse").parentElement?.textContent).toContain("—");
    expect(within(kpis).getByText("Taux d'entretien").parentElement?.textContent).toContain("—");
    expect(within(weeks).getAllByRole("listitem")).toHaveLength(8);
    expect(within(weeks).getByText("Aucune candidature sur les 8 dernières semaines.")).toBeDefined();
  });

  it("AC-002-02 affiche les taux en pourcentage", () => {
    render(
      <Dashboard
        upcomingInterviews={[]}
        upcomingCount={0}
        stats={{ ...NO_STATS, responseRate: 50, interviewRate: 20 }}
        counts={{ ...EMPTY, APPLIED: 10, INTERVIEW: 4, REJECTED: 6 }}
        recent={[]}
      />,
    );
    const kpis = screen.getByRole("region", { name: "Indicateurs" });

    expect(within(kpis).getByText("Taux de réponse").parentElement?.textContent).toContain("50 %");
    expect(within(kpis).getByText("Taux d'entretien").parentElement?.textContent).toContain("20 %");
  });

  it("AC-002-05 nomme chaque semaine par son lundi, avec son nombre de Candidatures", () => {
    const weeks = weeklyCounts(["2026-10-05", "2026-10-04"], "2026-10-07");
    render(<Dashboard upcomingInterviews={[]} upcomingCount={0} stats={{ ...NO_STATS, weeks }} counts={EMPTY} recent={[]} />);
    const region = screen.getByRole("region", { name: "Candidatures par semaine" });

    expect(within(region).getByLabelText("Semaine du 5 oct. : 1 candidature")).toBeDefined();
    expect(within(region).getByLabelText("Semaine du 17 août : 0 candidature")).toBeDefined();
  });

  it("AC-003-07 liste les prochains entretiens et en donne le nombre dans l'en-tête", () => {
    render(
      <Dashboard
        stats={NO_STATS}
        counts={EMPTY}
        recent={[]}
        upcomingCount={7}
        upcomingInterviews={[
          {
            id: "i1",
            scheduledAt: new Date("2026-10-14T08:30:00Z"),
            type: "HR",
            format: "PHONE",
            application: { id: "a1", jobTitle: "Ingénieur", company: { name: "Airbus" } },
          },
        ]}
      />,
    );
    const panel = screen.getByRole("region", { name: "Prochains entretiens" });

    expect(within(panel).getByRole("link", { name: /Airbus/ }).getAttribute("href")).toBe("/applications/a1");
    expect(screen.getByText(/7 entretiens à venir/)).toBeDefined();
  });
});
