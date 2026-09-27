import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "@/modules/applications/components/status-badge";

describe("badge de statut", () => {
  it.each([
    ["DRAFT", "Brouillon"],
    ["APPLIED", "Postulée"],
    ["INTERVIEW", "Entretien"],
    ["ACCEPTED", "Acceptée"],
    ["REJECTED", "Refusée"],
    ["ARCHIVED", "Classée"],
  ] as const)("affiche %s sous son libellé français « %s »", (status, label) => {
    render(<StatusBadge status={status} />);

    expect(screen.getByText(label)).toBeDefined();
    expect(screen.queryByText(status)).toBeNull();
  });
});
