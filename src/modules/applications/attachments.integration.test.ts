import { describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import { createApplicationSchema } from "@/modules/applications/schemas";
import { createApplication } from "@/modules/applications/service";
import { createTestUser } from "@/test/database";

async function createTestApplication(userId: string) {
  return createApplication(
    userId,
    createApplicationSchema("2026-09-28").parse({
      companyName: "Sanofi",
      jobTitle: "Ingénieur SI",
      location: "Le Mans",
      contractType: "CDI",
      source: "OTHER",
      appliedAt: "2026-09-27",
    }),
  );
}

function cv(userId: string, applicationId: string, fileKey = "key-cv") {
  return {
    userId,
    applicationId,
    kind: "CV" as const,
    fileKey,
    url: `https://example.ufs.sh/f/${fileKey}`,
    name: "CV_DevOps.pdf",
    size: 240_000,
  };
}

describe("pièces jointes en base", () => {
  it("sont supprimées avec leur Candidature (BR-001-13)", async () => {
    const user = await createTestUser();
    const application = await createTestApplication(user.id);
    await db.attachment.create({ data: cv(user.id, application.id) });

    await db.application.delete({ where: { id: application.id } });

    expect(await db.attachment.count()).toBe(0);
  });

  it("n'autorisent qu'un seul CV par Candidature", async () => {
    const user = await createTestUser();
    const application = await createTestApplication(user.id);
    await db.attachment.create({ data: cv(user.id, application.id, "key-1") });

    await expect(
      db.attachment.create({ data: cv(user.id, application.id, "key-2") }),
    ).rejects.toThrow();
  });
});
