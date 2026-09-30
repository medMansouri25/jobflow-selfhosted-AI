import { describe, expect, it, vi } from "vitest";

// La base injoignable est simulée : on ne coupe pas la base de test partagée.
vi.mock("@/lib/db", () => ({
  db: { $queryRaw: vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED")) },
}));

const { GET } = await import("@/app/api/health/route");

describe("GET /api/health", () => {
  it("AC-010-07 répond 503 quand la base ne répond pas", async () => {
    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "error", database: "down" });
  });
});
