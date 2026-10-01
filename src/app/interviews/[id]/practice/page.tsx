import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentUserId } from "@/lib/current-user";
import { NotFoundError } from "@/lib/errors";
import { PracticeSession } from "@/modules/applications/components/practice-session";
import { formatInterviewDate } from "@/modules/applications/format";
import { INTERVIEW_TYPE_LABELS } from "@/modules/applications/labels";
import { getPracticeInterview } from "@/modules/applications/practice";
import {
  practiceDebriefAction,
  practiceFeedbackAction,
  startPracticeAction,
} from "@/modules/applications/practice-actions";

export const metadata: Metadata = {
  title: "Entraînement · JobFlow AI",
};

export const dynamic = "force-dynamic";

/** Entraînement à un Entretien (SPEC-009, B). */
export default async function PracticePage({ params }: PageProps<"/interviews/[id]/practice">) {
  const { id } = await params;
  const { interview, application } = await getPracticeInterview(await getCurrentUserId(), id).catch((error) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  return (
    <main className="flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-2">
        <Link href={`/applications/${application.id}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← {application.company.name} — {application.jobTitle}
        </Link>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">Entraînement</h1>
        <p className="text-muted-foreground">
          Entretien {INTERVIEW_TYPE_LABELS[interview.type]} · {formatInterviewDate(interview.scheduledAt)}
        </p>
      </div>
      <PracticeSession
        start={startPracticeAction.bind(null, interview.id)}
        feedback={practiceFeedbackAction.bind(null, interview.id)}
        debrief={practiceDebriefAction.bind(null, interview.id)}
      />
    </main>
  );
}
