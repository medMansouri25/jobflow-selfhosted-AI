import { describe, expect, it, vi } from "vitest";

import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { createApplicationSchema } from "@/modules/applications/schemas";
import {
  changeApplicationStatus,
  createApplication,
  deleteApplication,
} from "@/modules/applications/service";
import { createTestUser } from "@/test/database";
import { createMemoryStorage } from "@/test/memory-storage";

function input(extra: Record<string, unknown> = {}) {
  return createApplicationSchema("2026-09-30").parse({
    companyName: "Sanofi",
    jobTitle: "Ingénieur SI",
    location: "Le Mans",
    contractType: "CDI",
    source: "OTHER",
    appliedAt: "2026-09-27",
    ...extra,
  });
}

describe("suppression d'une Candidature", () => {
  it("AC-001-12 supprime la Candidature et ses 3 entrées d'historique ; son Entreprise reste", async () => {
    const user = await createTestUser();
    const { storage } = createMemoryStorage();
    const created = await createApplication(user.id, input(), storage);
    await changeApplicationStatus(user.id, created.id, "INTERVIEW");
    await changeApplicationStatus(user.id, created.id, "REJECTED");
    expect(await db.applicationStatusChange.count({ where: { applicationId: created.id } })).toBe(3);

    await deleteApplication(user.id, created.id, storage);

    expect(await db.application.count({ where: { id: created.id } })).toBe(0);
    expect(await db.applicationStatusChange.count({ where: { applicationId: created.id } })).toBe(0);
    expect(await db.company.count({ where: { userId: user.id, name: "Sanofi" } })).toBe(1);
  });

  it("supprime aussi les fichiers des pièces jointes au stockage", async () => {
    const user = await createTestUser();
    const { storage, files } = createMemoryStorage();
    const created = await createApplication(
      user.id,
      input({ cv: pdf("CV.pdf"), coverLetter: pdf("Lettre.pdf") }),
      storage,
    );
    expect(files.size).toBe(2);

    const { leftover } = await deleteApplication(user.id, created.id, storage);

    expect(files.size).toBe(0);
    expect(leftover).toBeNull();
    expect(await db.attachment.count()).toBe(0);
  });

  it("fichiers impossibles à supprimer : la Candidature reste supprimée, les fichiers sont nommés et journalisés", async () => {
    const user = await createTestUser();
    const created = await createApplication(user.id, input({ cv: pdf("CV.pdf") }), createMemoryStorage().storage);
    const failing = createMemoryStorage({ failRemove: true });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    const { leftover } = await deleteApplication(user.id, created.id, failing.storage);

    expect(await db.application.count({ where: { id: created.id } })).toBe(0);
    expect(leftover).toBe(
      "Le fichier « CV.pdf » est resté sur UploadThing : supprime-le depuis ton tableau de bord UploadThing.",
    );
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  it("répond « introuvable » pour la Candidature d'un autre utilisateur ou un id mal formé, sans rien supprimer", async () => {
    const owner = await createTestUser();
    const intruder = await createTestUser();
    const { storage, files } = createMemoryStorage();
    const created = await createApplication(owner.id, input({ cv: pdf("CV.pdf") }), storage);

    await expect(deleteApplication(intruder.id, created.id, storage)).rejects.toThrow(NotFoundError);
    await expect(deleteApplication(owner.id, "abc", storage)).rejects.toThrow(NotFoundError);
    expect(await db.application.count({ where: { id: created.id } })).toBe(1);
    expect(files.size).toBe(1);
  });
});

function pdf(name: string) {
  return new File([new Uint8Array(1_000)], name, { type: "application/pdf" });
}

