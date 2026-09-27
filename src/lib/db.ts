import { createPrismaClient, type Database } from "@/lib/db-client";
import { getEnv } from "@/lib/env";

// Un seul client pour tout le serveur. En dev, le rechargement à chaud réévalue ce module :
// on garde l'instance sur globalThis pour ne pas ouvrir un nouveau pool à chaque modification.
const globalForPrisma = globalThis as unknown as { prisma?: Database };

export const db = globalForPrisma.prisma ?? createPrismaClient(getEnv().DATABASE_URL);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
