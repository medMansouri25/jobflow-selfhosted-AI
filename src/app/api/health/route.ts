import { db } from "@/lib/db";

// Toujours exécuté à la demande : c'est l'état de la base *maintenant* qui compte.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", database: "up" });
  } catch {
    return Response.json({ status: "error", database: "down" }, { status: 503 });
  }
}
