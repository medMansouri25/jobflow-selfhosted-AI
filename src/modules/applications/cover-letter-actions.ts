"use server";

import { revalidatePath } from "next/cache";

import { getTextGenerator } from "@/lib/ai";
import { getCurrentUserId } from "@/lib/current-user";
import { domainErrorToFormState } from "@/lib/errors";
import type { FormState } from "@/lib/form-state";
import { generateCoverLetter, saveCoverLetterDraft } from "@/modules/applications/cover-letter";

const MAX_INSTRUCTIONS = 500;
const MAX_DRAFT = 20_000;

/** Génération du brouillon (FR-008-01) ; `id` est lié par la page. Le brouillon revient dans `values.draft`. */
export async function generateCoverLetterAction(id: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const instructions = String(formData.get("instructions") ?? "").slice(0, MAX_INSTRUCTIONS);
  try {
    const draft = await generateCoverLetter(await getCurrentUserId(), id, instructions, getTextGenerator());
    revalidatePath(`/applications/${id}`);
    return { status: "success", message: "Brouillon rédigé. Relis-le et corrige-le avant de l'envoyer.", values: { draft, instructions } };
  } catch (error) {
    return { ...domainErrorToFormState(error), values: { instructions } };
  }
}

/** Enregistrement du brouillon modifié (FR-008-03) ; `id` est lié par la page. */
export async function saveCoverLetterAction(id: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const draft = String(formData.get("draft") ?? "");
  if (draft.length > MAX_DRAFT) {
    return { status: "error", message: `${MAX_DRAFT} caractères maximum.`, values: { draft } };
  }
  try {
    await saveCoverLetterDraft(await getCurrentUserId(), id, draft);
  } catch (error) {
    return { ...domainErrorToFormState(error), values: { draft } };
  }
  revalidatePath(`/applications/${id}`);
  return { status: "success", message: "Brouillon enregistré.", values: { draft } };
}
