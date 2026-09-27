import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Deux pièces jointes de 4 Mo + le formulaire : la limite par défaut (1 Mo) est trop basse.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
