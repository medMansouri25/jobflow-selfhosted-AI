import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppSidebar } from "@/components/app-sidebar";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

describe("menu latéral", () => {
  beforeEach(() => {
    pathname.current = "/";
  });

  it("ramène au tableau de bord depuis le logo", () => {
    render(<AppSidebar />);

    expect(
      screen.getByRole("link", { name: "JobFlow AI — accueil" }).getAttribute("href"),
    ).toBe("/");
  });

  it("mène au tableau de bord et à la liste des candidatures", () => {
    render(<AppSidebar />);
    const nav = screen.getByRole("navigation", { name: "Navigation principale" });

    expect(
      within(nav).getByRole("link", { name: "Dashboard" }).getAttribute("href"),
    ).toBe("/");
    expect(
      within(nav).getByRole("link", { name: "Candidatures" }).getAttribute("href"),
    ).toBe("/applications");
  });

  it("signale la page courante", () => {
    pathname.current = "/applications/new";
    render(<AppSidebar />);

    expect(
      screen.getByRole("link", { name: "Candidatures" }).getAttribute("aria-current"),
    ).toBe("page");
    expect(
      screen.getByRole("link", { name: "Dashboard" }).getAttribute("aria-current"),
    ).toBeNull();
  });

  it("affiche les fonctionnalités à venir sans lien, avec leur phase", () => {
    render(<AppSidebar />);

    expect(screen.queryByRole("link", { name: /Agenda/ })).toBeNull();
    expect(screen.getByText("Agenda")).toBeDefined();
    expect(screen.getByText("P4")).toBeDefined();
  });

  it("FR-003-07 mène à la page des entretiens", () => {
    pathname.current = "/interviews";
    render(<AppSidebar />);

    const link = screen.getByRole("link", { name: "Entretiens" });
    expect([link.getAttribute("href"), link.getAttribute("aria-current")]).toEqual(["/interviews", "page"]);
  });
});
