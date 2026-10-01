import Link from "next/link";
import type { ReactNode } from "react";

import { RowLink } from "@/components/row-link";
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
import { WEEKS_SHOWN, type WeekCount } from "@/modules/dashboard/domain/stats";

export type RecentApplication = {
  id: string;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  updatedAt: Date;
};

export type DashboardStats = {
  responseRate: number | null;
  interviewRate: number | null;
  weeks: WeekCount[];
};

const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
// Les semaines sont des jours AAAA-MM-JJ : formatées en UTC pour ne jamais changer de jour.
const weekFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
const shortWeekFormat = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });

export function Dashboard({
  counts,
  recent,
  stats,
}: {
  counts: Record<ApplicationStatus, number>;
  recent: RecentApplication[];
  stats: DashboardStats;
}) {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <main className="flex flex-col gap-8 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
          Tableau de bord
        </h1>
        <p className="text-sm text-muted-foreground">
          {total} candidature(s) · 0 entretien à venir
        </p>
      </div>

      <section
        aria-label="Indicateurs"
        className="grid grid-cols-2 overflow-hidden rounded-lg border bg-card lg:grid-cols-4"
      >
        <Kpi label="Candidatures" value={total} hint="Tous statuts confondus" highlight />
        <Kpi label="Entretiens" value={counts.INTERVIEW} hint="Candidatures au statut Entretien" />
        <Kpi label="Taux de réponse" value={percent(stats.responseRate)} hint="Entretien ou refus reçu" />
        <Kpi label="Taux d'entretien" value={percent(stats.interviewRate)} hint="Passées par Entretien, même refusées ensuite" />
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
        <ul className="grid grid-cols-3 overflow-hidden rounded-lg border bg-card">
          {APPLICATION_STATUSES.map((status) => (
            <li key={status} className="flex flex-col gap-1 border-r p-3 last:border-r-0 sm:p-4">
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

      <WeeklyChart weeks={stats.weeks} />

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
                    <th
                      key={column}
                      scope="col"
                      className={cn(
                        "px-4 py-2 text-left text-[11px] font-bold tracking-wider text-foreground/60 uppercase",
                        column === "Modifiée" && "hidden sm:table-cell",
                      )}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((application) => (
                  <tr key={application.id} className="relative border-t hover:bg-muted/60">
                    <td className="px-4 py-2.5 font-semibold">
                      <RowLink href={`/applications/${application.id}`}>{application.companyName}</RowLink>
                    </td>
                    <td className="px-4 py-2.5">{application.jobTitle}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={application.status} />
                    </td>
                    <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">
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
    <div className="flex flex-col gap-1 border-b p-4 odd:border-r sm:p-5 lg:border-r lg:border-b-0 lg:last:border-r-0">
      <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span
        className={cn(
          "font-heading text-3xl font-extrabold sm:text-4xl",
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
      <div className="overflow-x-auto rounded-lg border bg-card">{children}</div>
    </section>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="px-5 py-10 text-center text-sm text-muted-foreground">{children}</p>
  );
}

function percent(value: number | null): string {
  return value === null ? "—" : `${value} %`;
}

function WeeklyChart({ weeks }: { weeks: WeekCount[] }) {
  const max = Math.max(...weeks.map((week) => week.count));

  return (
    <section aria-label="Candidatures par semaine" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-heading font-bold">Candidatures par semaine</h2>
        <p className="text-xs text-muted-foreground">
          {WEEKS_SHOWN} dernières semaines, d&apos;après la date de candidature
        </p>
      </div>
      <div className="rounded-lg border bg-card p-3 sm:p-5">
        {max === 0 && (
          <p className="pb-3 text-center text-sm text-muted-foreground">
            Aucune candidature sur les {WEEKS_SHOWN} dernières semaines.
          </p>
        )}
        <ul
          className="grid h-40 items-end gap-1 sm:gap-2"
          style={{ gridTemplateColumns: `repeat(${WEEKS_SHOWN}, minmax(0, 1fr))` }}
        >
          {weeks.map((week) => {
            const monday = new Date(`${week.weekStart}T00:00:00Z`);
            const label = weekFormat.format(monday);
            return (
              <li
                key={week.weekStart}
                aria-label={`Semaine du ${label} : ${week.count} candidature${week.count > 1 ? "s" : ""}`}
                className="flex h-full flex-col items-center justify-end gap-1"
              >
                <span aria-hidden className="text-xs font-semibold">
                  {week.count > 0 ? week.count : ""}
                </span>
                <span aria-hidden className="flex w-full flex-1 items-end">
                  <span
                    className="w-full rounded-t-sm bg-primary"
                    style={{ height: max > 0 ? `${(week.count / max) * 100}%` : 0 }}
                  />
                </span>
                <span aria-hidden className="text-[10px] whitespace-nowrap text-muted-foreground sm:text-[11px]">
                  <span className="sm:hidden">{shortWeekFormat.format(monday)}</span>
                  <span className="hidden sm:inline">{label}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
