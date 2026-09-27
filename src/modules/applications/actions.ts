"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/current-user";
import { todayInParis } from "@/lib/dates";
import { domainErrorToFormState } from "@/lib/errors";
import type { ApplicationFormState } from "@/modules/applications/form-state";
import { createApplicationSchema } from "@/modules/applications/schemas";
import { createApplication } from "@/modules/applications/service";

export async function createApplicationAction(
  _previous: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  // Le texte est renvoyé au formulaire en cas d'erreur ; un fichier ne peut pas l'être (le navigateur l'interdit).
  const values: Record<string, string> = {};
  const files: Record<string, File> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
    else files[key] = value;
  }

  const result = createApplicationSchema(todayInParis()).safeParse({ ...values, ...files });
  if (!result.success) {
    return {
      status: "error",
      message: "Certains champs sont à corriger.",
      fieldErrors: z.flattenError(result.error).fieldErrors,
      values,
    };
  }

  const { companyName, jobTitle } = result.data;
  try {
    await createApplication(await getCurrentUserId(), result.data);
  } catch (error) {
    return { ...domainErrorToFormState(error), values };
  }

  revalidatePath("/", "layout");
  return {
    status: "success",
    message: `Candidature « ${jobTitle} » chez ${companyName} enregistrée.`,
  };
}
