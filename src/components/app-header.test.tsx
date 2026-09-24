import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppHeader } from "@/components/app-header";

describe("en-tête de l'application", () => {
  it("ramène à l'accueil depuis le nom de l'application", () => {
    render(<AppHeader />);

    expect(
      screen.getByRole("link", { name: "JobFlow AI" }).getAttribute("href"),
    ).toBe("/");
  });

  it("mène à la liste des candidatures depuis la navigation principale", () => {
    render(<AppHeader />);

    const navigation = screen.getByRole("navigation", {
      name: "Navigation principale",
    });
    const link = navigation.querySelector('a[href="/applications"]');
    expect(link?.textContent).toBe("Candidatures");
  });
});
