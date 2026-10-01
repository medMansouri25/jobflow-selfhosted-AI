import { describe, expect, it } from "vitest";
import { z } from "zod";

import { interviewSchema } from "@/modules/applications/interview-schemas";

const VALID = { scheduledAt: "2026-10-14T10:30", type: "TECHNICAL", format: "VIDEO" };

describe("formulaire d'Entretien", () => {
  it("AC-003-05 convertit la date et l'heure de Paris en instant UTC", () => {
    const result = interviewSchema.parse(VALID);

    expect(result.scheduledAt.toISOString()).toBe("2026-10-14T08:30:00.000Z");
    expect([result.type, result.format]).toEqual(["TECHNICAL", "VIDEO"]);
  });

  it("AC-003-04 refuse un Entretien sans date, sans type ou sans format, en nommant le champ", () => {
    const result = interviewSchema.safeParse({ scheduledAt: "", type: "", format: "" });

    expect(result.success).toBe(false);
    const errors = z.flattenError(result.error!).fieldErrors;
    expect(errors.scheduledAt).toEqual(["La date et l'heure sont obligatoires"]);
    expect(errors.type).toEqual(["Le type est obligatoire"]);
    expect(errors.format).toEqual(["Le format est obligatoire"]);
  });

  it("traite les champs facultatifs vides comme absents et limite leur longueur", () => {
    expect(interviewSchema.parse({ ...VALID, location: " ", interviewer: "" })).toMatchObject({
      location: undefined,
      interviewer: undefined,
    });
    expect(interviewSchema.safeParse({ ...VALID, interviewer: "x".repeat(201) }).success).toBe(false);
    expect(interviewSchema.safeParse({ ...VALID, location: "x".repeat(501) }).success).toBe(false);
  });

  it("refuse une date mal formée", () => {
    expect(interviewSchema.safeParse({ ...VALID, scheduledAt: "14/10/2026 10:30" }).success).toBe(false);
  });
});
