"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/current-user";
import { domainErrorToFormState } from "@/lib/errors";
import { formValues } from "@/lib/form-fields";
import type { FormState } from "@/lib/form-state";
import { interviewSchema } from "@/modules/applications/interview-schemas";
import { addInterview, deleteInterview, updateInterview } from "@/modules/applications/interviews";
import { INTERVIEW_TYPE_LABELS } from "@/modules/applications/labels";

function readInterviewForm(formData: FormData) {
  const values = formValues(formData);
  const result = interviewSchema.safeParse(values);
  return { values, result };
}

function invalid(error: z.ZodError, values: Record<string, string>): FormState {
  return {
    status: "error",
    message: "Certains champs sont à corriger.",
    fieldErrors: z.flattenError(error).fieldErrors,
    values,
  };
}

/** Ajout d'un Entretien (FR-003-01) ; `applicationId` est lié par la page. */
export async function addInterviewAction(
  applicationId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const { values, result } = readInterviewForm(formData);
  if (!result.success) return invalid(result.error, values);

  try {
    await addInterview(await getCurrentUserId(), applicationId, result.data);
  } catch (error) {
    return { ...domainErrorToFormState(error), values };
  }

  revalidatePath("/", "layout");
  return { status: "success", message: `Entretien ${INTERVIEW_TYPE_LABELS[result.data.type]} ajouté.` };
}

/** Modification d'un Entretien (FR-003-02) ; `id` est lié par la page. */
export async function updateInterviewAction(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const { values, result } = readInterviewForm(formData);
  if (!result.success) return invalid(result.error, values);

  try {
    await updateInterview(await getCurrentUserId(), id, result.data);
  } catch (error) {
    return { ...domainErrorToFormState(error), values };
  }

  revalidatePath("/", "layout");
  return { status: "success", message: "Entretien mis à jour." };
}

/** Suppression d'un Entretien (FR-003-03) ; `id` est lié par la page. */
export async function deleteInterviewAction(id: string): Promise<FormState> {
  try {
    await deleteInterview(await getCurrentUserId(), id);
  } catch (error) {
    return domainErrorToFormState(error);
  }

  revalidatePath("/", "layout");
  return { status: "success", message: "Entretien supprimé." };
}
