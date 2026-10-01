import Link from "next/link";

import type { InterviewFormat, InterviewType } from "@/modules/applications/domain/application";
import { formatInterviewDate } from "@/modules/applications/format";
import { INTERVIEW_FORMAT_LABELS, INTERVIEW_TYPE_LABELS } from "@/modules/applications/labels";

export type InterviewListEntry = {
  id: string;
  scheduledAt: Date;
  type: InterviewType;
  format: InterviewFormat;
  application: { id: string; jobTitle: string; company: { name: string } };
};

/** Entretiens de plusieurs Candidatures (tableau de bord, page « Entretiens »), dans l'ordre reçu. */
export function InterviewList({ interviews, empty }: { interviews: InterviewListEntry[]; empty: string }) {
  if (interviews.length === 0) {
    return <p className="px-5 py-10 text-center text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className="divide-y">
      {interviews.map((interview) => (
        <li key={interview.id} className="flex flex-col gap-0.5 px-4 py-3 sm:px-5">
          <span className="text-sm font-semibold">{formatInterviewDate(interview.scheduledAt)}</span>
          <Link
            href={`/applications/${interview.application.id}`}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            {interview.application.company.name} — {interview.application.jobTitle}
          </Link>
          <span className="text-xs text-muted-foreground">
            {INTERVIEW_TYPE_LABELS[interview.type]} · {INTERVIEW_FORMAT_LABELS[interview.format]}
          </span>
        </li>
      ))}
    </ul>
  );
}
