"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/current-user";
import { todayInParis } from "@/lib/dates";
import { domainErrorToFormState } from "@/lib/errors";
import type { ApplicationFormState } from "@/modules/applications/form-state";
import {
  createApplicationSchema,
  updateApplicationSchema,
} from "@/modules/applications/schemas";
import { createApplication, updateApplication } from "@/modules/applications/service";

/**
 * Sépare le texte et les fichiers du formulaire : les deux sont validés, seul le texte est renvoyé
 * au formulaire en cas d'erreur (un fichier ne peut pas l'être, le navigateur l'interdit).
 */
function readForm(formData: FormData) {
  const values: Record<string, string> = {};
  const files: Record<string, File> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
    else files[key] = value;
  }
  return { values, input: { ...values, ...files } };
}

function invalid(error: z.ZodError, values: Record<string, string>): ApplicationFormState {
  return {
    status: "error",
    message: "Certains champs sont à corriger.",
    fieldErrors: z.flattenError(error).fieldErrors,
    values,
  };
}

export async function createApplicationAction(
  _previous: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const { values, input } = readForm(formData);
  const result = createApplicationSchema(todayInParis()).safeParse(input);
  if (!result.success) return invalid(result.error, values);

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

/** Modification (FR-001-02) ; `id` est lié par la page (`updateApplicationAction.bind(null, id)`). */
export async function updateApplicationAction(
  id: string,
  _previous: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const { values, input } = readForm(formData);
  const result = updateApplicationSchema(todayInParis()).safeParse(input);
  if (!result.success) return invalid(result.error, values);

  let leftover: string | null;
  try {
    ({ leftover } = await updateApplication(await getCurrentUserId(), id, result.data));
  } catch (error) {
    return { ...domainErrorToFormState(error), values };
  }

  revalidatePath("/", "layout");
  const saved = `Candidature « ${result.data.jobTitle} » mise à jour.`;
  // Enregistré, mais un ancien fichier est resté chez le stockage : la fenêtre reste ouverte pour le dire.
  return leftover
    ? { status: "warning", message: `${saved} ${leftover}` }
    : { status: "success", message: saved };
}
