import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/modules/applications/domain/application";
import {
  STATUS_DOT_CLASSES,
  StatusBadge,
} from "@/modules/applications/components/status-badge";
import { STATUS_LABELS } from "@/modules/applications/labels";

export type RecentApplication = {
  id: string;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  updatedAt: Date;
};

const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });

export function Dashboard({
  counts,
  recent,
}: {
  counts: Record<ApplicationStatus, number>;
  recent: RecentApplication[];
}) {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <main className="flex flex-col gap-8 px-8 py-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-sm text-muted-foreground">
          {total} candidature(s) · 0 entretien à venir
        </p>
      </div>

      <section
        aria-label="Indicateurs"
        className="grid overflow-hidden rounded-lg border bg-card sm:grid-cols-2"
      >
        <Kpi label="Candidatures" value={total} hint="Tous statuts confondus" highlight />
        {/* TODO(SPEC-002) : taux de réponse et d'entretien, calculés depuis l'historique des statuts. */}
        <Kpi label="Entretiens" value={counts.INTERVIEW} hint="Candidatures au statut Entretien" />
      </section>

      <section aria-label="Répartition par statut" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-heading font-bold">
            Répartition par statut
          </h2>
          <p className="text-xs text-muted-foreground">
            Toutes candidatures confondues
          </p>
        </div>
        <div aria-hidden className="flex h-2 overflow-hidden rounded-full bg-muted">
          {total > 0 &&
            APPLICATION_STATUSES.map((status) => (
              <span
                key={status}
                className={STATUS_DOT_CLASSES[status]}
                style={{ width: `${(counts[status] / total) * 100}%` }}
              />
            ))}
        </div>
        <ul className="grid overflow-hidden rounded-lg border bg-card sm:grid-cols-3">
          {APPLICATION_STATUSES.map((status) => (
            <li key={status} className="flex flex-col gap-1 border-r border-b p-4 last:border-r-0">
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span aria-hidden className={cn("size-2 rounded-sm", STATUS_DOT_CLASSES[status])} />
                {STATUS_LABELS[status]}
              </span>
              <span className="font-heading text-2xl font-extrabold">
                {counts[status]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Prochains entretiens">
          <EmptyState>
            Aucun entretien prévu. La gestion des entretiens arrive en phase 3.
          </EmptyState>
        </Panel>
        <Panel
          title="Candidatures récentes"
          action={
            <Link href="/applications" className="text-sm font-semibold text-primary hover:underline">
              Toutes →
            </Link>
          }
        >
          {recent.length === 0 ? (
            <EmptyState>
              Aucune candidature pour l&apos;instant. Utilise « Nouvelle
              candidature » en haut à droite.
            </EmptyState>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {["Entreprise", "Poste", "Statut", "Modifiée"].map((column) => (
                    <th key={column} scope="col" className="px-4 py-2 text-left text-[11px] font-bold tracking-wider text-foreground/60 uppercase">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((application) => (
                  <tr key={application.id} className="border-t">
                    <td className="px-4 py-2.5 font-semibold">{application.companyName}</td>
                    <td className="px-4 py-2.5">{application.jobTitle}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={application.status} />
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {dateFormat.format(application.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>
    </main>
  );
}

function Kpi({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: ReactNode;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 border-b p-5 sm:border-r lg:border-b-0 last:border-r-0">
      <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span
        className={cn(
          "font-heading text-4xl font-extrabold",
          highlight && "text-primary",
        )}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-heading font-bold">{title}</h2>
        {action}
      </div>
      <div className="rounded-lg border bg-card">{children}</div>
    </section>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="px-5 py-10 text-center text-sm text-muted-foreground">{children}</p>
  );
}
