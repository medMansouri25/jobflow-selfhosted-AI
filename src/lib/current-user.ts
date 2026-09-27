import { db } from "@/lib/db";

let cachedUserId: string | undefined;

/**
 * Identifiant de l'utilisateur courant. Application mono-utilisateur derrière Tailscale (ADR 0001) :
 * c'est l'utilisateur unique créé par le seed. Seul endroit à changer le jour où une authentification arrive.
 */
export async function getCurrentUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;
  const user = await db.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) {
    throw new Error("Aucun utilisateur en base : lance `npm run db:seed`.");
  }
  cachedUserId = user.id;
  return user.id;
}
