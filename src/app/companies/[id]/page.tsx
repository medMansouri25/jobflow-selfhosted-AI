import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCurrentUserId } from "@/lib/current-user";
import { NotFoundError } from "@/lib/errors";
import { CompanyDetail } from "@/modules/companies/components/company-detail";
import { getCompanyOverview } from "@/modules/companies/overview";

export const metadata: Metadata = {
  title: "Entreprise · JobFlow AI",
};

export const dynamic = "force-dynamic";

/** Fiche d'une Entreprise ; id inconnu, mal formé ou d'un autre utilisateur : page 404. */
export default async function CompanyPage({ params }: PageProps<"/companies/[id]">) {
  const { id } = await params;
  const company = await getCompanyOverview(await getCurrentUserId(), id).catch((error) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  return <CompanyDetail company={company} />;
}
