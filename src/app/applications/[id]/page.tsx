import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCurrentUserId } from "@/lib/current-user";
import { NotFoundError } from "@/lib/errors";
import {
  changeStatusAction,
  deleteApplicationAction,
  updateApplicationAction,
} from "@/modules/applications/actions";
import { ApplicationDetail } from "@/modules/applications/components/application-detail";
import { DeleteApplicationButton } from "@/modules/applications/components/delete-application-button";
import { EditApplicationDialog } from "@/modules/applications/components/edit-application-dialog";
import {
  AddInterviewDialog,
  DeleteInterviewButton,
  EditInterviewDialog,
} from "@/modules/applications/components/interview-dialogs";
import { InterviewsSection } from "@/modules/applications/components/interviews-section";
import { formatInterviewDate } from "@/modules/applications/format";
import { StatusPanel } from "@/modules/applications/components/status-panel";
import {
  addInterviewAction,
  deleteInterviewAction,
  updateInterviewAction,
} from "@/modules/applications/interview-actions";
import { INTERVIEW_TYPE_LABELS } from "@/modules/applications/labels";
import { toFormValues, toInterviewFormValues } from "@/modules/applications/form-values";
import { getApplication } from "@/modules/applications/service";
import { listCompanyNames } from "@/modules/companies/service";

export const metadata: Metadata = {
  title: "Candidature · JobFlow AI",
};

export const dynamic = "force-dynamic";

export default async function ApplicationPage({ params }: PageProps<"/applications/[id]">) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const companyNames = await listCompanyNames(userId);
  const application = await getApplication(userId, id).catch((error) => {
    // Id inconnu, mal formé ou appartenant à quelqu'un d'autre : page 404 (AC-001-20).
    if (error instanceof NotFoundError) notFound();
    throw error;
  });
  return (
    <ApplicationDetail
      application={application}
      interviews={
        <InterviewsSection
          status={application.status}
          interviews={application.interviews}
          add={<AddInterviewDialog action={addInterviewAction.bind(null, application.id)} />}
          actionsFor={(interview) => {
            const label = `Entretien ${INTERVIEW_TYPE_LABELS[interview.type]} du ${formatInterviewDate(interview.scheduledAt)}`;
            return (
              <div className="flex gap-1">
                <EditInterviewDialog
                  action={updateInterviewAction.bind(null, interview.id)}
                  initialValues={toInterviewFormValues(interview)}
                  label={label}
                />
                <DeleteInterviewButton action={deleteInterviewAction.bind(null, interview.id)} label={label} />
              </div>
            );
          }}
        />
      }
      statusPanel={
        <StatusPanel
          status={application.status}
          action={changeStatusAction.bind(null, application.id)}
        />
      }
      actions={
        <>
          <EditApplicationDialog
            action={updateApplicationAction.bind(null, application.id)}
            companyName={application.company.name}
            initialValues={toFormValues(application)}
            attachments={application.attachments.map(({ kind, name, size }) => ({ kind, name, size }))}
            companySuggestions={companyNames}
          />
          <DeleteApplicationButton
            action={deleteApplicationAction.bind(null, application.id)}
            jobTitle={application.jobTitle}
            companyName={application.company.name}
          />
        </>
      }
    />
  );
}
