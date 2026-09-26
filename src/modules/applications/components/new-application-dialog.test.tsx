import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ApplicationFormState } from "@/modules/applications/form-state";
import { NewApplicationDialog } from "@/modules/applications/components/new-application-dialog";

const noop = async (state: ApplicationFormState) => state;

describe("fenêtre de nouvelle candidature", () => {
  it("s'ouvre depuis le bouton Nouvelle candidature et se ferme avec Annuler", () => {
    render(<NewApplicationDialog action={noop} />);
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Nouvelle candidature/ }));
    expect(screen.getByRole("dialog", { name: "Nouvelle candidature" })).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
