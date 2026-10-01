import { describe, expect, it } from "vitest";
import { z } from "zod";

import { profileSchema } from "@/modules/profile/schemas";

describe("formulaire du profil", () => {
  it("accepte un profil vide : tous les champs sont facultatifs", () => {
    expect(profileSchema.parse({ fullName: "", email: " ", about: "" })).toEqual({});
  });

  it("garde les textes longs tels quels, retours à la ligne compris", () => {
    const experience = "Stage — Airbus\n- CI/CD\n- Tests";
    expect(profileSchema.parse({ experience }).experience).toBe(experience);
  });

  it("AC-006-04 refuse un e-mail ou un lien LinkedIn invalides, en nommant le champ", () => {
    const result = profileSchema.safeParse({ email: "pas-un-email", linkedinUrl: "linkedin.com/in/moi" });

    expect(result.success).toBe(false);
    const errors = z.flattenError(result.error!).fieldErrors;
    expect(errors.email).toEqual(["Adresse e-mail invalide"]);
    expect(errors.linkedinUrl).toEqual(["Lien http ou https attendu"]);
  });

  it("limite la longueur des champs (BR-006-03)", () => {
    expect(profileSchema.safeParse({ fullName: "x".repeat(201) }).success).toBe(false);
    expect(profileSchema.safeParse({ phone: "1".repeat(41) }).success).toBe(false);
    expect(profileSchema.safeParse({ about: "x".repeat(20_001) }).success).toBe(false);
    expect(profileSchema.safeParse({ about: "x".repeat(20_000) }).success).toBe(true);
  });
});
