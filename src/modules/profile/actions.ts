"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/current-user";
import { formValues } from "@/lib/form-fields";
import type { FormState } from "@/lib/form-state";
import { profileSchema } from "@/modules/profile/schemas";
import { saveProfile } from "@/modules/profile/service";

/** Enregistrement du Profil (FR-006-04) ; la saisie est renvoyée en cas d'erreur (FR-006-05). */
export async function saveProfileAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  const result = profileSchema.safeParse(values);
  if (!result.success) {
    return {
      status: "error",
      message: "Certains champs sont à corriger.",
      fieldErrors: z.flattenError(result.error).fieldErrors,
      values,
    };
  }

  await saveProfile(await getCurrentUserId(), result.data);
  revalidatePath("/profile");
  return { status: "success", message: "Profil enregistré.", values };
}
