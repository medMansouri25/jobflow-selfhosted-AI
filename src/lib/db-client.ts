import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

/** Client Prisma branché sur PostgreSQL via le driver `pg` (ADR 0003). */
export function createPrismaClient(connectionString: string) {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export type Database = ReturnType<typeof createPrismaClient>;
