import { describe, expect, it } from "vitest";

import type { GenerationRequest, TextGenerator } from "@/lib/ai";
import { DomainError, NotFoundError } from "@/lib/errors";
import { analyzeJobPosting, readJobAnalysis } from "@/modules/applications/job-analysis";
import { createApplicationSchema } from "@/modules/applications/schemas";
import { createApplication, getApplication } from "@/modules/applications/service";
import { profileSchema } from "@/modules/profile/schemas";
import { saveProfile } from "@/modules/profile/service";
import { createTestUser } from "@/test/database";

const ANALYSIS = {
  summary: "Poste DevOps orienté CI/CD.",
  skills: {
    technical: [{ name: "Kubernetes", required: true, inProfile: true }],
    soft: [{ name: "Travail en équipe", required: false, inProfile: false }],
  },
  strengths: ["Stage DevOps"],
  questionsToPrepare: ["Parlez-nous d'un pipeline que vous avez construit."],
  questionsToAsk: ["Quelle est la taille de l'équipe ?"],
};

function generatorAnswering(answer: string) {
  const requests: GenerationRequest[] = [];
  const generator: TextGenerator = {
    async generate(request) {
      requests.push(request);
      return answer;
    },
  };
  return { generator, requests };
}

async function setUp({ jobDescription = "Kubernetes, GitLab CI.", withProfile = true } = {}) {
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
    await saveProfile(user.id, profileSchema.parse({ fullName: "Candidat Démo", email: "demo@example.com", skills: "Kubernetes" }));
  }
  return { user, application };
}

describe("analyse d'une annonce", () => {
  it("AC-007-01 analyse l'Annonce et enregistre le résultat avec la Candidature", async () => {
    const { user, application } = await setUp();
    const { generator, requests } = generatorAnswering(JSON.stringify(ANALYSIS));

    expect(await analyzeJobPosting(user.id, application.id, generator)).toEqual(ANALYSIS);

    expect(readJobAnalysis((await getApplication(user.id, application.id)).jobAnalysis)).toEqual(ANALYSIS);
    expect(requests[0].json).toBe(true);
    expect(requests[0].prompt).not.toContain("demo@example.com");
  });

  it("AC-007-03 refuse sans description d'Annonce ou sans Profil, sans rien envoyer", async () => {
    for (const options of [{ jobDescription: "" }, { withProfile: false }]) {
      const { user, application } = await setUp(options);
      const { generator, requests } = generatorAnswering(JSON.stringify(ANALYSIS));

      await expect(analyzeJobPosting(user.id, application.id, generator)).rejects.toBeInstanceOf(DomainError);
      expect(requests).toEqual([]);
    }
  });

  it("AC-007-04 refuse une réponse mal formée et garde l'analyse précédente", async () => {
    const { user, application } = await setUp();
    await analyzeJobPosting(user.id, application.id, generatorAnswering(JSON.stringify(ANALYSIS)).generator);

    await expect(
      analyzeJobPosting(user.id, application.id, generatorAnswering("Voici mon analyse en texte libre.").generator),
    ).rejects.toThrow(/n'a pas répondu dans le format attendu/);
    expect(readJobAnalysis((await getApplication(user.id, application.id)).jobAnalysis)).toEqual(ANALYSIS);
  });

  it("AC-007-06 traite la Candidature d'un autre utilisateur comme introuvable", async () => {
    const { application } = await setUp();
    const intruder = await createTestUser();
    const { generator, requests } = generatorAnswering(JSON.stringify(ANALYSIS));

    await expect(analyzeJobPosting(intruder.id, application.id, generator)).rejects.toBeInstanceOf(NotFoundError);
    expect(requests).toEqual([]);
  });

  it("ne lit qu'une analyse enregistrée valide", () => {
    expect(readJobAnalysis(null)).toBeNull();
    expect(readJobAnalysis({ summary: "incomplet" })).toBeNull();
  });
});
