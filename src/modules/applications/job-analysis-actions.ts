"use server";

import { revalidatePath } from "next/cache";

import { getTextGenerator } from "@/lib/ai";
import { getCurrentUserId } from "@/lib/current-user";
import { domainErrorToFormState } from "@/lib/errors";
import type { FormState } from "@/lib/form-state";
import { analyzeJobPosting } from "@/modules/applications/job-analysis";

/** Analyse de l'Annonce (FR-007-01) ; `id` est lié par la page, qui relit l'analyse enregistrée. */
export async function analyzeJobPostingAction(id: string): Promise<FormState> {
  try {
    await analyzeJobPosting(await getCurrentUserId(), id, getTextGenerator());
  } catch (error) {
    return domainErrorToFormState(error);
  }
  revalidatePath(`/applications/${id}`);
  return { status: "success", message: "Analyse terminée." };
}
