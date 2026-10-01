import { Video } from "lucide-react";
import Link from "next/link";

import type { InterviewFormat, InterviewType } from "@/modules/applications/domain/application";
import { formatInterviewDate } from "@/modules/applications/format";
import { INTERVIEW_FORMAT_LABELS, INTERVIEW_TYPE_LABELS } from "@/modules/applications/labels";
import { meetingLink } from "@/modules/applications/meeting-link";

export type InterviewListEntry = {
  id: string;
  scheduledAt: Date;
  type: InterviewType;
  format: InterviewFormat;
  location: string | null;
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
        <li key={interview.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 flex-col gap-0.5">
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
          </div>
          <JoinButton location={interview.location} />
        </li>
      ))}
    </ul>
  );
}

/** « Rejoindre sur Teams » : ouvre le lien de visio dans un nouvel onglet (FR-004-07). Rien sans lien. */
export function JoinButton({ location }: { location: string | null }) {
  const link = meetingLink(location);
  if (!link) return null;
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
    >
      <Video aria-hidden className="size-3.5" />
      Rejoindre sur {link.platform}
    </a>
  );
}
