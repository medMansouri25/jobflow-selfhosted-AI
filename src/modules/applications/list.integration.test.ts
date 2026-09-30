import { describe, expect, it } from "vitest";

import { createApplicationSchema, listApplicationsSchema } from "@/modules/applications/schemas";
import {
  changeApplicationStatus,
  createApplication,
  listApplications,
} from "@/modules/applications/service";
import { createTestUser } from "@/test/database";
import { createMemoryStorage } from "@/test/memory-storage";

const storage = createMemoryStorage().storage;

async function add(userId: string, fields: Record<string, string> = {}) {
  return createApplication(
    userId,
    createApplicationSchema("2026-09-30").parse({
      companyName: "Sanofi",
      jobTitle: "Ingénieur SI",
      location: "Le Mans",
      contractType: "CDI",
      source: "OTHER",
      appliedAt: "2026-09-27",
      ...fields,
    }),
    storage,
  );
}

const list = (userId: string, params: Record<string, unknown> = {}) =>
  listApplications(userId, listApplicationsSchema.parse(params));

const titles = (result: Awaited<ReturnType<typeof list>>) => result.applications.map((a) => a.jobTitle);

describe("liste des Candidatures", () => {
  it("AC-001-14 affiche toutes les Candidatures, Refusées comprises", async () => {
    const user = await createTestUser();
    await add(user.id, { jobTitle: "A" });
    await add(user.id, { jobTitle: "B" });
    const rejected = await add(user.id, { jobTitle: "C" });
    await changeApplicationStatus(user.id, rejected.id, "REJECTED");

    const result = await list(user.id);

    expect(titles(result).sort()).toEqual(["A", "B", "C"]);
    expect([result.total, result.page, result.pages]).toEqual([3, 1, 1]);
  });

  it("AC-001-15 filtre sur un statut, ou sur plusieurs à la fois", async () => {
    const user = await createTestUser();
    await add(user.id, { jobTitle: "Postulée" });
    const interview = await add(user.id, { jobTitle: "Entretien" });
    await changeApplicationStatus(user.id, interview.id, "INTERVIEW");
    const rejected = await add(user.id, { jobTitle: "Refusée" });
    await changeApplicationStatus(user.id, rejected.id, "REJECTED");

    expect(titles(await list(user.id, { statut: "REJECTED" }))).toEqual(["Refusée"]);
    expect(titles(await list(user.id, { statut: ["APPLIED", "INTERVIEW"] })).sort()).toEqual(["Entretien", "Postulée"]);
  });

  it("filtre sur le type de contrat et la source", async () => {
    const user = await createTestUser();
    await add(user.id, { jobTitle: "CDI LinkedIn", contractType: "CDI", source: "LINKEDIN" });
    await add(user.id, { jobTitle: "Stage LinkedIn", contractType: "INTERNSHIP", source: "LINKEDIN" });
    await add(user.id, { jobTitle: "CDI École", contractType: "CDI", source: "SCHOOL" });

    expect(titles(await list(user.id, { contrat: "CDI", source: "LINKEDIN" }))).toEqual(["CDI LinkedIn"]);
  });

  it("AC-001-16 cherche sans casse dans l'Entreprise, le poste et la localisation", async () => {
    const user = await createTestUser();
    await add(user.id, { companyName: "Thales", jobTitle: "Dev" });
    await add(user.id, { companyName: "Airbus", jobTitle: "Dev" });
    await add(user.id, { companyName: "Orange", jobTitle: "Ingénieur Thalassa" });
    await add(user.id, { companyName: "Capgemini", jobTitle: "Ops", location: "Lyon" });

    const companies = async (q: string) =>
      (await list(user.id, { q })).applications.map((a) => a.company.name).sort();
    expect(await companies("thal")).toEqual(["Orange", "Thales"]);
    expect(await companies("LYON")).toEqual(["Capgemini"]);
  });

  it("traite %, _ et ' comme du texte, sans erreur", async () => {
    const user = await createTestUser();
    await add(user.id, { jobTitle: "Remise 100%" });
    await add(user.id, { jobTitle: "Poste normal" });
    await add(user.id, { jobTitle: "Chef d'équipe" });

    expect(titles(await list(user.id, { q: "%" }))).toEqual(["Remise 100%"]);
    expect(titles(await list(user.id, { q: "_" }))).toEqual([]);
    expect(titles(await list(user.id, { q: "d'é" }))).toEqual(["Chef d'équipe"]);
  });

  it("trie par dernière modification (défaut), date de candidature ou Entreprise", async () => {
    const user = await createTestUser();
    await add(user.id, { companyName: "Beta", jobTitle: "B", appliedAt: "2026-09-01" });
    await add(user.id, { companyName: "alpha", jobTitle: "A", appliedAt: "2026-09-20" });
    await add(user.id, { companyName: "Gamma", jobTitle: "G", appliedAt: "2026-09-10" });

    expect(titles(await list(user.id))).toEqual(["G", "A", "B"]);
    expect(titles(await list(user.id, { tri: "candidature" }))).toEqual(["A", "G", "B"]);
    expect(titles(await list(user.id, { tri: "entreprise" }))).toEqual(["A", "B", "G"]);
  });

  it("AC-001-21 pagine par 25 et ramène une page trop grande à la dernière", async () => {
    const user = await createTestUser();
    for (let i = 1; i <= 30; i++) await add(user.id, { jobTitle: `Poste ${i}` });

    const first = await list(user.id);
    const second = await list(user.id, { page: "2" });
    const tooFar = await list(user.id, { page: "99" });

    expect([first.applications.length, first.total, first.pages]).toEqual([25, 30, 2]);
    expect([second.applications.length, second.page]).toEqual([5, 2]);
    expect(tooFar.page).toBe(2);
  });

  it("ne liste que les Candidatures de l'utilisateur", async () => {
    const me = await createTestUser();
    const someoneElse = await createTestUser();
    await add(someoneElse.id, { jobTitle: "Pas à moi" });

    expect((await list(me.id)).total).toBe(0);
  });
});

