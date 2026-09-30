import { describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import { findOrCreateCompany, listCompanyNames } from "@/modules/companies/service";
import { createTestUser } from "@/test/database";

describe("Entreprises", () => {
  it("FR-001-04 propose les noms des Entreprises de l'utilisateur, de A à Z", async () => {
    const user = await createTestUser();
    const someoneElse = await createTestUser();
    for (const name of ["Thales", "airbus", "Capgemini"]) await findOrCreateCompany(db, user.id, name);
    await findOrCreateCompany(db, someoneElse.id, "Pas à moi");

    expect(await listCompanyNames(user.id)).toEqual(["airbus", "Capgemini", "Thales"]);
  });
});
