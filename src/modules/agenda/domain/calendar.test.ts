import { describe, expect, it } from "vitest";

import { monthGrid, parseAgendaParams, shiftPeriod, weekDays } from "@/modules/agenda/domain/calendar";

describe("calendrier", () => {
  it("AC-004-01 donne les 7 jours, du lundi au dimanche, de la semaine d'un jour", () => {
    expect(weekDays("2026-10-14")).toEqual([
      "2026-10-12",
      "2026-10-13",
      "2026-10-14",
      "2026-10-15",
      "2026-10-16",
      "2026-10-17",
      "2026-10-18",
    ]);
    expect(weekDays("2026-10-18")[0]).toBe("2026-10-12");
  });

  it("AC-004-04 couvre le mois par semaines complètes, du lundi au dimanche", () => {
    const grid = monthGrid("2026-10-14");

    expect(grid).toHaveLength(5);
    expect(grid[0][0]).toBe("2026-09-28");
    expect(grid.at(-1)!.at(-1)).toBe("2026-11-01");
    expect(grid.every((week) => week.length === 7)).toBe(true);
  });

  it("donne 6 semaines quand le mois en a besoin (août 2026 commence un samedi)", () => {
    const grid = monthGrid("2026-08-01");

    expect([grid.length, grid[0][0], grid.at(-1)!.at(-1)]).toEqual([6, "2026-07-27", "2026-09-06"]);
  });

  it("AC-004-03 avance ou recule d'une semaine ou d'un mois", () => {
    expect(shiftPeriod("semaine", "2026-10-14", 1)).toBe("2026-10-21");
    expect(shiftPeriod("semaine", "2026-10-14", -1)).toBe("2026-10-07");
    expect(shiftPeriod("mois", "2026-10-14", 1)).toBe("2026-11-01");
    expect(shiftPeriod("mois", "2026-01-31", -1)).toBe("2025-12-01");
  });

  it("FR-004-06 lit la vue, la date et le jour choisi dans l'URL", () => {
    expect(parseAgendaParams({ vue: "mois", date: "2026-10-01", jour: "2026-10-14" }, "2026-09-30")).toEqual({
      view: "mois",
      date: "2026-10-01",
      day: "2026-10-14",
    });
  });

  it("AC-004-07 revient à la semaine en cours pour des paramètres invalides", () => {
    for (const params of [{ vue: "nimporte", date: "pas-une-date" }, { date: "2026-02-30" }, {}]) {
      expect(parseAgendaParams(params, "2026-10-14")).toEqual({ view: "semaine", date: "2026-10-14", day: undefined });
    }
    expect(parseAgendaParams({ vue: ["mois", "semaine"] }, "2026-10-14").view).toBe("mois");
  });
});
