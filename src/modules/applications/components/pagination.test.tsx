import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Pagination } from "@/modules/applications/components/pagination";
import { listApplicationsSchema } from "@/modules/applications/schemas";

const filters = listApplicationsSchema.parse({ statut: "APPLIED" });

describe("pagination de la liste", () => {
  it("indique la page et le total, et mène à la page suivante en gardant les filtres", () => {
    render(<Pagination filters={filters} page={1} pages={2} total={30} />);

    expect(screen.getByRole("navigation", { name: "Pagination" }).textContent).toContain(
      "Page 1 sur 2 · 30 candidatures",
    );
    expect(screen.queryByRole("link", { name: "Précédent" })).toBeNull();
    expect(screen.getByRole("link", { name: "Suivant" }).getAttribute("href")).toBe(
      "/applications?statut=APPLIED&page=2",
    );
  });

  it("revient à la page précédente depuis la dernière", () => {
    render(<Pagination filters={filters} page={2} pages={2} total={30} />);

    expect(screen.getByRole("link", { name: "Précédent" }).getAttribute("href")).toBe("/applications?statut=APPLIED");
    expect(screen.queryByRole("link", { name: "Suivant" })).toBeNull();
  });

  it("n'apparaît pas quand tout tient sur une page", () => {
    const { container } = render(<Pagination filters={filters} page={1} pages={1} total={12} />);

    expect(container.textContent).toBe("");
  });
});
