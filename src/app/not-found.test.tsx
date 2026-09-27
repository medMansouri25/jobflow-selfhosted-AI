import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "@/app/not-found";

describe("page 404", () => {
  it("explique que la page n'existe pas et propose de revenir à l'accueil", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Page introuvable" }),
    ).toBeDefined();
    expect(
      screen
        .getByRole("link", { name: "Revenir à l'accueil" })
        .getAttribute("href"),
    ).toBe("/");
  });
});
