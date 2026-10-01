import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MobileNav } from "@/components/mobile-nav";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("menu sur téléphone", () => {
  it("est fermé par défaut et s'ouvre depuis le bouton « Menu »", () => {
    render(<MobileNav />);
    expect(screen.queryByRole("navigation", { name: "Navigation principale" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));

    const nav = screen.getByRole("navigation", { name: "Navigation principale" });
    expect(within(nav).getByRole("link", { name: "Candidatures" }).getAttribute("href")).toBe("/applications");
  });

  it("se referme quand on choisit une page", () => {
    render(<MobileNav />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));

    fireEvent.click(screen.getByRole("link", { name: "Candidatures" }));

    expect(screen.queryByRole("navigation", { name: "Navigation principale" })).toBeNull();
  });
});
