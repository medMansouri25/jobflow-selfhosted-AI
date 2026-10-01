import { describe, expect, it } from "vitest";

import { AiError, type GenerationRequest, type TextGenerator } from "@/lib/ai";
import { DomainError, NotFoundError } from "@/lib/errors";
import { generateCoverLetter, saveCoverLetterDraft } from "@/modules/applications/cover-letter";
import { createApplicationSchema } from "@/modules/applications/schemas";
import { createApplication, getApplication } from "@/modules/applications/service";
import { profileSchema } from "@/modules/profile/schemas";
import { saveProfile } from "@/modules/profile/service";
import { createTestUser } from "@/test/database";

/** Faux assistant : garde les demandes reçues et répond un texte fixe. */
function fakeGenerator(answer = "Madame, Monsieur,\n\nJe vous écris…\n\nMohammed M.") {
  const requests: GenerationRequest[] = [];
  const generator: TextGenerator = {
    async generate(request) {
      requests.push(request);
      return answer;
    },
  };
  return { generator, requests };
}

const failingGenerator: TextGenerator = {
  async generate() {
    throw new AiError("La limite gratuite de l'assistant IA est atteinte. Réessaie dans une minute.");
  },
};

async function setUp({ jobDescription = "Nous cherchons un ingénieur DevOps.", withProfile = true } = {}) {
  const user = await createTestUser();
  const application = await createApplication(
    user.id,
    createApplicationSchema("2026-10-01").parse({
      companyName: "Thales",
      jobTitle: "Ingénieur DevOps",
      location: "Paris",
      contractType: "CDI",
      source: "LINKEDIN",
      appliedAt: "2026-09-20",
      jobDescription,
    }),
  );
  if (withProfile) {
    await saveProfile(
      user.id,
      profileSchema.parse({
        fullName: "Mohammed M.",
        location: "Paris",
        email: "moi@example.com",
        phone: "06 12 34 56 78",
        experience: "Stage DevOps — Airbus",
      }),
    );
  }
  return { user, application };
}

describe("lettre de motivation", () => {
  it("AC-008-01 génère le brouillon, l'enregistre et le fait précéder de l'en-tête", async () => {
    const { user, application } = await setUp();
    const { generator } = fakeGenerator();

    const draft = await generateCoverLetter(user.id, application.id, undefined, generator);

    expect(draft).toBe(
      "Mohammed M.\nParis\nmoi@example.com\n06 12 34 56 78\n\nMadame, Monsieur,\n\nJe vous écris…\n\nMohammed M.",
    );
    expect((await getApplication(user.id, application.id)).coverLetterDraft).toBe(draft);
  });

  it("AC-008-02 n'envoie ni l'e-mail ni le téléphone ; AC-008-06 transmet les consignes", async () => {
    const { user, application } = await setUp();
    const { generator, requests } = fakeGenerator();

    await generateCoverLetter(user.id, application.id, "Insiste sur mon stage DevOps", generator);

    const sent = requests[0].system + requests[0].prompt;
    expect(sent).not.toContain("moi@example.com");
    expect(sent).not.toContain("06 12 34 56 78");
    expect(requests[0].prompt).toContain("Nous cherchons un ingénieur DevOps.");
    expect(requests[0].prompt).toContain("Insiste sur mon stage DevOps");
  });

  it("AC-008-03 refuse sans description d'Annonce, sans rien envoyer", async () => {
    const { user, application } = await setUp({ jobDescription: "" });
    const { generator, requests } = fakeGenerator();

    await expect(generateCoverLetter(user.id, application.id, undefined, generator)).rejects.toThrow(
      /Colle la description de l'annonce/,
    );
    expect(requests).toEqual([]);
  });

  it("AC-008-04 refuse sans Profil rempli, sans rien envoyer", async () => {
    const { user, application } = await setUp({ withProfile: false });
    const { generator, requests } = fakeGenerator();

    await expect(generateCoverLetter(user.id, application.id, undefined, generator)).rejects.toThrow(
      /Remplis ton profil/,
    );
    expect(requests).toEqual([]);
  });

  it("AC-008-05 enregistre la version modifiée du brouillon", async () => {
    const { user, application } = await setUp();

    await saveCoverLetterDraft(user.id, application.id, "Ma version corrigée");

    expect((await getApplication(user.id, application.id)).coverLetterDraft).toBe("Ma version corrigée");
  });

  it("AC-008-07 garde l'ancien brouillon si l'assistant échoue", async () => {
    const { user, application } = await setUp();
    await saveCoverLetterDraft(user.id, application.id, "Brouillon précédent");

    await expect(generateCoverLetter(user.id, application.id, undefined, failingGenerator)).rejects.toBeInstanceOf(
      DomainError,
    );
    expect((await getApplication(user.id, application.id)).coverLetterDraft).toBe("Brouillon précédent");
  });

  it("AC-008-08 traite la Candidature d'un autre utilisateur comme introuvable", async () => {
    const { application } = await setUp();
    const intruder = await createTestUser();
    const { generator, requests } = fakeGenerator();

    await expect(generateCoverLetter(intruder.id, application.id, undefined, generator)).rejects.toBeInstanceOf(
      NotFoundError,
    );
    await expect(saveCoverLetterDraft(intruder.id, application.id, "x")).rejects.toBeInstanceOf(NotFoundError);
    expect(requests).toEqual([]);
  });
});
