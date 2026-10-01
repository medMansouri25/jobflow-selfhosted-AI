// En-têtes de sécurité de toutes les pages (SPEC-012, FR-012-06), posés par next.config.ts.

/**
 * Politique de contenu : tout vient de JobFlow. `'unsafe-inline'` reste nécessaire aux scripts
 * d'amorçage et aux styles de Next.js (sans nonce) ; `'unsafe-eval'` seulement en développement,
 * pour le rechargement à chaud (BR-012-04). Les liens externes (annonce, visio, PDF) sont des
 * navigations, que la CSP ne bloque pas.
 */
function contentSecurityPolicy(dev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${dev ? " ws:" : ""}`,
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function securityHeaders(dev: boolean): { key: string; value: string }[] {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(dev) },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    // Ignoré en HTTP (localhost) ; en production, le site n'est servi qu'en HTTPS par Tailscale.
    { key: "Strict-Transport-Security", value: "max-age=31536000" },
  ];
}
