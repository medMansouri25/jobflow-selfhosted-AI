import { describe, expect, it } from "vitest";

import { createApplicationSchema } from "@/modules/applications/schemas";
import {
  changeApplicationStatus,
  createApplication,
  getApplicationStats,
} from "@/modules/applications/service";
import { createTestUser } from "@/test/database";

const TODAY = "2026-10-07";

async function apply(userId: string, appliedAt = "2026-10-01") {
  const input = createApplicationSchema(TODAY).parse({
    companyName: "Thales",
    jobTitle: "Dev Backend",
    location: "Paris",
    contractType: "CDI",
    source: "LINKEDIN",
    appliedAt,
  });
  return createApplication(userId, input);
}

describe("statistiques des candidatures", () => {
  it("AC-002-03 compte une Candidature refusée après un entretien comme réponse et comme entretien", async () => {
    const user = await createTestUser();
    const interviewedThenRejected = await apply(user.id);
    await changeApplicationStatus(user.id, interviewedThenRejected.id, "INTERVIEW");
    await changeApplicationStatus(user.id, interviewedThenRejected.id, "REJECTED");
    await apply(user.id);

    const stats = await getApplicationStats(user.id, "2026-08-17");

    expect([stats.total, stats.responded, stats.interviewed]).toEqual([2, 1, 1]);
  });

  it("AC-002-02 ne compte pas un refus direct comme entretien", async () => {
    const user = await createTestUser();
    const rejected = await apply(user.id);
    await changeApplicationStatus(user.id, rejected.id, "REJECTED");
    const interviewing = await apply(user.id);
    await changeApplicationStatus(user.id, interviewing.id, "INTERVIEW");
    await apply(user.id);

    const stats = await getApplicationStats(user.id, "2026-08-17");

    expect([stats.total, stats.responded, stats.interviewed]).toEqual([3, 2, 1]);
  });

  it("AC-002-05 ne renvoie que les dates de candidature depuis la plus ancienne semaine affichée", async () => {
    const user = await createTestUser();
    await apply(user.id, "2026-10-05");
    await apply(user.id, "2026-08-17");
    await apply(user.id, "2026-08-16");

    const stats = await getApplicationStats(user.id, "2026-08-17");

    expect(stats.appliedDates.toSorted()).toEqual(["2026-08-17", "2026-10-05"]);
    expect(stats.total).toBe(3);
  });

  it("AC-002-06 ignore les Candidatures d'un autre utilisateur", async () => {
    const user = await createTestUser();
    const other = await createTestUser();
    const foreign = await apply(other.id);
    await changeApplicationStatus(other.id, foreign.id, "INTERVIEW");

    const stats = await getApplicationStats(user.id, "2026-08-17");

    expect(stats).toEqual({ total: 0, responded: 0, interviewed: 0, appliedDates: [] });
  });
});
