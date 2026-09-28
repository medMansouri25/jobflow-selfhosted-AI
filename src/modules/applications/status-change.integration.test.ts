import { describe, expect, it } from "vitest";

import { InvalidTransitionError, NotFoundError } from "@/lib/errors";
import { createApplicationSchema } from "@/modules/applications/schemas";
import {
  changeApplicationStatus,
  createApplication,
  getApplication,
} from "@/modules/applications/service";
import { createTestUser } from "@/test/database";
import { createMemoryStorage } from "@/test/memory-storage";

async function applied(userId: string) {
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
    createMemoryStorage().storage,
  );
}

const transitions = async (userId: string, id: string) =>
  (await getApplication(userId, id)).statusChanges.map((c) => `${c.fromStatus ?? "—"} → ${c.toStatus}`);

describe("changement de statut", () => {
  it("AC-001-05 passe une Candidature Postulée en Entretien et l'inscrit dans l'historique", async () => {
    const user = await createTestUser();
    const created = await applied(user.id);
    const before = new Date();

    await changeApplicationStatus(user.id, created.id, "INTERVIEW");

    const application = await getApplication(user.id, created.id);
    expect(application.status).toBe("INTERVIEW");
    expect(await transitions(user.id, created.id)).toEqual(["APPLIED → INTERVIEW", "— → APPLIED"]);
    expect(application.statusChanges[0].changedAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
  });

  it("AC-001-06 refuse INTERVIEW → APPLIED côté serveur, sans rien enregistrer", async () => {
    const user = await createTestUser();
    const created = await applied(user.id);
    await changeApplicationStatus(user.id, created.id, "INTERVIEW");

    await expect(changeApplicationStatus(user.id, created.id, "APPLIED")).rejects.toThrow(
      new InvalidTransitionError(
        "Le statut a changé entre-temps (la candidature est maintenant Entretien). Recharge la page.",
      ),
    );
    expect((await getApplication(user.id, created.id)).status).toBe("INTERVIEW");
    expect(await transitions(user.id, created.id)).toHaveLength(2);
  });

  it("AC-001-08 refuse toute transition depuis une Candidature Refusée", async () => {
    const user = await createTestUser();
    const created = await applied(user.id);
    await changeApplicationStatus(user.id, created.id, "REJECTED");

    await expect(changeApplicationStatus(user.id, created.id, "APPLIED")).rejects.toThrow(InvalidTransitionError);
    await expect(changeApplicationStatus(user.id, created.id, "INTERVIEW")).rejects.toThrow(InvalidTransitionError);
    expect((await getApplication(user.id, created.id)).status).toBe("REJECTED");
  });

  it("onglet resté ouvert : la transition est revérifiée sur le statut en base et le message le nomme", async () => {
    const user = await createTestUser();
    const created = await applied(user.id);
    // Onglet A : la Candidature est marquée Refusée. Onglet B, pas rechargé, affiche encore « Passer en Entretien ».
    await changeApplicationStatus(user.id, created.id, "REJECTED");

    await expect(changeApplicationStatus(user.id, created.id, "INTERVIEW")).rejects.toThrow(
      "Le statut a changé entre-temps (la candidature est maintenant Refusée). Recharge la page.",
    );
  });

  it("répond « introuvable » pour la Candidature d'un autre utilisateur ou un id mal formé", async () => {
    const owner = await createTestUser();
    const intruder = await createTestUser();
    const created = await applied(owner.id);

    await expect(changeApplicationStatus(intruder.id, created.id, "INTERVIEW")).rejects.toThrow(NotFoundError);
    await expect(changeApplicationStatus(owner.id, "abc", "INTERVIEW")).rejects.toThrow(NotFoundError);
    expect((await getApplication(owner.id, created.id)).status).toBe("APPLIED");
  });
});

