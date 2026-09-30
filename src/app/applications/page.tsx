import type { Metadata } from "next";

import { getCurrentUserId } from "@/lib/current-user";
import { ApplicationFilters } from "@/modules/applications/components/application-filters";
import { ApplicationsTable } from "@/modules/applications/components/applications-table";
import { Pagination } from "@/modules/applications/components/pagination";
import { hasActiveFilters, listApplicationsSchema } from "@/modules/applications/schemas";
import { listApplications } from "@/modules/applications/service";

export const metadata: Metadata = {
  title: "Candidatures · JobFlow AI",
};

export const dynamic = "force-dynamic";

export default async function ApplicationsPage({ searchParams }: PageProps<"/applications">) {
  // Les filtres vivent dans l'adresse (FR-001-09 à 12) : favoris et bouton « Précédent » fonctionnent.
  const filters = listApplicationsSchema.parse(await searchParams);
  const { applications, total, page, pages } = await listApplications(
    await getCurrentUserId(),
    filters,
  );

  return (
    <main className="flex flex-col gap-6 px-8 py-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight">Candidatures</h1>
        <p className="text-sm text-muted-foreground">{total} candidature(s)</p>
      </div>
      <ApplicationFilters filters={filters} />
      <ApplicationsTable
        filtered={hasActiveFilters(filters)}
        applications={applications.map((application) => ({
          ...application,
          companyName: application.company.name,
        }))}
      />
      <Pagination filters={filters} page={page} pages={pages} total={total} />
    </main>
  );
}
