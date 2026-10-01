import type { NextConfig } from "next";

import { securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  // Serveur autonome (`.next/standalone`) pour l'image Docker : seules les dépendances utilisées sont copiées.
  output: "standalone",
  // Pas d'en-tête « X-Powered-By: Next.js » : rien à apprendre à un visiteur sur la pile utilisée.
  poweredByHeader: false,
  experimental: {
    // Deux pièces jointes de 4 Mo + le formulaire : la limite par défaut (1 Mo) est trop basse.
    serverActions: { bodySizeLimit: "10mb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders(process.env.NODE_ENV === "development") }];
  },
};

export default nextConfig;
