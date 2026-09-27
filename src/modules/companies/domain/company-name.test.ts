import { describe, expect, it } from "vitest";

import { normalizeCompanyName } from "@/modules/companies/domain/company-name";

describe("nom d'Entreprise normalisé (BR-001-11)", () => {
  it.each([
    ["Capgemini", "capgemini"],
    ["  capgemini  ", "capgemini"],
    ["Société  Générale", "société générale"],
  ])("« %s » devient « %s »", (input, expected) => {
    expect(normalizeCompanyName(input)).toBe(expected);
  });
});
