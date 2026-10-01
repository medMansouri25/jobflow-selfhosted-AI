import type { Metadata } from "next";

import { getCurrentUserId } from "@/lib/current-user";
import { createApplicationAction } from "@/modules/applications/actions";
import { ApplicationForm } from "@/modules/applications/components/application-form";
import { listCompanyNames } from "@/modules/companies/service";

export const metadata: Metadata = {
  title: "Nouvelle candidature · JobFlow AI",
};

// Accès direct par URL ; depuis l'interface, le formulaire s'ouvre dans une fenêtre modale.
export default async function NewApplicationPage() {
  const companyNames = await listCompanyNames(await getCurrentUserId());
  return (
    <main className="flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
        Nouvelle candidature
      </h1>
      <div className="max-w-4xl rounded-lg border bg-card p-4 sm:p-6">
        <ApplicationForm action={createApplicationAction} companySuggestions={companyNames} />
      </div>
    </main>
  );
}
