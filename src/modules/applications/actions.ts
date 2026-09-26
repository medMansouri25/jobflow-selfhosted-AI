"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/current-user";
import { domainErrorToFormState } from "@/lib/errors";
import type { ApplicationFormState } from "@/modules/applications/form-state";
import { createApplicationSchema } from "@/modules/applications/schemas";
import { createApplication } from "@/modules/applications/service";

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

  const { companyName, jobTitle, status } = result.data;
  try {
    await createApplication(await getCurrentUserId(), result.data);
  } catch (error) {
    return { ...domainErrorToFormState(error), values };
  }

  revalidatePath("/", "layout");
  return {
    status: "success",
    message: `Candidature « ${jobTitle} » chez ${companyName} enregistrée ${
      status === "DRAFT" ? "en brouillon" : "comme postulée"
    }.`,
  };
}
