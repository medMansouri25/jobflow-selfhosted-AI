import { describe, expect, it } from "vitest";

import { createApplicationSchema, listApplicationsSchema } from "@/modules/applications/schemas";
import {
  countApplicationsByStatus,
  createApplication,
  getApplication,
  listApplications,
} from "@/modules/applications/service";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { createTestUser } from "@/test/database";

const TODAY = "2026-09-27";

function input(overrides: Record<string, string> = {}) {
  return createApplicationSchema(TODAY).parse({
    companyName: "Thales",
    jobTitle: "Dev Backend",
    location: "Paris",
    contractType: "CDI",
    source: "LINKEDIN",
    appliedAt: "2026-09-20",
    ...overrides,
  });
}

describe("service des candidatures", () => {
  it("crée une Candidature Postulée, son Entreprise et la première entrée d'historique (AC-001-01)", async () => {
    const user = await createTestUser();

    const created = await createApplication(user.id, input());
    const application = await getApplication(user.id, created.id);

    expect(application.status).toBe("APPLIED");
    expect(application.jobTitle).toBe("Dev Backend");
    expect(application.company.name).toBe("Thales");
    expect(
      application.statusChanges.map((c) => [c.fromStatus, c.toStatus]),
    ).toEqual([[null, "APPLIED"]]);
  });

  it("rattache la Candidature à l'Entreprise existante, sans tenir compte de la casse (AC-001-04)", async () => {
    const user = await createTestUser();

    const first = await createApplication(user.id, input({ companyName: "Capgemini" }));
    const second = await createApplication(
      user.id,
      input({ companyName: "  capgemini ", jobTitle: "Ingénieur DevOps" }),
    );

    const [a, b] = await Promise.all([
      getApplication(user.id, first.id),
      getApplication(user.id, second.id),
    ]);
    expect(b.company.id).toBe(a.company.id);
    expect(b.company.name).toBe("Capgemini");
  });

  it("AC-001-10 enregistre la date de candidature et le salaire", async () => {
    const user = await createTestUser();

    const created = await createApplication(
      user.id,
      input({
        salaryMin: "42000",
        salaryPeriod: "YEARLY",
      }),
    );
    const application = await getApplication(user.id, created.id);

    expect(application.status).toBe("APPLIED");
    expect(application.appliedAt?.toISOString().slice(0, 10)).toBe("2026-09-20");
    expect(application.salaryMin).toBe(42000);
    expect(application.salaryCurrency).toBe("EUR");
  });

  it("ne montre à un utilisateur que ses propres Candidatures", async () => {
    const me = await createTestUser();
    const someoneElse = await createTestUser();
    const created = await createApplication(someoneElse.id, input());

    await expect(getApplication(me.id, created.id)).rejects.toThrow(/introuvable/);
    expect((await listApplications(me.id, listApplicationsSchema.parse({}))).applications).toEqual([]);
  });

  it("AC-001-20 répond « introuvable » pour un identifiant bien formé mais inconnu", async () => {
    const user = await createTestUser();

    await expect(
      getApplication(user.id, "5d0f7a3e-9b1c-4c2d-8e4f-0a1b2c3d4e5f"),
    ).rejects.toThrow(NotFoundError);
  });

  it("répond « introuvable » pour un identifiant qui n'est pas un UUID (AC-001-20)", async () => {
    const user = await createTestUser();

    await expect(getApplication(user.id, "abc")).rejects.toThrow(NotFoundError);
  });

  it("liste les Candidatures les plus récemment modifiées en premier", async () => {
    const user = await createTestUser();
    await createApplication(user.id, input({ jobTitle: "Premier" }));
    await createApplication(user.id, input({ jobTitle: "Second" }));

    const titles = (await listApplications(user.id, listApplicationsSchema.parse({}))).applications.map(
      (a) => a.jobTitle,
    );

    expect(titles).toEqual(["Second", "Premier"]);
  });

  it("compte les Candidatures par statut", async () => {
    const user = await createTestUser();
    await createApplication(user.id, input());
    await createApplication(user.id, input({ jobTitle: "Autre poste" }));

    const counts = await countApplicationsByStatus(user.id);

    expect(counts).toEqual({ APPLIED: 2, INTERVIEW: 0, REJECTED: 0 });
  });

  it("refuse en base un statut retiré (Brouillon, Acceptée, Classée)", async () => {
    const user = await createTestUser();
    const created = await createApplication(user.id, input());

    await expect(
      db.$executeRaw`UPDATE "Application" SET status = 'DRAFT' WHERE id = ${created.id}::uuid`,
    ).rejects.toThrow();
  });
});
