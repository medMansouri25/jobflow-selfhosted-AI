import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/modules/applications/domain/application";
import { STATUS_LABELS } from "@/modules/applications/labels";

// TODO(SPEC-002) : ces compteurs viendront du service applications une fois la base branchée.
const COUNTS: Record<ApplicationStatus, number> = {
  DRAFT: 0,
  APPLIED: 0,
  INTERVIEW: 0,
  ACCEPTED: 0,
  REJECTED: 0,
  ARCHIVED: 0,
};

const STATUS_DOT: Record<ApplicationStatus, string> = {
  DRAFT: "bg-status-draft",
  APPLIED: "bg-status-applied",
  INTERVIEW: "bg-status-interview",
  ACCEPTED: "bg-status-accepted",
  REJECTED: "bg-status-rejected",
  ARCHIVED: "bg-status-archived",
};

export default function Home() {
  const total = Object.values(COUNTS).reduce((sum, n) => sum + n, 0);
  const active = COUNTS.DRAFT + COUNTS.APPLIED + COUNTS.INTERVIEW;

  return (
    <main className="flex flex-col gap-8 px-8 py-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-sm text-muted-foreground">
          {active} active(s) · 0 entretien à venir
        </p>
      </div>

      <section
        aria-label="Indicateurs"
        className="grid overflow-hidden rounded-lg border bg-card sm:grid-cols-2 lg:grid-cols-4"
      >
        <Kpi label="Candidatures" value={total} hint={`${COUNTS.DRAFT} brouillon(s) inclus`} />
        <Kpi
          label="Actives"
          value={active}
          hint="Brouillon · Postulée · Entretien"
          highlight
        />
        <Kpi label="Taux de réponse" value="— %" hint="Aucune candidature envoyée" />
        <Kpi label="Taux d'entretien" value="— %" hint="Aucun entretien pour l'instant" />
      </section>

      <section aria-labelledby="distribution-title" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="distribution-title" className="font-heading font-bold">
            Répartition par statut
          </h2>
          <p className="text-xs text-muted-foreground">
            Les compteurs se rempliront avec tes candidatures
          </p>
        </div>
        <div aria-hidden className="flex h-2 overflow-hidden rounded-full bg-muted">
          {total > 0 &&
            APPLICATION_STATUSES.map((status) => (
              <span
                key={status}
                className={STATUS_DOT[status]}
                style={{ width: `${(COUNTS[status] / total) * 100}%` }}
              />
            ))}
        </div>
        <ul className="grid grid-cols-2 overflow-hidden rounded-lg border bg-card sm:grid-cols-3 lg:grid-cols-6">
          {APPLICATION_STATUSES.map((status) => (
            <li key={status} className="flex flex-col gap-1 border-r border-b p-4 last:border-r-0">
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span aria-hidden className={cn("size-2 rounded-sm", STATUS_DOT[status])} />
                {STATUS_LABELS[status]}
              </span>
              <span className="font-heading text-2xl font-extrabold">
                {COUNTS[status]}
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
          <EmptyState>
            Aucune candidature pour l&apos;instant. Utilise « Nouvelle
            candidature » en haut à droite.
          </EmptyState>
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
    <section className="flex flex-col gap-3">
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
