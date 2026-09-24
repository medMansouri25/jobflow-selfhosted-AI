"use server";

import { z } from "zod";

import type { ApplicationFormState } from "@/modules/applications/form-state";
import { createApplicationSchema } from "@/modules/applications/schemas";

/** Date du jour (AAAA-MM-JJ) dans le fuseau de l'utilisateur. */
function todayInParis() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
}

export async function createApplicationAction(
  _previous: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }

  const result = createApplicationSchema(todayInParis()).safeParse(values);
  if (!result.success) {
    return {
      status: "error",
      message: "Certains champs sont à corriger.",
      fieldErrors: z.flattenError(result.error).fieldErrors,
      values,
    };
  }

  // TODO(T1.4) : enregistrer la Candidature via le service `createApplication`
  // une fois PostgreSQL et Prisma branchés (socle technique, missions 2 et 3).
  const { companyName, jobTitle } = result.data;
  return {
    status: "success",
    message: `Candidature « ${jobTitle} » chez ${companyName} validée. L'enregistrement en base sera branché avec la base de données.`,
  };
}
