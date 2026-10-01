import { describe, expect, it } from "vitest";

import { createApplicationSchema } from "@/modules/applications/schemas";
import { interviewSchema } from "@/modules/applications/interview-schemas";
import { addInterview } from "@/modules/applications/interviews";
import { listInterviewsByDay } from "@/modules/applications/interview-lists";
import { createApplication } from "@/modules/applications/service";
import { createTestUser } from "@/test/database";

async function applicationOf(userId: string) {
  return createApplication(
    userId,
    createApplicationSchema("2026-10-01").parse({
      companyName: "Airbus",
      jobTitle: "Ingénieur",
      location: "Paris",
      contractType: "CDI",
      source: "LINKEDIN",
      appliedAt: "2026-09-20",
    }),
  );
}

const at = (scheduledAt: string, type = "HR") => interviewSchema.parse({ scheduledAt, type, format: "VIDEO" });

describe("entretiens de l'agenda", () => {
  it("AC-004-02 range les Entretiens d'une période par jour, par heure croissante", async () => {
    const user = await createTestUser();
    const application = await applicationOf(user.id);
    await addInterview(user.id, application.id, at("2026-10-14T14:00", "MANAGER"));
    await addInterview(user.id, application.id, at("2026-10-14T09:00", "HR"));
    await addInterview(user.id, application.id, at("2026-10-19T09:00"));

    const byDay = await listInterviewsByDay(user.id, "2026-10-12", "2026-10-18");

    expect(Object.keys(byDay)).toEqual(["2026-10-14"]);
    expect(byDay["2026-10-14"].map((i) => i.type)).toEqual(["HR", "MANAGER"]);
    expect(byDay["2026-10-14"][0].application.company.name).toBe("Airbus");
  });

  it("AC-004-06 range un Entretien à 0 h 30 (heure de Paris) le jour même, pas la veille", async () => {
    const user = await createTestUser();
    const application = await applicationOf(user.id);
    await addInterview(user.id, application.id, at("2026-10-15T00:30"));
    await addInterview(user.id, application.id, at("2026-10-18T23:30"));

    const byDay = await listInterviewsByDay(user.id, "2026-10-12", "2026-10-18");

    expect(Object.keys(byDay).toSorted()).toEqual(["2026-10-15", "2026-10-18"]);
  });

  it("AC-004-08 ignore les Entretiens d'un autre utilisateur", async () => {
    const user = await createTestUser();
    const other = await createTestUser();
    const foreign = await applicationOf(other.id);
    await addInterview(other.id, foreign.id, at("2026-10-14T10:00"));

    expect(await listInterviewsByDay(user.id, "2026-10-12", "2026-10-18")).toEqual({});
  });
});
