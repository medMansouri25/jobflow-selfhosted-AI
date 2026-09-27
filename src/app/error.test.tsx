import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "@/app/error";

describe("page d'erreur", () => {
  it("annonce l'erreur sans en exposer le détail technique", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorPage error={new Error("connexion refusée")} retry={() => {}} />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Une erreur est survenue" }),
    ).toBeDefined();
    expect(screen.queryByText(/connexion refusée/)).toBeNull();
  });

  it("relance l'affichage quand on clique sur Réessayer", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const retry = vi.fn();

    render(<ErrorPage error={new Error("boom")} retry={retry} />);
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));

    expect(retry).toHaveBeenCalledOnce();
  });
});
