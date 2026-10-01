import { z } from "zod";

import { parisLocalToUtc, utcToParisLocal } from "@/lib/dates";
import { INTERVIEW_FORMATS, INTERVIEW_TYPES } from "@/modules/applications/domain/application";
import { emptyToUndefined, optionalText } from "@/lib/form-fields";
import { required } from "@/modules/applications/schemas";

/** Champ `datetime-local` (AAAA-MM-JJTHH:MM), saisi à l'heure de Paris → instant UTC (SPEC-003 §6). */
const parisDateTime = z.preprocess(
  (value) => emptyToUndefined(value) ?? "",
  z
    .string()
    .min(1, { error: "La date et l'heure sont obligatoires", abort: true })
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Date et heure invalides")
    .transform((local, ctx) => {
      // Un 30 février ou un mois 13 passent l'expression régulière : le jour doit se relire à l'identique.
      // (Seul le jour est comparé : une heure sautée au passage à l'heure d'été est décalée d'une heure.)
      const instant = parisLocalToUtc(local);
      if (Number.isNaN(instant.getTime()) || utcToParisLocal(instant).slice(0, 10) !== local.slice(0, 10)) {
        ctx.addIssue({ code: "custom", message: "Date et heure invalides" });
        return z.NEVER;
      }
      return instant;
    }),
);

/** Formulaire d'un Entretien, à l'ajout comme à la modification (FR-003-01, 02). */
export const interviewSchema = z.object({
  scheduledAt: parisDateTime,
  type: required(z.enum(INTERVIEW_TYPES), "Le type"),
  format: required(z.enum(INTERVIEW_FORMATS), "Le format"),
  location: optionalText(500),
  interviewer: optionalText(200),
  preparation: optionalText(10_000),
  debrief: optionalText(10_000),
});

export type InterviewInput = z.infer<typeof interviewSchema>;
