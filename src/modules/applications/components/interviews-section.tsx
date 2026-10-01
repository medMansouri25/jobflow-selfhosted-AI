import type { ReactNode } from "react";

import type { Interview } from "@/generated/prisma/client";
import type { ApplicationStatus } from "@/modules/applications/domain/application";
import { isDefinitive } from "@/modules/applications/domain/status";
import { Section } from "@/modules/applications/components/section";
import { formatInterviewDate } from "@/modules/applications/format";
import { INTERVIEW_FORMAT_LABELS, INTERVIEW_TYPE_LABELS } from "@/modules/applications/labels";

export type InterviewItem = Pick<
  Interview,
  "id" | "scheduledAt" | "type" | "format" | "location" | "interviewer" | "preparation" | "debrief"
>;

/**
 * Entretiens d'une Candidature (FR-003-04), dans l'ordre reçu (date croissante). `add` : bouton
 * d'ajout, masqué pour une Candidature Refusée (BR-003-03) ; `actionsFor` : boutons d'un Entretien.
 */
export function InterviewsSection({
  status,
  interviews,
  add,
  actionsFor,
}: {
  status: ApplicationStatus;
  interviews: InterviewItem[];
  add?: ReactNode;
  actionsFor?: (interview: InterviewItem) => ReactNode;
}) {
  return (
    <Section title="Entretiens" action={isDefinitive(status) ? undefined : add}>
      {interviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun entretien pour l&apos;instant.</p>
      ) : (
        <ul className="flex flex-col divide-y">
          {interviews.map((interview) => (
            <li key={interview.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="font-semibold">{formatInterviewDate(interview.scheduledAt)}</span>
                  <span className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{INTERVIEW_TYPE_LABELS[interview.type]}</span>
                    {" · "}
                    {INTERVIEW_FORMAT_LABELS[interview.format]}
                    {interview.interviewer && ` · ${interview.interviewer}`}
                  </span>
                </div>
                {actionsFor?.(interview)}
              </div>
              {interview.location && <Location value={interview.location} />}
              {interview.preparation && <Note title="Préparation" text={interview.preparation} />}
              {interview.debrief && <Note title="Compte rendu" text={interview.debrief} />}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

/** Lieu ou lien : cliquable seulement s'il commence par http(s):// (SPEC-003 §9). */
function Location({ value }: { value: string }) {
  return /^https?:\/\//i.test(value) ? (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm break-all text-primary underline-offset-4 hover:underline"
    >
      {value}
    </a>
  ) : (
    <p className="text-sm break-words">{value}</p>
  );
}

function Note({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground">{title}</span>
      <p className="text-sm whitespace-pre-wrap">{text}</p>
    </div>
  );
}
