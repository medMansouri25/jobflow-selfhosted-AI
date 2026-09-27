import type { Metadata } from "next";

import { getCurrentUserId } from "@/lib/current-user";
import { ApplicationsTable } from "@/modules/applications/components/applications-table";
import { listApplications } from "@/modules/applications/service";

export const metadata: Metadata = {
  title: "Candidatures · JobFlow AI",
};

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const applications = await listApplications(await getCurrentUserId());

  return (
    <main className="flex flex-col gap-6 px-8 py-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight">Candidatures</h1>
        <p className="text-sm text-muted-foreground">
          {applications.length} candidature(s)
        </p>
      </div>
      {/* TODO(T1.9) : recherche, filtres, tri et pagination. */}
      <ApplicationsTable
        applications={applications.map((application) => ({
          ...application,
          companyName: application.company.name,
        }))}
      />
    </main>
  );
}
