import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RowLink } from "@/components/row-link";
import { getCurrentUserId } from "@/lib/current-user";
import { NotFoundError } from "@/lib/errors";
import { InterviewList } from "@/modules/applications/components/interview-list";
import { Section } from "@/modules/applications/components/section";
import { StatusBadge } from "@/modules/applications/components/status-badge";
import { getCompanyOverview } from "@/modules/companies/overview";

export const metadata: Metadata = {
  title: "Entreprise · JobFlow AI",
};

export const dynamic = "force-dynamic";

const dayFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** Fiche d'une Entreprise : ses Candidatures et leurs Entretiens. */
export default async function CompanyPage({ params }: PageProps<"/companies/[id]">) {
  const { id } = await params;
  const company = await getCompanyOverview(await getCurrentUserId(), id).catch((error) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });
  const interviews = company.applications
    .flatMap((application) =>
      application.interviews.map((interview) => ({
        ...interview,
        application: { id: application.id, jobTitle: application.jobTitle, company: { name: company.name } },
      })),
    )
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

  return (
    <main className="flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-2">
        <Link href="/companies" className="text-sm text-muted-foreground hover:text-foreground">
          ← Entreprises
        </Link>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{company.name}</h1>
        {company.website && /^https?:\/\//i.test(company.website) && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm break-all text-primary underline-offset-4 hover:underline"
          >
            {company.website}
          </a>
        )}
      </div>

      <Section title={`Candidatures (${company.applications.length})`}>
        {company.applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune candidature chez cette entreprise.</p>
        ) : (
          <ul className="flex flex-col divide-y">
            {company.applications.map((application) => (
              <li key={application.id} className="relative flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm hover:bg-muted/60">
                <span className="font-semibold">
                  <RowLink href={`/applications/${application.id}`}>{application.jobTitle}</RowLink>
                </span>
                <StatusBadge status={application.status} />
                <span className="text-muted-foreground">
                  {application.appliedAt ? `Postulée le ${dayFormat.format(application.appliedAt)}` : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Entretiens (${interviews.length})`}>
        <div className="-mx-5 -mb-5">
          <InterviewList interviews={interviews} empty="Aucun entretien avec cette entreprise." />
        </div>
      </Section>
    </main>
  );
}
