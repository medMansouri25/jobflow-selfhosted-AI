import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("page d'accueil", () => {
  it("affiche le nom de l'application comme titre principal", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "JobFlow AI" }),
    ).toBeDefined();
  });
});
