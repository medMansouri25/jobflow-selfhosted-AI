import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ApplicationDetail,
  type ApplicationDetailData,
} from "@/modules/applications/components/application-detail";

// Une Candidature telle que la renvoie `getApplication`.
function application(overrides: Partial<ApplicationDetailData> = {}): ApplicationDetailData {
  return {
    id: "0b6c1a52-2d1e-4a3f-9a57-0f6e6c1f3a11",
    userId: "u1",
    companyId: "c1",
    company: {
      id: "c1",
      userId: "u1",
      name: "Sanofi",
      normalizedName: "sanofi",
      website: null,
      createdAt: new Date("2026-09-27T14:21:35Z"),
      updatedAt: new Date("2026-09-27T14:21:35Z"),
    },
    status: "APPLIED",
    jobTitle: "Ingénieur SI",
    location: "Le Mans",
    contractType: "CDI",
    jobUrl: null,
    source: "OTHER",
    jobDescription: null,
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: null,
    salaryPeriod: null,
    appliedAt: new Date("2026-09-27T00:00:00Z"),
    notes: null,
    coverLetterDraft: null,
    jobAnalysis: null,
    createdAt: new Date("2026-09-27T14:21:35Z"),
    updatedAt: new Date("2026-09-27T14:21:35Z"),
    attachments: [],
    interviews: [],
    statusChanges: [
      {
        id: "h1",
        applicationId: "0b6c1a52-2d1e-4a3f-9a57-0f6e6c1f3a11",
        fromStatus: null,
        toStatus: "APPLIED",
        changedAt: new Date("2026-09-27T14:21:35Z"),
      },
    ],
    ...overrides,
  };
}

