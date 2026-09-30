import { describe, expect, it } from "vitest";

import { listHref } from "@/modules/applications/list-href";
import { listApplicationsSchema } from "@/modules/applications/schemas";

const filters = (params: Record<string, unknown> = {}) => listApplicationsSchema.parse(params);

describe("adresse de la liste", () => {
  it("revient à /applications sans filtre", () => {
    expect(listHref(filters())).toBe("/applications");
  });

  it("garde la recherche, chaque statut, le contrat, la source, le tri et la page", () => {
    expect(
      listHref(
        filters({
          q: "thal",
          statut: ["APPLIED", "INTERVIEW"],
          contrat: "CDI",
          source: "LINKEDIN",
          tri: "entreprise",
        }),
        { page: 2 },
      ),
    ).toBe("/applications?q=thal&statut=APPLIED&statut=INTERVIEW&contrat=CDI&source=LINKEDIN&tri=entreprise&page=2");
  });

  it("n'écrit ni le tri par défaut ni la page 1", () => {
    expect(listHref(filters({ tri: "modifiee", page: "1", q: "a b" }))).toBe("/applications?q=a+b");
  });
});
