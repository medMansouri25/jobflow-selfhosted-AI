import { describe, expect, it } from "vitest";

import { parisLocalToUtc, utcToParisLocal } from "@/lib/dates";

describe("heure de Paris ↔ instant UTC", () => {
  it("AC-003-05 10 h 30 en été (UTC+2) est 8 h 30 UTC", () => {
    expect(parisLocalToUtc("2026-10-14T10:30").toISOString()).toBe("2026-10-14T08:30:00.000Z");
  });

  it("AC-003-05 10 h 30 en hiver (UTC+1) est 9 h 30 UTC", () => {
    expect(parisLocalToUtc("2026-12-01T10:30").toISOString()).toBe("2026-12-01T09:30:00.000Z");
  });

  it("garde l'heure juste autour du passage à l'heure d'hiver (25 octobre 2026)", () => {
    expect(parisLocalToUtc("2026-10-24T23:30").toISOString()).toBe("2026-10-24T21:30:00.000Z");
    expect(parisLocalToUtc("2026-10-25T04:00").toISOString()).toBe("2026-10-25T03:00:00.000Z");
  });

  it("décale d'une heure une heure qui n'existe pas (28 mars 2027, 2 h 30) et prend la seconde d'une heure doublée", () => {
    expect(utcToParisLocal(parisLocalToUtc("2027-03-28T02:30"))).toBe("2027-03-28T03:30");
    expect(parisLocalToUtc("2026-10-25T02:30").toISOString()).toBe("2026-10-25T01:30:00.000Z");
  });

  it("AC-003-05 réaffiche l'heure saisie, en été comme en hiver", () => {
    for (const local of ["2026-10-14T10:30", "2026-12-01T10:30", "2027-03-28T09:00"]) {
      expect(utcToParisLocal(parisLocalToUtc(local))).toBe(local);
    }
  });
});
