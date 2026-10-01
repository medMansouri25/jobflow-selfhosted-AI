import { describe, expect, it } from "vitest";

import type { GenerationRequest, TextGenerator } from "@/lib/ai";
import { DomainError, NotFoundError } from "@/lib/errors";
import { interviewSchema } from "@/modules/applications/interview-schemas";
import { addInterview } from "@/modules/applications/interviews";
import { debriefPractice, givePracticeFeedback, startPractice } from "@/modules/applications/practice";
import { createApplicationSchema } from "@/modules/applications/schemas";
import { createApplication } from "@/modules/applications/service";
import { profileSchema } from "@/modules/profile/schemas";
import { saveProfile } from "@/modules/profile/service";
import { createTestUser } from "@/test/database";

function generatorAnswering(answer: unknown) {
  const requests: GenerationRequest[] = [];
  const generator: TextGenerator = {
    async generate(request) {
      requests.push(request);
      return JSON.stringify(answer);
    },
  };
  return { generator, requests };
}

async function setUp() {
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
      jobDescription: "Kubernetes.",
    }),
  );
  const interview = await addInterview(
    user.id,
    application.id,
    interviewSchema.parse({ scheduledAt: "2026-10-14T10:30", type: "HR", format: "PHONE" }),
  );
  await saveProfile(user.id, profileSchema.parse({ experience: "Stage DevOps", email: "demo@example.com" }));
  return { user, interview };
}

const QUESTIONS = ["Q1", "Q2", "Q3", "Q4", "Q5"];
const FEEDBACK = { good: ["Clair"], improve: ["Un exemple chiffré"], betterAnswer: "Pendant mon stage…" };

describe("entraînement à un entretien", () => {
  it("AC-009-05 donne les 5 questions de la séance", async () => {
    const { user, interview } = await setUp();
    const { generator, requests } = generatorAnswering({ questions: QUESTIONS });

    expect(await startPractice(user.id, interview.id, generator)).toEqual(QUESTIONS);
    expect(requests[0].prompt).not.toContain("demo@example.com");
  });

  it("AC-009-06 renvoie le retour sur une réponse, qui part délimitée", async () => {
    const { user, interview } = await setUp();
    const { generator, requests } = generatorAnswering(FEEDBACK);

    expect(await givePracticeFeedback(user.id, interview.id, "Q1", "Ma réponse", generator)).toEqual(FEEDBACK);
    expect(requests[0].prompt).toMatch(/<reponse>\nMa réponse\n<\/reponse>/);
  });

  it("BR-009-04 refuse une réponse vide ou trop longue, sans rien envoyer", async () => {
    const { user, interview } = await setUp();
    const { generator, requests } = generatorAnswering(FEEDBACK);

    for (const answer of ["  ", "x".repeat(3_001)]) {
      await expect(givePracticeFeedback(user.id, interview.id, "Q1", answer, generator)).rejects.toBeInstanceOf(DomainError);
    }
    expect(requests).toEqual([]);
  });

  it("AC-009-07 fait le bilan à partir des seuls échanges", async () => {
    const { user, interview } = await setUp();
    const { generator, requests } = generatorAnswering({ points: ["a", "b", "c"] });

    expect(await debriefPractice(user.id, interview.id, [{ question: "Q1", answer: "R1" }], generator)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(requests[0].prompt).not.toContain("Stage DevOps");
  });

  it("AC-009-08 traite l'Entretien d'un autre utilisateur comme introuvable", async () => {
    const { interview } = await setUp();
    const intruder = await createTestUser();
    const { generator, requests } = generatorAnswering({ questions: QUESTIONS });

    await expect(startPractice(intruder.id, interview.id, generator)).rejects.toBeInstanceOf(NotFoundError);
    await expect(givePracticeFeedback(intruder.id, interview.id, "Q", "R", generator)).rejects.toBeInstanceOf(NotFoundError);
    await expect(debriefPractice(intruder.id, interview.id, [], generator)).rejects.toBeInstanceOf(NotFoundError);
    expect(requests).toEqual([]);
  });
});
