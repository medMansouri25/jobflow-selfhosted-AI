import { describe, expect, it } from "vitest";

import { oldestWeekShown, rate, weeklyCounts } from "@/modules/dashboard/domain/stats";

describe("taux", () => {
  it("AC-002-02 arrondit le pourcentage : 10 réponses sur 20 → 50, 4 entretiens sur 20 → 20", () => {
    expect(rate(10, 20)).toBe(50);
    expect(rate(4, 20)).toBe(20);
  });

  it("AC-002-04 arrondit à l'unité la plus proche : 1 sur 3 → 33, 2 sur 3 → 67", () => {
    expect(rate(1, 3)).toBe(33);
    expect(rate(2, 3)).toBe(67);
  });

  it("AC-002-01 n'a pas de valeur sans aucune Candidature", () => {
    expect(rate(0, 0)).toBeNull();
  });
});

describe("candidatures par semaine", () => {
  // Mercredi 2026-10-07 : la semaine en cours commence le lundi 5 octobre.
  const TODAY = "2026-10-07";

  it("AC-002-05 montre 8 semaines du lundi, de la plus ancienne à la semaine en cours", () => {
    expect(weeklyCounts([], TODAY).map((week) => week.weekStart)).toEqual([
      "2026-08-17",
      "2026-08-24",
      "2026-08-31",
      "2026-09-07",
      "2026-09-14",
      "2026-09-21",
      "2026-09-28",
      "2026-10-05",
    ]);
    expect(oldestWeekShown(TODAY)).toBe("2026-08-17");
  });

  it("AC-002-01 garde les semaines sans Candidature, à 0", () => {
    expect(weeklyCounts([], TODAY).every((week) => week.count === 0)).toBe(true);
  });

  it("AC-002-05 range le lundi dans sa semaine, le dimanche dans la précédente, ignore ce qui est plus ancien", () => {
    const weeks = weeklyCounts(["2026-10-05", "2026-10-04", "2026-08-10"], TODAY);

    expect(weeks.at(-1)).toEqual({ weekStart: "2026-10-05", count: 1 });
    expect(weeks.at(-2)).toEqual({ weekStart: "2026-09-28", count: 1 });
    expect(weeks.reduce((sum, week) => sum + week.count, 0)).toBe(2);
  });

  it("commence la semaine en cours le jour même quand on est lundi", () => {
    expect(weeklyCounts([], "2026-10-05").at(-1)?.weekStart).toBe("2026-10-05");
  });
});
