import { describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { interviewSchema } from "@/modules/applications/interview-schemas";
import { addInterview } from "@/modules/applications/interviews";
import { createApplicationSchema } from "@/modules/applications/schemas";
import { changeApplicationStatus, createApplication } from "@/modules/applications/service";
import { getCompanyOverview, listCompanyOverviews } from "@/modules/companies/overview";
import { createTestUser } from "@/test/database";

async function apply(userId: string, companyName: string, jobTitle = "Ingénieur") {
  return createApplication(
    userId,
    createApplicationSchema("2026-10-01").parse({
      companyName,
      jobTitle,
      location: "Paris",
      contractType: "CDI",
      source: "LINKEDIN",
      appliedAt: "2026-09-20",
    }),
  );
}

describe("vue des entreprises", () => {
  it("liste les Entreprises avec le nombre de Candidatures par statut, la plus récemment active d'abord", async () => {
    const user = await createTestUser();
    const thales = await apply(user.id, "Thales");
    await changeApplicationStatus(user.id, thales.id, "REJECTED");
    await apply(user.id, "Airbus", "Dev");
    await apply(user.id, "Airbus", "DevOps");

    const companies = await listCompanyOverviews(user.id);

    expect(companies.map((c) => [c.name, c.total, c.counts])).toEqual([
      ["Airbus", 2, { APPLIED: 2, INTERVIEW: 0, REJECTED: 0 }],
      ["Thales", 1, { APPLIED: 0, INTERVIEW: 0, REJECTED: 1 }],
    ]);
  });

  it("garde une Entreprise dont toutes les Candidatures ont été supprimées, à 0", async () => {
    const user = await createTestUser();
    const application = await apply(user.id, "Capgemini");
    await db.application.delete({ where: { id: application.id } });

    expect((await listCompanyOverviews(user.id)).map((c) => [c.name, c.total, c.lastActivity])).toEqual([
      ["Capgemini", 0, null],
    ]);
  });

  it("donne la fiche d'une Entreprise : ses Candidatures et leurs Entretiens", async () => {
    const user = await createTestUser();
    const application = await apply(user.id, "Thales", "Ingénieur DevOps");
    await addInterview(
      user.id,
      application.id,
      interviewSchema.parse({ scheduledAt: "2026-10-14T10:30", type: "HR", format: "PHONE" }),
    );
    const [company] = await listCompanyOverviews(user.id);

    const overview = await getCompanyOverview(user.id, company.id);

    expect(overview.name).toBe("Thales");
    expect(overview.applications.map((a) => [a.jobTitle, a.status, a.interviews.length])).toEqual([
      ["Ingénieur DevOps", "INTERVIEW", 1],
    ]);
  });

  it("ignore les Entreprises d'un autre utilisateur et traite leur fiche comme introuvable", async () => {
    const user = await createTestUser();
    const other = await createTestUser();
    await apply(other.id, "Thales");
    const [foreign] = await listCompanyOverviews(other.id);

    expect(await listCompanyOverviews(user.id)).toEqual([]);
    for (const id of [foreign.id, crypto.randomUUID(), "pas-un-uuid"]) {
      await expect(getCompanyOverview(user.id, id)).rejects.toBeInstanceOf(NotFoundError);
    }
  });
});
