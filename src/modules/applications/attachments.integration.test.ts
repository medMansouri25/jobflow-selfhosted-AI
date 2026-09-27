import { describe, expect, it, vi } from "vitest";

import { db } from "@/lib/db";
import { DomainError } from "@/lib/errors";
import { createApplicationSchema } from "@/modules/applications/schemas";
import { createApplication, getApplication } from "@/modules/applications/service";
import { createTestUser } from "@/test/database";
import { createMemoryStorage } from "@/test/memory-storage";

function input(overrides: Record<string, unknown> = {}) {
  return createApplicationSchema("2026-09-28").parse({
    companyName: "Sanofi",
    jobTitle: "Ingénieur SI",
    location: "Le Mans",
    contractType: "CDI",
    source: "OTHER",
    appliedAt: "2026-09-27",
    ...overrides,
  });
}

function pdf(name: string, size: number) {
  return new File([new Uint8Array(size)], name, { type: "application/pdf" });
}

async function createTestApplication(userId: string) {
  return createApplication(userId, input(), createMemoryStorage().storage);
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

  it("sont enregistrées à la création de la Candidature, envoyées au stockage", async () => {
    const user = await createTestUser();
    const { storage, files } = createMemoryStorage();

    const created = await createApplication(
      user.id,
      input({ cv: pdf("CV_DevOps.pdf", 240_000), coverLetter: pdf("Lettre_Sanofi.pdf", 80_000) }),
      storage,
    );

    const attachments = await db.attachment.findMany({
      where: { applicationId: created.id },
      orderBy: { kind: "asc" },
    });
    expect(attachments.map((a) => [a.kind, a.name, a.size])).toEqual([
      ["CV", "CV_DevOps.pdf", 240_000],
      ["COVER_LETTER", "Lettre_Sanofi.pdf", 80_000],
    ]);
    expect([...files.keys()].sort()).toEqual(attachments.map((a) => a.fileKey).sort());
  });

  it("échec d'envoi : supprime les fichiers déjà envoyés, n'enregistre rien et le dit", async () => {
    const user = await createTestUser();
    const { storage, files } = createMemoryStorage({ failUploadOf: "Lettre_Sanofi.pdf" });

    await expect(
      createApplication(
        user.id,
        input({ cv: pdf("CV_DevOps.pdf", 240_000), coverLetter: pdf("Lettre_Sanofi.pdf", 80_000) }),
        storage,
      ),
    ).rejects.toThrow(
      new DomainError(
        "ATTACHMENT_UPLOAD_FAILED",
        "L'envoi de la lettre de motivation a échoué. La candidature n'a pas été enregistrée : réessaie.",
      ),
    );
    expect(files.size).toBe(0);
    expect(await db.application.count()).toBe(0);
  });

  // Un utilisateur absent de la base fait échouer l'enregistrement (clé étrangère).
  const MISSING_USER = "00000000-0000-4000-8000-000000000000";

  it("échec d'enregistrement : supprime le fichier envoyé et le dit", async () => {
    const { storage, files } = createMemoryStorage();

    await expect(
      createApplication(MISSING_USER, input({ cv: pdf("CV_DevOps.pdf", 240_000) }), storage),
    ).rejects.toThrow(
      new DomainError(
        "APPLICATION_SAVE_FAILED",
        "La candidature n'a pas pu être enregistrée. Le fichier envoyé a été supprimé : réessaie.",
      ),
    );
    expect(files.size).toBe(0);
  });

  it("échec d'enregistrement puis de suppression : nomme le fichier resté sur UploadThing et le journalise", async () => {
    const { storage } = createMemoryStorage({ failRemove: true });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      createApplication(MISSING_USER, input({ cv: pdf("CV_DevOps.pdf", 240_000) }), storage),
    ).rejects.toThrow(
      new DomainError(
        "APPLICATION_SAVE_FAILED",
        "La candidature n'a pas pu être enregistrée. Le fichier « CV_DevOps.pdf » est resté sur UploadThing : supprime-le depuis ton tableau de bord UploadThing.",
      ),
    );
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  it("sont renvoyées avec la Candidature pour la fiche", async () => {
    const user = await createTestUser();
    const { storage } = createMemoryStorage();
    const created = await createApplication(
      user.id,
      input({ cv: pdf("CV_DevOps.pdf", 240_000) }),
      storage,
    );

    const application = await getApplication(user.id, created.id);

    expect(application.attachments.map((a) => [a.kind, a.name, a.size])).toEqual([
      ["CV", "CV_DevOps.pdf", 240_000],
    ]);
    expect(application.attachments[0].url).toMatch(/^https:\/\//);
  });
});

