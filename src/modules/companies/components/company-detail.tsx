import Link from "next/link";
import type { ReactNode } from "react";

import { RowLink } from "@/components/row-link";
import { InterviewList } from "@/modules/applications/components/interview-list";
import { StatusBadge } from "@/modules/applications/components/status-badge";
import type { CompanyDetail as CompanyDetailData } from "@/modules/companies/overview";

const dayFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** Fiche d'une Entreprise : ses Candidatures et tous ses Entretiens (lecture seule). */
export function CompanyDetail({ company }: { company: CompanyDetailData }) {
  return (
    <main className="flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-2">
        <Link href="/companies" className="text-sm text-muted-foreground hover:text-foreground">
          ← Entreprises
        </Link>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{company.name}</h1>
      </div>

      <Block title={`Candidatures (${company.applications.length})`}>
        {company.applications.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">Aucune candidature chez cette entreprise.</p>
        ) : (
          <ul className="divide-y">
            {company.applications.map((application) => (
              <li
                key={application.id}
                className="relative flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm hover:bg-muted/60 sm:px-5"
              >
                <span className="font-semibold">
                  <RowLink href={`/applications/${application.id}`}>{application.jobTitle}</RowLink>
                </span>
                <StatusBadge status={application.status} />
                {application.appliedAt && (
                  <span className="text-muted-foreground">Postulée le {dayFormat.format(application.appliedAt)}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Block>

      <Block title={`Entretiens (${company.interviews.length})`}>
        <InterviewList interviews={company.interviews} empty="Aucun entretien avec cette entreprise." />
      </Block>
    </main>
  );
}

/** Titre et carte pleine largeur (même présentation que la page « Entretiens »). */
function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h2 className="font-heading font-bold">{title}</h2>
      <div className="rounded-lg border bg-card">{children}</div>
    </section>
  );
}
