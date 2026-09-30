import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppTopbar } from "@/components/app-topbar";
import type { ApplicationFormState } from "@/modules/applications/form-state";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

const noop = async (state: ApplicationFormState) => state;

describe("barre du haut", () => {
  it.each([
    ["/", "Dashboard"],
    ["/applications", "Candidatures"],
    ["/applications/new", "Candidatures"],
  ])("sur %s, indique la section « %s »", (path, section) => {
    pathname.current = path;
    render(<AppTopbar createApplicationAction={noop} companyNames={[]} />);

    expect(screen.getByText(section)).toBeDefined();
  });

  it("envoie la recherche vers la liste des candidatures", () => {
    render(<AppTopbar createApplicationAction={noop} companyNames={[]} />);

    const search = screen.getByRole("searchbox", {
      name: "Rechercher une entreprise ou un poste",
    });
    expect(search.getAttribute("name")).toBe("q");
    expect(search.closest("form")?.getAttribute("action")).toBe("/applications");
  });
});
