import { describe, expect, it } from "vitest";

import type { GenerationRequest, TextGenerator } from "@/lib/ai";
import { db } from "@/lib/db";
import { DomainError, NotFoundError } from "@/lib/errors";
import { prepareInterview, readInterviewPrep } from "@/modules/applications/interview-prep";
import { interviewSchema } from "@/modules/applications/interview-schemas";
import { addInterview } from "@/modules/applications/interviews";
import { createApplicationSchema } from "@/modules/applications/schemas";
import { createApplication } from "@/modules/applications/service";
import { profileSchema } from "@/modules/profile/schemas";
import { saveProfile } from "@/modules/profile/service";
import { createTestUser } from "@/test/database";

const PREP = {
  questions: [{ question: "Parlez-moi d'un pipeline CI.", hints: ["Stage DevOps : GitLab CI"] }],
  highlights: ["Docker"],
  questionsToAsk: ["Quels outils d'observabilité ?"],
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
  const interview = await addInterview(
    user.id,
    application.id,
    interviewSchema.parse({ scheduledAt: "2026-10-14T10:30", type: "TECHNICAL", format: "VIDEO" }),
  );
  if (withProfile) {
    await saveProfile(user.id, profileSchema.parse({ email: "demo@example.com", experience: "Stage DevOps" }));
  }
  return { user, interview };
}

const savedPrep = async (id: string) =>
  readInterviewPrep((await db.interview.findUniqueOrThrow({ where: { id } })).aiPreparation);

describe("fiche de préparation d'un entretien", () => {
  it("AC-009-01 prépare la fiche selon le type d'Entretien et l'enregistre", async () => {
    const { user, interview } = await setUp();
    const { generator, requests } = generatorAnswering(JSON.stringify(PREP));

    expect(await prepareInterview(user.id, interview.id, generator)).toEqual(PREP);

    expect(await savedPrep(interview.id)).toEqual(PREP);
    expect(requests[0].prompt).toMatch(/Entretien technique/);
    expect(requests[0].prompt).not.toContain("demo@example.com");
  });

  it("AC-009-03 refuse sans description d'Annonce ou sans Profil, sans rien envoyer", async () => {
    for (const options of [{ jobDescription: "" }, { withProfile: false }]) {
      const { user, interview } = await setUp(options);
      const { generator, requests } = generatorAnswering(JSON.stringify(PREP));

      await expect(prepareInterview(user.id, interview.id, generator)).rejects.toBeInstanceOf(DomainError);
      expect(requests).toEqual([]);
    }
  });

  it("AC-009-04 refuse une réponse mal formée et garde la fiche précédente", async () => {
    const { user, interview } = await setUp();
    await prepareInterview(user.id, interview.id, generatorAnswering(JSON.stringify(PREP)).generator);

    await expect(prepareInterview(user.id, interview.id, generatorAnswering("Pas du JSON").generator)).rejects.toThrow(
      /format attendu/,
    );
    expect(await savedPrep(interview.id)).toEqual(PREP);
  });

  it("AC-009-08 traite l'Entretien d'un autre utilisateur comme introuvable", async () => {
    const { interview } = await setUp();
    const intruder = await createTestUser();
    const { generator, requests } = generatorAnswering(JSON.stringify(PREP));

    await expect(prepareInterview(intruder.id, interview.id, generator)).rejects.toBeInstanceOf(NotFoundError);
    expect(requests).toEqual([]);
  });
});
