// Passage d'une Candidature enregistrée aux valeurs texte du formulaire (modification, FR-001-02).

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
    // Date sans heure, stockée à minuit UTC : on reprend AAAA-MM-JJ tel quel.
    appliedAt: application.appliedAt ? application.appliedAt.toISOString().slice(0, 10) : "",
    notes: text(application.notes),
  };
}
