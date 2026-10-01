import { describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import { DomainError, NotFoundError } from "@/lib/errors";
import { createApplicationSchema } from "@/modules/applications/schemas";
import { interviewSchema } from "@/modules/applications/interview-schemas";
import {
  addInterview,
  deleteInterview,
  updateInterview,
} from "@/modules/applications/interviews";
import {
  changeApplicationStatus,
  createApplication,
  deleteApplication,
  getApplication,
} from "@/modules/applications/service";
import { createMemoryStorage } from "@/test/memory-storage";
import { createTestUser } from "@/test/database";

async function apply(userId: string) {
  const input = createApplicationSchema("2026-10-01").parse({
    companyName: "Airbus",
    jobTitle: "Ingénieur logiciel",
    location: "Toulouse",
    contractType: "CDI",
    source: "LINKEDIN",
    appliedAt: "2026-09-20",
  });
  return createApplication(userId, input);
}

const interview = (overrides: Record<string, string> = {}) =>
  interviewSchema.parse({ scheduledAt: "2026-10-14T10:30", type: "TECHNICAL", format: "VIDEO", ...overrides });

const history = async (userId: string, id: string) =>
  (await getApplication(userId, id)).statusChanges.map((c) => [c.fromStatus, c.toStatus]);

describe("entretiens", () => {
  it("AC-003-01 ajoute l'Entretien et passe la Candidature Postulée en Entretien, historique compris", async () => {
    const user = await createTestUser();
    const application = await apply(user.id);

    await addInterview(user.id, application.id, interview({ interviewer: "Julie Martin, RH" }));

    const saved = await getApplication(user.id, application.id);
    expect(saved.status).toBe("INTERVIEW");
    // Historique du plus récent au plus ancien, comme sur la fiche.
    expect(await history(user.id, application.id)).toEqual([
      ["APPLIED", "INTERVIEW"],
      [null, "APPLIED"],
    ]);
    expect(saved.interviews.map((i) => [i.type, i.format, i.interviewer, i.scheduledAt.toISOString()])).toEqual([
      ["TECHNICAL", "VIDEO", "Julie Martin, RH", "2026-10-14T08:30:00.000Z"],
    ]);
  });

  it("AC-003-02 liste les Entretiens par date sans retoucher le statut d'une Candidature déjà en Entretien", async () => {
    const user = await createTestUser();
    const application = await apply(user.id);
    await addInterview(user.id, application.id, interview({ scheduledAt: "2026-10-20T14:00", type: "MANAGER" }));
    await addInterview(user.id, application.id, interview({ scheduledAt: "2026-10-14T10:30", type: "HR" }));

    const saved = await getApplication(user.id, application.id);
    expect(saved.interviews.map((i) => i.type)).toEqual(["HR", "MANAGER"]);
    expect(await history(user.id, application.id)).toHaveLength(2);
  });

  it("AC-003-03 refuse un Entretien sur une Candidature Refusée", async () => {
    const user = await createTestUser();
    const application = await apply(user.id);
    await changeApplicationStatus(user.id, application.id, "REJECTED");

    await expect(addInterview(user.id, application.id, interview())).rejects.toBeInstanceOf(DomainError);
    expect(await db.interview.count()).toBe(0);
  });

  it("AC-003-06 modifie puis supprime un Entretien sans changer le statut", async () => {
    const user = await createTestUser();
    const application = await apply(user.id);
    const added = await addInterview(user.id, application.id, interview());

    await updateInterview(user.id, added.id, interview({ type: "FINAL", debrief: "Bon feeling" }));
    expect(await db.interview.findUniqueOrThrow({ where: { id: added.id } })).toMatchObject({
      type: "FINAL",
      debrief: "Bon feeling",
      location: null,
    });

    await deleteInterview(user.id, added.id);
    const saved = await getApplication(user.id, application.id);
    expect(saved.interviews).toEqual([]);
    expect(saved.status).toBe("INTERVIEW");
  });

  it("AC-003-09 traite l'Entretien d'un autre utilisateur ou un identifiant inconnu comme introuvable", async () => {
    const owner = await createTestUser();
    const intruder = await createTestUser();
    const application = await apply(owner.id);
    const added = await addInterview(owner.id, application.id, interview());

    for (const id of [added.id, crypto.randomUUID(), "pas-un-uuid"]) {
      await expect(updateInterview(intruder.id, id, interview())).rejects.toBeInstanceOf(NotFoundError);
      await expect(deleteInterview(intruder.id, id)).rejects.toBeInstanceOf(NotFoundError);
    }
    await expect(addInterview(intruder.id, application.id, interview())).rejects.toBeInstanceOf(NotFoundError);
    expect(await db.interview.count()).toBe(1);
  });

  it("AC-003-10 supprime les Entretiens avec leur Candidature", async () => {
    const user = await createTestUser();
    const application = await apply(user.id);
    await addInterview(user.id, application.id, interview());

    await deleteApplication(user.id, application.id, createMemoryStorage().storage);

    expect(await db.interview.count()).toBe(0);
  });
});
