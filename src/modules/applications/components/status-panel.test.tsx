import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ApplicationFormState } from "@/modules/applications/form-state";
import { StatusPanel } from "@/modules/applications/components/status-panel";

const noop = async (state: ApplicationFormState) => state;

describe("bloc Statut de la fiche", () => {
  it("propose depuis Postulée les seules transitions autorisées", () => {
    render(<StatusPanel status="APPLIED" action={noop} />);
    const panel = screen.getByRole("region", { name: "Statut" });

    expect(within(panel).getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Passer en Entretien",
      "Marquer Refusée",
    ]);
  });

  it("AC-001-07 ne propose aucune transition depuis Refusée et le dit", () => {
    render(<StatusPanel status="REJECTED" action={noop} />);
    const panel = screen.getByRole("region", { name: "Statut" });

    expect(within(panel).queryAllByRole("button")).toEqual([]);
    expect(panel.textContent).toContain("Statut définitif");
  });

  it("envoie « Passer en Entretien » tout de suite, mais demande confirmation avant « Refusée » (statut définitif)", async () => {
    const sent: string[] = [];
    const recording = async (state: ApplicationFormState, formData: FormData) => {
      sent.push(String(formData.get("to")));
      return state;
    };
    render(<StatusPanel status="APPLIED" action={recording} />);

    fireEvent.click(screen.getByRole("button", { name: "Passer en Entretien" }));
    await waitFor(() => expect(sent).toEqual(["INTERVIEW"]));

    fireEvent.click(screen.getByRole("button", { name: "Marquer Refusée" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog.textContent).toContain("Ce changement est définitif");
    expect(sent).toEqual(["INTERVIEW"]);

    fireEvent.click(within(dialog).getByRole("button", { name: "Confirmer" }));
    await waitFor(() => expect(sent).toEqual(["INTERVIEW", "REJECTED"]));
  });

  it("affiche le refus du serveur (ex. onglet pas à jour)", async () => {
    const refusing = async (): Promise<ApplicationFormState> => ({
      status: "error",
      message: "Le statut a changé entre-temps (la candidature est maintenant Refusée). Recharge la page.",
    });
    render(<StatusPanel status="APPLIED" action={refusing} />);

    fireEvent.click(screen.getByRole("button", { name: "Passer en Entretien" }));

    expect((await screen.findByRole("alert")).textContent).toContain("Recharge la page");
  });
});

