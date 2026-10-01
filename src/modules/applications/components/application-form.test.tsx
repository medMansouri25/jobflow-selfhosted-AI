import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { FormState } from "@/lib/form-state";
import { ApplicationForm } from "@/modules/applications/components/application-form";

const noop = async (state: FormState) => state;

describe("formulaire de candidature", () => {
  it("affiche les champs obligatoires étiquetés", () => {
    render(<ApplicationForm action={noop} />);

    expect(screen.getByLabelText(/Entreprise/)).toBeDefined();
    expect(screen.getByLabelText(/Intitulé du poste/)).toBeDefined();
  });

  it("n'a qu'un bouton d'enregistrement, sans choix de statut", () => {
    render(<ApplicationForm action={noop} />);

    const submits = screen
      .getAllByRole("button")
      .filter((button) => button.getAttribute("type") === "submit");
    expect(submits.map((button) => button.textContent)).toEqual(["Enregistrer"]);
    expect(submits[0].getAttribute("name")).toBeNull();
  });

  it("AC-001-10 propose la date du jour (Europe/Paris) comme date de candidature", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-27T23:30:00Z")); // déjà le 28 à Paris
    try {
      render(<ApplicationForm action={noop} />);

      expect(
        (screen.getByLabelText(/Date de candidature/) as HTMLInputElement).value,
      ).toBe("2026-09-28");
    } finally {
      vi.useRealTimers();
    }
  });

  it("AC-001-10 ne fige pas de date dans le HTML rendu par le serveur", () => {
    const html = renderToString(<ApplicationForm action={noop} />);
    const dateInput = html.match(/<input[^>]*name="appliedAt"[^>]*>/)?.[0];

    expect(dateInput).toBeDefined();
    expect(dateInput).not.toMatch(/value="\d{4}-/);
  });

  it("propose d'y joindre le CV et la lettre de motivation en PDF", () => {
    render(<ApplicationForm action={noop} />);

    for (const [label, name] of [
      [/^CV/, "cv"],
      [/^Lettre de motivation/, "coverLetter"],
    ] as const) {
      const input = screen.getByLabelText(label) as HTMLInputElement;
      expect([input.type, input.name, input.accept]).toEqual(["file", name, "application/pdf"]);
    }
  });

  it("se pré-remplit avec une Candidature existante, date enregistrée comprise", () => {
    render(
      <ApplicationForm
        action={noop}
        label="Modifier la candidature"
        initialValues={{ companyName: "Sanofi", jobTitle: "Ingénieur SI", appliedAt: "2026-09-20", notes: "Relancer" }}
      />,
    );

    expect(screen.getByRole("form", { name: "Modifier la candidature" })).toBeDefined();
    expect((screen.getByLabelText(/Entreprise/) as HTMLInputElement).value).toBe("Sanofi");
    expect((screen.getByLabelText(/Date de candidature/) as HTMLInputElement).value).toBe("2026-09-20");
    expect((screen.getByLabelText(/Notes personnelles/) as HTMLTextAreaElement).value).toBe("Relancer");
  });

  it("montre le CV déjà joint avec « Retirer » et « Remplacer par… », et un simple champ pour la lettre absente", () => {
    render(
      <ApplicationForm
        action={noop}
        attachments={[{ kind: "CV", name: "CV_v1.pdf", size: 240_000 }]}
      />,
    );

    expect(screen.getByText(/CV_v1\.pdf/).textContent).toMatch(/CV_v1\.pdf\s*\(234\s*Ko\)/);
    const remove = screen.getByLabelText("Retirer le CV") as HTMLInputElement;
    expect([remove.type, remove.name]).toEqual(["checkbox", "removeCv"]);
    expect((screen.getByLabelText(/^Remplacer le CV par/) as HTMLInputElement).name).toBe("cv");
    expect((screen.getByLabelText(/^Lettre de motivation/) as HTMLInputElement).name).toBe("coverLetter");
    expect(screen.queryByLabelText("Retirer la lettre de motivation")).toBeNull();
  });

  it("FR-001-04 propose les Entreprises existantes dans le champ Entreprise, sans empêcher un nouveau nom", () => {
    const { container } = render(
      <ApplicationForm action={noop} companySuggestions={["Airbus", "Sanofi"]} />,
    );
    const input = screen.getByLabelText(/Entreprise/) as HTMLInputElement;
    const list = container.querySelector(`datalist#${CSS.escape(input.getAttribute("list") ?? "")}`);

    expect(input.getAttribute("list")).toBeTruthy();
    expect([...(list?.querySelectorAll("option") ?? [])].map((option) => option.value)).toEqual(["Airbus", "Sanofi"]);
    expect(input.tagName).toBe("INPUT");
  });

  it("appelle onCancel quand on clique sur Annuler", () => {
    const onCancel = vi.fn();
    render(<ApplicationForm action={noop} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("affiche l'erreur renvoyée par le serveur sous le champ et conserve la saisie", async () => {
    const rejectingAction = async (): Promise<FormState> => ({
      status: "error",
      message: "Certains champs sont à corriger.",
      fieldErrors: { jobTitle: ["L'intitulé du poste est obligatoire"] },
      values: { companyName: "Thales" },
    });
    render(<ApplicationForm action={rejectingAction} />);

    fireEvent.submit(screen.getByRole("form", { name: "Nouvelle candidature" }));

    expect(
      await screen.findByText("L'intitulé du poste est obligatoire"),
    ).toBeDefined();
    expect(
      (screen.getByLabelText(/Entreprise/) as HTMLInputElement).value,
    ).toBe("Thales");
  });
});
