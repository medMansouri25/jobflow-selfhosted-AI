import { describe, expect, it } from "vitest";

import { createApplicationSchema } from "@/modules/applications/schemas";
import {
  countApplicationsByStatus,
  createApplication,
  getApplication,
  listApplications,
} from "@/modules/applications/service";
import { createTestUser } from "@/test/database";

const TODAY = "2026-09-27";

function input(overrides: Record<string, string> = {}) {
  return createApplicationSchema(TODAY).parse({
    status: "DRAFT",
    companyName: "Thales",
    jobTitle: "Dev Backend",
    ...overrides,
  });
}

describe("service des candidatures", () => {
  it("crée un Brouillon, son Entreprise et la première entrée d'historique (AC-001-01)", async () => {
    const user = await createTestUser();

    const created = await createApplication(user.id, input());
    const application = await getApplication(user.id, created.id);

    expect(application.status).toBe("DRAFT");
    expect(application.jobTitle).toBe("Dev Backend");
    expect(application.company.name).toBe("Thales");
    expect(
      application.statusChanges.map((c) => [c.fromStatus, c.toStatus]),
    ).toEqual([[null, "DRAFT"]]);
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

  it("enregistre une Candidature Postulée avec sa date de candidature", async () => {
    const user = await createTestUser();

    const created = await createApplication(
      user.id,
      input({
        status: "APPLIED",
        appliedAt: "2026-09-20",
        location: "Paris",
        contractType: "CDI",
        source: "LINKEDIN",
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
    expect(await listApplications(me.id)).toEqual([]);
  });

  it("liste les Candidatures les plus récemment modifiées en premier", async () => {
    const user = await createTestUser();
    await createApplication(user.id, input({ jobTitle: "Premier" }));
    await createApplication(user.id, input({ jobTitle: "Second" }));

    const titles = (await listApplications(user.id)).map((a) => a.jobTitle);

    expect(titles).toEqual(["Second", "Premier"]);
  });

  it("compte les Candidatures par statut", async () => {
    const user = await createTestUser();
    await createApplication(user.id, input());
    await createApplication(user.id, input({ jobTitle: "Autre brouillon" }));

    const counts = await countApplicationsByStatus(user.id);

    expect(counts).toEqual({
      DRAFT: 2,
      APPLIED: 0,
      INTERVIEW: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      ARCHIVED: 0,
    });
  });
});
