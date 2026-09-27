import { describe, expect, it, vi } from "vitest";

import { db } from "@/lib/db";
import { DomainError, NotFoundError } from "@/lib/errors";
import {
  createApplicationSchema,
  updateApplicationSchema,
} from "@/modules/applications/schemas";
import {
  createApplication,
  getApplication,
  updateApplication,
} from "@/modules/applications/service";
import { createTestUser } from "@/test/database";
import { createMemoryStorage } from "@/test/memory-storage";

const TODAY = "2026-09-28";

const FIELDS = {
  companyName: "Sanofi",
  jobTitle: "Ingénieur SI",
  location: "Le Mans",
  contractType: "CDI",
  source: "OTHER",
  appliedAt: "2026-09-27",
};

function pdf(name: string, size = 1_000) {
  return new File([new Uint8Array(size)], name, { type: "application/pdf" });
}

async function existing(userId: string, extra: Record<string, unknown> = {}) {
  const { storage, files } = createMemoryStorage();
  const created = await createApplication(
    userId,
    createApplicationSchema(TODAY).parse({ ...FIELDS, ...extra }),
    storage,
  );
  return { created, storage, files };
}

function edit(overrides: Record<string, unknown> = {}) {
  return updateApplicationSchema(TODAY).parse({ ...FIELDS, ...overrides });
}

