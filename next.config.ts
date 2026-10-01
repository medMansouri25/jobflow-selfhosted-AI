import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serveur autonome (`.next/standalone`) pour l'image Docker : seules les dépendances utilisées sont copiées.
  output: "standalone",
  experimental: {
    // Deux pièces jointes de 4 Mo + le formulaire : la limite par défaut (1 Mo) est trop basse.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
