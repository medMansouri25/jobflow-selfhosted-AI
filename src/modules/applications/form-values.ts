// Correspondance entre la saisie du formulaire et les colonnes d'une Candidature, dans les deux sens :
// `toColumns` à l'enregistrement, `toFormValues` pour pré-remplir la modification (FR-001-02).

import { utcToParisLocal } from "@/lib/dates";
import type { CreateApplicationInput } from "@/modules/applications/schemas";

/** Date sans heure (AAAA-MM-JJ) ↔ colonne `date`, stockée à minuit UTC. */
export function dateOnlyToColumn(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}
export function columnToDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Colonnes saisies d'une Candidature. Chaque colonne est écrite explicitement : un champ vidé
 * devient `null` (Prisma ignorerait `undefined` et garderait l'ancienne valeur).
 */
export function toColumns(input: CreateApplicationInput) {
  const hasSalary = input.salaryMin !== undefined || input.salaryMax !== undefined;
  return {
    jobTitle: input.jobTitle,
    location: input.location,
    contractType: input.contractType,
    source: input.source,
    jobUrl: input.jobUrl ?? null,
    jobDescription: input.jobDescription ?? null,
    salaryMin: input.salaryMin ?? null,
    salaryMax: input.salaryMax ?? null,
    salaryCurrency: hasSalary ? input.salaryCurrency : null,
    salaryPeriod: input.salaryPeriod ?? null,
    appliedAt: dateOnlyToColumn(input.appliedAt),
    notes: input.notes ?? null,
  };
}

type EditableApplication = {
  company: { name: string };
  jobTitle: string;
  location: string | null;
  contractType: string | null;
  source: string | null;
  jobUrl: string | null;
  jobDescription: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;
  appliedAt: Date | null;
  notes: string | null;
};

/** Valeurs de départ du formulaire : chaînes, vides pour un champ non renseigné. */
export function toFormValues(application: EditableApplication): Record<string, string> {
  const text = (value: string | number | null) => (value === null ? "" : String(value));
  return {
    companyName: application.company.name,
    jobTitle: application.jobTitle,
    location: text(application.location),
    contractType: text(application.contractType),
    source: text(application.source),
    jobUrl: text(application.jobUrl),
    jobDescription: text(application.jobDescription),
    salaryMin: text(application.salaryMin),
    salaryMax: text(application.salaryMax),
    salaryCurrency: text(application.salaryCurrency),
    salaryPeriod: text(application.salaryPeriod),
    appliedAt: application.appliedAt ? columnToDateOnly(application.appliedAt) : "",
    notes: text(application.notes),
  };
}

/** Entretien enregistré → valeurs du formulaire de modification (FR-003-02), heure de Paris. */
export function toInterviewFormValues(interview: {
  scheduledAt: Date;
  type: string;
  format: string;
  location: string | null;
  interviewer: string | null;
  preparation: string | null;
  debrief: string | null;
}): Partial<Record<string, string>> {
  return {
    scheduledAt: utcToParisLocal(interview.scheduledAt),
    type: interview.type,
    format: interview.format,
    location: interview.location ?? undefined,
    interviewer: interview.interviewer ?? undefined,
    preparation: interview.preparation ?? undefined,
    debrief: interview.debrief ?? undefined,
  };
}