describe("modification d'une Candidature", () => {
  it("AC-001-11 modifie les notes d'une Candidature Refusée ; son statut reste Refusée", async () => {
    const user = await createTestUser();
    const { created, storage } = await existing(user.id);
    await db.application.update({ where: { id: created.id }, data: { status: "REJECTED" } });

    await updateApplication(user.id, created.id, edit({ notes: "Refus par mail, retour positif" }), storage);

    const application = await getApplication(user.id, created.id);
    expect(application.notes).toBe("Refus par mail, retour positif");
    expect(application.status).toBe("REJECTED");
    expect(application.statusChanges).toHaveLength(1);
  });

  it("efface un champ facultatif vidé dans le formulaire", async () => {
    const user = await createTestUser();
    const { created, storage } = await existing(user.id, {
      notes: "Relancer lundi",
      jobUrl: "https://example.com/offre",
      salaryMin: "42000",
      salaryPeriod: "YEARLY",
    });

    await updateApplication(user.id, created.id, edit({ notes: "", jobUrl: "", salaryMin: "", salaryPeriod: "" }), storage);

    const application = await getApplication(user.id, created.id);
    expect([application.notes, application.jobUrl, application.salaryMin, application.salaryPeriod, application.salaryCurrency]).toEqual([null, null, null, null, null]);
  });

  it("répond « introuvable » pour la Candidature d'un autre utilisateur ou un id inconnu, sans rien modifier", async () => {
    const owner = await createTestUser();
    const intruder = await createTestUser();
    const { created, storage } = await existing(owner.id);

    await expect(
      updateApplication(intruder.id, created.id, edit({ jobTitle: "Piraté" }), storage),
    ).rejects.toThrow(NotFoundError);
    await expect(updateApplication(owner.id, "abc", edit(), storage)).rejects.toThrow(NotFoundError);
    expect((await getApplication(owner.id, created.id)).jobTitle).toBe("Ingénieur SI");
  });

  it("rattache la Candidature à l'Entreprise corrigée ; l'ancienne reste en base (BR-001-12)", async () => {
    const user = await createTestUser();
    const { created, storage } = await existing(user.id, { companyName: "Sanofii" });

    await updateApplication(user.id, created.id, edit({ companyName: "  sanofi " }), storage);
    const other = await existing(user.id, { companyName: "Sanofi" });

    const application = await getApplication(user.id, created.id);
    expect(application.company.name).toBe("sanofi");
    expect(application.company.id).toBe((await getApplication(user.id, other.created.id)).company.id);
    expect(await db.company.count({ where: { userId: user.id } })).toBe(2);
  });

  describe("pièces jointes", () => {
    const kinds = async (userId: string, id: string) =>
      (await getApplication(userId, id)).attachments.map((a) => [a.kind, a.name]);

    it("ajoute un CV à une Candidature qui n'en avait pas", async () => {
      const user = await createTestUser();
      const { created, storage, files } = await existing(user.id);

      await updateApplication(user.id, created.id, edit({ cv: pdf("CV_v2.pdf") }), storage);

      expect(await kinds(user.id, created.id)).toEqual([["CV", "CV_v2.pdf"]]);
      expect([...files.values()].map((f) => f.name)).toEqual(["CV_v2.pdf"]);
    });

    it("remplace le CV : un seul CV, l'ancien fichier supprimé du stockage après l'enregistrement", async () => {
      const user = await createTestUser();
      const { created, storage, files } = await existing(user.id, { cv: pdf("CV_v1.pdf") });

      const result = await updateApplication(user.id, created.id, edit({ cv: pdf("CV_v2.pdf") }), storage);

      expect(await kinds(user.id, created.id)).toEqual([["CV", "CV_v2.pdf"]]);
      expect([...files.values()].map((f) => f.name)).toEqual(["CV_v2.pdf"]);
      expect(result.leftover).toBeNull();
    });

    it("retire la lettre cochée « Retirer » et garde le CV auquel on ne touche pas", async () => {
      const user = await createTestUser();
      const { created, storage, files } = await existing(user.id, {
        cv: pdf("CV.pdf"),
        coverLetter: pdf("Lettre.pdf"),
      });

      await updateApplication(user.id, created.id, edit({ removeCoverLetter: "on" }), storage);

      expect(await kinds(user.id, created.id)).toEqual([["CV", "CV.pdf"]]);
      expect([...files.values()].map((f) => f.name)).toEqual(["CV.pdf"]);
    });

    it("échec d'envoi : ne modifie rien, supprime ce qui a été envoyé et le dit", async () => {
      const user = await createTestUser();
      const { created, files } = await existing(user.id, { cv: pdf("CV_v1.pdf") });
      const failing = createMemoryStorage({ failUploadOf: "Lettre.pdf" });

      await expect(
        updateApplication(
          user.id,
          created.id,
          edit({ jobTitle: "Autre", cv: pdf("CV_v2.pdf"), coverLetter: pdf("Lettre.pdf") }),
          failing.storage,
        ),
      ).rejects.toThrow(
        new DomainError(
          "ATTACHMENT_UPLOAD_FAILED",
          "L'envoi de la lettre de motivation a échoué. La modification n'a pas été enregistrée : réessaie.",
        ),
      );
      expect(failing.files.size).toBe(0);
      expect((await getApplication(user.id, created.id)).jobTitle).toBe("Ingénieur SI");
      expect(await kinds(user.id, created.id)).toEqual([["CV", "CV_v1.pdf"]]);
      expect(files.size).toBe(1);
    });

    it("Candidature introuvable : le fichier envoyé est supprimé et l'erreur reste « introuvable »", async () => {
      const intruder = await createTestUser();
      const owner = await createTestUser();
      const { created } = await existing(owner.id);
      const { storage, files } = createMemoryStorage();

      await expect(
        updateApplication(intruder.id, created.id, edit({ cv: pdf("CV.pdf") }), storage),
      ).rejects.toThrow(NotFoundError);
      expect(files.size).toBe(0);
    });

    it("ancien fichier impossible à supprimer : la modification reste faite, le fichier est nommé et journalisé", async () => {
      const user = await createTestUser();
      const { created } = await existing(user.id, { cv: pdf("CV_v1.pdf") });
      const { storage } = createMemoryStorage({ failRemove: true });
      const log = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await updateApplication(user.id, created.id, edit({ cv: pdf("CV_v2.pdf") }), storage);

      expect(await kinds(user.id, created.id)).toEqual([["CV", "CV_v2.pdf"]]);
      expect(result.leftover).toBe(
        "Le fichier « CV_v1.pdf » est resté sur UploadThing : supprime-le depuis ton tableau de bord UploadThing.",
      );
      expect(log).toHaveBeenCalled();
      log.mockRestore();
    });
  });
});

