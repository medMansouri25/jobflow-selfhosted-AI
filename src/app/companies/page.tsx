import type { Metadata } from "next";

import { getCurrentUserId } from "@/lib/current-user";
import { CompaniesList } from "@/modules/companies/components/companies-list";
import { listCompanyOverviews } from "@/modules/companies/overview";

export const metadata: Metadata = {
  title: "Entreprises · JobFlow AI",
};

export const dynamic = "force-dynamic";

/** Les Entreprises et leurs Candidatures. */
export default async function CompaniesPage() {
  const companies = await listCompanyOverviews(await getCurrentUserId());

  return (
    <main className="flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">Entreprises</h1>
        <p className="text-sm text-muted-foreground">{companies.length} entreprise(s)</p>
      </div>
      <CompaniesList companies={companies} />
    </main>
  );
}