describe("fiche d'une Candidature", () => {
  it("présente le poste, son statut et l'Entreprise, le lieu, le contrat et la date de candidature", () => {
    render(<ApplicationDetail application={application()} />);

    const heading = screen.getByRole("heading", { level: 1, name: "Ingénieur SI" });
    expect(heading.parentElement?.textContent).toContain("Postulée");
    const company = screen.getByRole("link", { name: "Sanofi" });
    expect(company.getAttribute("href")).toBe("/companies/c1");
    expect(company.parentElement?.textContent).toBe("Sanofi · Le Mans · CDI · Postulée le 27 sept. 2026");
  });

  it("AC-001-19 affiche la description de l'Annonce en texte brut, retours à la ligne compris", () => {
    const { container } = render(
      <ApplicationDetail
        application={application({
          jobDescription: "Missions :\n<script>alert(1)</script>",
        })}
      />,
    );
    const annonce = screen.getByRole("region", { name: "Annonce" });

    expect(annonce.textContent).toContain("Missions :\n<script>alert(1)</script>");
    expect(container.querySelector("script")).toBeNull();
  });

  it("donne la source, le salaire et le lien de l'Annonce, ouvert dans un nouvel onglet sans accès à la fiche", () => {
    render(
      <ApplicationDetail
        application={application({
          source: "LINKEDIN",
          salaryMin: 42000,
          salaryMax: 48000,
          salaryCurrency: "EUR",
          salaryPeriod: "YEARLY",
          jobUrl: "https://www.linkedin.com/jobs/view/123",
        })}
      />,
    );
    const annonce = screen.getByRole("region", { name: "Annonce" });
    // Intl sépare les milliers par une espace fine insécable : on la normalise pour comparer.
    const text = annonce.textContent?.replace(/\s/g, " ");

    expect(text).toContain("LinkedIn");
    expect(text).toContain("42 000 – 48 000 € / an");
    const link = screen.getByRole("link", { name: "https://www.linkedin.com/jobs/view/123" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("affiche « — » pour un salaire ou un lien non renseignés", () => {
    render(<ApplicationDetail application={application()} />);
    const annonce = screen.getByRole("region", { name: "Annonce" });

    expect(annonce.textContent).toMatch(/Salaire\s*—/);
    expect(annonce.textContent).toMatch(/Lien\s*—/);
  });

  it("retrace l'historique des statuts, le plus récent en haut, à l'heure de Paris", () => {
    const id = "0b6c1a52-2d1e-4a3f-9a57-0f6e6c1f3a11";
    render(
      <ApplicationDetail
        application={application({
          status: "INTERVIEW",
          // Ordre renvoyé par getApplication : le plus récent d'abord.
          statusChanges: [
            { id: "h2", applicationId: id, fromStatus: "APPLIED", toStatus: "INTERVIEW", changedAt: new Date("2026-09-28T09:05:00Z") },
            { id: "h1", applicationId: id, fromStatus: null, toStatus: "APPLIED", changedAt: new Date("2026-09-27T14:21:00Z") },
          ],
        })}
      />,
    );
    const history = screen.getByRole("region", { name: "Historique des statuts" });
    const entries = within(history).getAllByRole("listitem").map((item) => item.textContent);

    expect(entries).toHaveLength(2);
    expect(entries[0]).toContain("Entretien");
    expect(entries[0]).toContain("depuis Postulée");
    expect(entries[0]).toContain("28 sept. 2026 · 11:05");
    expect(entries[1]).toContain("Postulée");
    expect(entries[1]).toContain("Candidature créée");
    expect(entries[1]).toContain("27 sept. 2026 · 16:21");
  });

  it("affiche les notes quand elles sont renseignées", () => {
    render(<ApplicationDetail application={application({ notes: "Relancer le 5 octobre" })} />);

    expect(
      screen.getByRole("region", { name: "Notes personnelles" }).textContent,
    ).toContain("Relancer le 5 octobre");
  });

  it("n'affiche pas la section Notes quand elle est vide", () => {
    render(<ApplicationDetail application={application()} />);

    expect(screen.queryByRole("region", { name: "Notes personnelles" })).toBeNull();
  });

  it("ouvre chaque pièce jointe dans un nouvel onglet, avec son nom et sa taille", () => {
    const at = new Date("2026-09-28T10:00:00Z");
    render(
      <ApplicationDetail
        application={application({
          attachments: [
            { id: "a1", userId: "u1", applicationId: "x", kind: "CV", fileKey: "k1", url: "https://app.ufs.sh/f/k1", name: "CV_DevOps.pdf", size: 240_000, createdAt: at },
            { id: "a2", userId: "u1", applicationId: "x", kind: "COVER_LETTER", fileKey: "k2", url: "https://app.ufs.sh/f/k2", name: "Lettre_Sanofi.pdf", size: 1_500_000, createdAt: at },
          ],
        })}
      />,
    );
    const attachments = screen.getByRole("region", { name: "Pièces jointes" });
    const text = attachments.textContent?.replace(/\s/g, " ");

    const cv = within(attachments).getByRole("link", { name: /CV_DevOps\.pdf/ });
    expect(cv.getAttribute("href")).toBe("https://app.ufs.sh/f/k1");
    expect(cv.getAttribute("target")).toBe("_blank");
    expect(cv.getAttribute("rel")).toBe("noopener noreferrer");
    expect(text).toContain("CV");
    expect(text).toContain("Lettre de motivation");
    expect(text).toContain("234 Ko");
    expect(text).toContain("1,4 Mo");
  });

  it("n'affiche pas la section Pièces jointes sans pièce jointe", () => {
    render(<ApplicationDetail application={application()} />);

    expect(screen.queryByRole("region", { name: "Pièces jointes" })).toBeNull();
  });

  it("n'affiche jamais « 0 Ko » pour un tout petit fichier", () => {
    render(
      <ApplicationDetail
        application={application({
          attachments: [
            { id: "a1", userId: "u1", applicationId: "x", kind: "CV", fileKey: "k1", url: "https://app.ufs.sh/f/k1", name: "cv.pdf", size: 193, createdAt: new Date() },
          ],
        })}
      />,
    );

    expect(screen.getByRole("region", { name: "Pièces jointes" }).textContent).toContain("(1 Ko)");
  });

  it("affiche les actions de la fiche à côté du titre", () => {
    render(<ApplicationDetail application={application()} actions={<button type="button">Modifier</button>} />);

    const heading = screen.getByRole("heading", { level: 1, name: "Ingénieur SI" });
    expect(within(heading.parentElement!).getByRole("button", { name: "Modifier" })).toBeDefined();
  });

  it("affiche le bloc de statut fourni par la page, avant l'Annonce", () => {
    render(
      <ApplicationDetail
        application={application()}
        statusPanel={<section aria-label="Statut">bloc</section>}
      />,
    );

    const status = screen.getByRole("region", { name: "Statut" });
    const annonce = screen.getByRole("region", { name: "Annonce" });
    expect(status.compareDocumentPosition(annonce) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

