import { describe, expect, it } from "vitest";

import { createApplicationSchema } from "@/modules/applications/schemas";
import { interviewSchema } from "@/modules/applications/interview-schemas";
import { addInterview } from "@/modules/applications/interviews";
import { listInterviews, listUpcomingInterviews } from "@/modules/applications/interview-lists";
import { createApplication } from "@/modules/applications/service";
import { createTestUser } from "@/test/database";

const NOW = new Date("2026-10-10T12:00:00Z");

async function applyAt(userId: string, companyName: string) {
  return createApplication(
    userId,
    createApplicationSchema("2026-10-01").parse({
      companyName,
      jobTitle: "Ingénieur",
      location: "Paris",
      contractType: "CDI",
      source: "LINKEDIN",
      appliedAt: "2026-09-20",
    }),
  );
}

async function interviewOn(userId: string, applicationId: string, scheduledAt: string) {
  return addInterview(userId, applicationId, interviewSchema.parse({ scheduledAt, type: "HR", format: "PHONE" }));
}

describe("listes d'entretiens", () => {
  it("AC-003-07 renvoie les 5 prochains, du plus proche au plus lointain, avec leur Candidature et Entreprise", async () => {
    const user = await createTestUser();
    const airbus = await applyAt(user.id, "Airbus");
    const thales = await applyAt(user.id, "Thales");
    for (const day of ["2026-10-20", "2026-10-11", "2026-10-15", "2026-10-13", "2026-10-30", "2026-10-12", "2026-10-25"]) {
      await interviewOn(user.id, day < "2026-10-14" ? airbus.id : thales.id, `${day}T10:00`);
    }
    await interviewOn(user.id, airbus.id, "2026-10-01T10:00");
    await interviewOn(user.id, airbus.id, "2026-10-09T10:00");

    const upcoming = await listUpcomingInterviews(user.id, NOW, 5);

    expect(upcoming.map((i) => i.scheduledAt.toISOString().slice(0, 10))).toEqual([
      "2026-10-11",
      "2026-10-12",
      "2026-10-13",
      "2026-10-15",
      "2026-10-20",
    ]);
    expect(upcoming[0].application.company.name).toBe("Airbus");
    expect(upcoming[3].application.company.name).toBe("Thales");
  });

  it("AC-003-08 sépare les à venir (plus proche d'abord) et les passés (plus récent d'abord)", async () => {
    const user = await createTestUser();
    const application = await applyAt(user.id, "Airbus");
    for (const at of ["2026-10-20T10:00", "2026-10-01T10:00", "2026-10-11T10:00", "2026-10-09T10:00"]) {
      await interviewOn(user.id, application.id, at);
    }

    const { upcoming, past } = await listInterviews(user.id, NOW);

    expect(upcoming.map((i) => i.scheduledAt.toISOString().slice(0, 10))).toEqual(["2026-10-11", "2026-10-20"]);
    expect(past.map((i) => i.scheduledAt.toISOString().slice(0, 10))).toEqual(["2026-10-09", "2026-10-01"]);
  });

  it("ignore les Entretiens d'un autre utilisateur", async () => {
    const user = await createTestUser();
    const other = await createTestUser();
    const foreign = await applyAt(other.id, "Airbus");
    await interviewOn(other.id, foreign.id, "2026-10-11T10:00");

    expect(await listUpcomingInterviews(user.id, NOW, 5)).toEqual([]);
    expect(await listInterviews(user.id, NOW)).toEqual({ upcoming: [], past: [] });
  });
});
