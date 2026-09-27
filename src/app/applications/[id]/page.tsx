import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCurrentUserId } from "@/lib/current-user";
import { NotFoundError } from "@/lib/errors";
import { updateApplicationAction } from "@/modules/applications/actions";
import { ApplicationDetail } from "@/modules/applications/components/application-detail";
import { EditApplicationDialog } from "@/modules/applications/components/edit-application-dialog";
import { toFormValues } from "@/modules/applications/form-values";
import { getApplication } from "@/modules/applications/service";

export const metadata: Metadata = {
  title: "Candidature · JobFlow AI",
};

export const dynamic = "force-dynamic";

export default async function ApplicationPage({ params }: PageProps<"/applications/[id]">) {
  const { id } = await params;
  const application = await getApplication(await getCurrentUserId(), id).catch((error) => {
    // Id inconnu, mal formé ou appartenant à quelqu'un d'autre : page 404 (AC-001-20).
    if (error instanceof NotFoundError) notFound();
    throw error;
  });
  return (
    <ApplicationDetail
      application={application}
      actions={
        <EditApplicationDialog
          action={updateApplicationAction.bind(null, application.id)}
          companyName={application.company.name}
          initialValues={toFormValues(application)}
          attachments={application.attachments.map(({ kind, name, size }) => ({ kind, name, size }))}
        />
      }
    />
  );
}
