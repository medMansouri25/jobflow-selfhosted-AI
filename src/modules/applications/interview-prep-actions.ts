"use server";

import { revalidatePath } from "next/cache";

import { getTextGenerator } from "@/lib/ai";
import { getCurrentUserId } from "@/lib/current-user";
import { domainErrorToFormState } from "@/lib/errors";
import type { FormState } from "@/lib/form-state";
import { prepareInterview } from "@/modules/applications/interview-prep";

/** Fiche de préparation d'un Entretien (FR-009-01) ; `interviewId` est lié par la page. */
export async function prepareInterviewAction(interviewId: string): Promise<FormState> {
  try {
    await prepareInterview(await getCurrentUserId(), interviewId, getTextGenerator());
  } catch (error) {
    return domainErrorToFormState(error);
  }
  revalidatePath("/applications/[id]", "page");
  return { status: "success", message: "Fiche de préparation prête." };
}
