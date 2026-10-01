import { describe, expect, it } from "vitest";

import { securityHeaders } from "@/lib/security-headers";

const asMap = (dev: boolean) => new Map(securityHeaders(dev).map(({ key, value }) => [key, value]));

describe("en-têtes de sécurité", () => {
  it("AC-012-03 pose la CSP et les en-têtes de protection", () => {
    const headers = asMap(false);

    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");
    expect(headers.get("Strict-Transport-Security")).toMatch(/^max-age=\d+/);
  });

  it("FR-012-06 limite la CSP à JobFlow et interdit l'affichage dans un autre site", () => {
    const csp = asMap(false).get("Content-Security-Policy")!;

    for (const directive of [
      "default-src 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "connect-src 'self'",
    ]) {
      expect(csp).toContain(directive);
    }
  });

  it("BR-012-04 n'autorise eval qu'en développement (rechargement à chaud)", () => {
    expect(asMap(false).get("Content-Security-Policy")).not.toContain("unsafe-eval");
    expect(asMap(true).get("Content-Security-Policy")).toContain("'unsafe-eval'");
  });
});
