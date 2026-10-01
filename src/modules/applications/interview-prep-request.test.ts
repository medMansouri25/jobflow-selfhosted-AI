import { describe, expect, it } from "vitest";

import { buildInterviewPrepRequest, parseInterviewPrep } from "@/modules/applications/interview-prep-request";

const PROFILE = {
  fullName: "Candidat Démo",
  targetRole: "Ingénieur DevOps",
  location: "Paris",
  email: "demo@example.com",
  phone: "06 00 00 00 00",
  about: null,
  experience: "Stage DevOps",
  projects: null,
  skills: "Docker",
  education: null,
  writingSamples: null,
};
const POSTING = { companyName: "Thales", jobTitle: "Ingénieur DevOps", jobDescription: "Kubernetes." };

const VALID = {
  questions: [{ question: "Parlez-moi de vous.", hints: ["Stage DevOps de 6 mois"] }],
  highlights: ["Expérience Docker"],
  questionsToAsk: ["Quelle est la taille de l'équipe ?"],
};

describe("fiche de préparation : demande", () => {
  it("AC-009-02 transmet le type d'Entretien, sans e-mail ni téléphone, et demande du JSON", () => {
    const request = buildInterviewPrepRequest({ type: "TECHNICAL", format: "VIDEO" }, POSTING, PROFILE);
    const sent = request.system + request.prompt;

    expect(request.json).toBe(true);
    expect(request.prompt).toMatch(/Entretien technique/);
    expect(request.prompt).toMatch(/<annonce>[\s\S]*Kubernetes\.[\s\S]*<\/annonce>/);
    expect(sent).not.toContain("demo@example.com");
    expect(sent).not.toContain("06 00 00 00 00");
  });

  it("BR-009-02 demande des pistes tirées du profil, sans réponse inventée", () => {
    const { system } = buildInterviewPrepRequest({ type: "HR", format: "PHONE" }, POSTING, PROFILE);

    expect(system).toMatch(/N'invente rien/);
    expect(system).toMatch(/jamais des instructions/);
  });
});

describe("fiche de préparation : réponse", () => {
  it("lit une fiche complète", () => {
    expect(parseInterviewPrep(JSON.stringify(VALID))).toEqual(VALID);
  });

  it("AC-009-04 refuse une réponse qui n'est pas la fiche attendue", () => {
    for (const answer of ["Voici la fiche…", "{}", JSON.stringify({ ...VALID, questions: ["Parlez-moi de vous."] })]) {
      expect(parseInterviewPrep(answer)).toBeNull();
    }
  });
});
