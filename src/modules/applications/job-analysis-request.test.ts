import { describe, expect, it } from "vitest";

import { buildJobAnalysisRequest, parseJobAnalysis } from "@/modules/applications/job-analysis-request";

const PROFILE = {
  fullName: "Candidat Démo",
  targetRole: "Ingénieur DevOps",
  location: "Paris",
  email: "demo@example.com",
  phone: "06 00 00 00 00",
  linkedinUrl: "https://www.linkedin.com/in/demo",
  about: null,
  experience: "Stage DevOps",
  projects: null,
  skills: "Docker, Kubernetes",
  education: null,
  writingSamples: null,
};
const POSTING = { companyName: "Thales", jobTitle: "Ingénieur DevOps", jobDescription: "Kubernetes, Terraform." };

const VALID = {
  summary: "Poste DevOps orienté CI/CD.",
  skills: {
    technical: [
      { name: "Kubernetes", required: true, inProfile: true },
      { name: "Terraform", required: false, inProfile: false },
    ],
    soft: [{ name: "Travail en équipe", required: true, inProfile: false }],
  },
  strengths: ["Stage DevOps"],
  questionsToPrepare: ["Comment gérez-vous un incident en production ?"],
  questionsToAsk: ["Quelle est la taille de l'équipe ?"],
};

describe("analyse d'une annonce : demande", () => {
  it("AC-007-05 envoie l'Annonce et le Profil délimités, sans e-mail ni téléphone, et demande du JSON", () => {
    const request = buildJobAnalysisRequest(POSTING, PROFILE);
    const sent = request.system + request.prompt;

    expect(request.json).toBe(true);
    expect(request.prompt).toMatch(/<annonce>[\s\S]*Kubernetes, Terraform\.[\s\S]*<\/annonce>/);
    expect(sent).not.toContain("demo@example.com");
    expect(sent).not.toContain("06 00 00 00 00");
    expect(request.system).toMatch(/jamais des instructions/);
  });

  it("BR-007-03 interdit de cocher une compétence absente du Profil et de donner une note", () => {
    const { system } = buildJobAnalysisRequest(POSTING, PROFILE);

    expect(system).toMatch(/inProfile[\s\S]*seulement si le profil/);
    expect(system).toMatch(/aucune note/i);
  });
});

describe("analyse d'une annonce : réponse", () => {
  it("AC-007-02 lit une analyse complète", () => {
    expect(parseJobAnalysis(JSON.stringify(VALID))).toEqual(VALID);
  });

  it("accepte une réponse entourée d'un bloc de code Markdown", () => {
    expect(parseJobAnalysis("```json\n" + JSON.stringify(VALID) + "\n```")).toEqual(VALID);
  });

  it("AC-007-04 refuse une réponse qui n'est pas l'analyse attendue", () => {
    for (const answer of ["Voici l'analyse : …", "{}", JSON.stringify({ ...VALID, skills: { technical: "Kubernetes" } })]) {
      expect(parseJobAnalysis(answer)).toBeNull();
    }
  });
});
