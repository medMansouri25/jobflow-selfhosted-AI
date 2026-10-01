import Link from "next/link";
import type { ReactNode } from "react";

import type { getApplication } from "@/modules/applications/service";
import { cn } from "@/lib/utils";
import { Section } from "@/modules/applications/components/section";
import { formatFileSize } from "@/modules/applications/format";
import {
  STATUS_DOT_CLASSES,
  StatusBadge,
} from "@/modules/applications/components/status-badge";
import {
  ATTACHMENT_KIND_LABELS,
  CONTRACT_TYPE_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
} from "@/modules/applications/labels";

export type ApplicationDetailData = Awaited<ReturnType<typeof getApplication>>;

const dayFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// Instant d'un changement de statut, à l'heure de Paris : « 27 sept. 2026 · 16:21 ».
const changeDayFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Paris",
});
const changeTimeFormat = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

const PER_PERIOD = { YEARLY: "/ an", MONTHLY: "/ mois" } as const;

/** « 42 000 – 48 000 € / an », « À partir de 42 000 € / an », « Jusqu'à 48 000 € / an ». */
function formatSalary({
  salaryMin: min,
  salaryMax: max,
  salaryCurrency,
  salaryPeriod,
}: ApplicationDetailData): string | null {
  if (min === null && max === null) return null;
  const money = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: salaryCurrency ?? "EUR",
    maximumFractionDigits: 0,
  });
  const number = new Intl.NumberFormat("fr-FR");
  const amount =
    min !== null && max !== null
      ? `${number.format(min)} – ${money.format(max)}`
      : min !== null
        ? `À partir de ${money.format(min)}`
        : `Jusqu'à ${money.format(max!)}`;
  return salaryPeriod ? `${amount} ${PER_PERIOD[salaryPeriod]}` : amount;
}

/** Fiche d'une Candidature (SPEC-001 §8) — en lecture seule. */
export function ApplicationDetail({
  application,
  actions,
  statusPanel,
  interviews,
  jobAnalysis,
  coverLetter,
}: {
  application: ApplicationDetailData;
  /** Boutons de la fiche (ex. « Modifier »), fournis par la page. */
  actions?: ReactNode;
  /** Bloc « Statut » (transitions), fourni par la page. */
  statusPanel?: ReactNode;
  /** Bloc « Entretiens » (SPEC-003), fourni par la page. */
  interviews?: ReactNode;
  /** Bloc « Analyse de l'annonce » (SPEC-007), fourni par la page. */
  jobAnalysis?: ReactNode;
  /** Bloc « Lettre de motivation » (SPEC-008), fourni par la page. */
  coverLetter?: ReactNode;
}) {
  const meta = [
    application.location,
    application.contractType && CONTRACT_TYPE_LABELS[application.contractType],
    application.appliedAt && `Postulée le ${dayFormat.format(application.appliedAt)}`,
  ].filter(Boolean);

  return (
    <main className="flex flex-col gap-8 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-2">
        <Link href="/applications" className="text-sm text-muted-foreground hover:text-foreground">
          ← Candidatures
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            {application.jobTitle}
          </h1>
          <StatusBadge status={application.status} />
          {actions && <div className="ml-auto flex gap-2">{actions}</div>}
        </div>
        <p className="text-muted-foreground">
          <Link
            href={`/companies/${application.company.id}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {application.company.name}
          </Link>
          {meta.map((item) => ` · ${item}`)}
        </p>
      </div>

      {statusPanel}

      {interviews}

      {jobAnalysis}

      {coverLetter}

      <Section title="Annonce">
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
          <Field label="Source">{application.source && SOURCE_LABELS[application.source]}</Field>
          <Field label="Salaire">{formatSalary(application)}</Field>
          <Field label="Lien">
            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-primary underline-offset-4 hover:underline"
              >
                {application.jobUrl}
              </a>
            )}
          </Field>
        </dl>
        {application.jobDescription && (
          // Texte brut : React échappe le contenu, les retours à la ligne sont conservés (AC-001-19).
          <p className="whitespace-pre-wrap text-sm">{application.jobDescription}</p>
        )}
      </Section>

      {application.notes && (
        <Section title="Notes personnelles">
          <p className="whitespace-pre-wrap text-sm">{application.notes}</p>
        </Section>
      )}

      {application.attachments.length > 0 && (
        <Section title="Pièces jointes">
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
            {application.attachments.map((attachment) => (
              <Field key={attachment.id} label={ATTACHMENT_KIND_LABELS[attachment.kind]}>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-primary underline-offset-4 hover:underline"
                >
                  {attachment.name}
                </a>{" "}
                <span className="text-muted-foreground">({formatFileSize(attachment.size)})</span>
              </Field>
            ))}
          </dl>
        </Section>
      )}

      <Section title="Historique des statuts">
        <ol className="flex flex-col">
          {application.statusChanges.map((change) => (
            <li key={change.id} className="grid grid-cols-[6.5rem_0.75rem_1fr] gap-3 pb-4 last:pb-0 sm:grid-cols-[9rem_0.75rem_1fr]">
              <span className="text-xs text-muted-foreground">
                {changeDayFormat.format(change.changedAt)} · {changeTimeFormat.format(change.changedAt)}
              </span>
              <span
                aria-hidden
                className={cn("mt-1 size-2.5 rounded-full", STATUS_DOT_CLASSES[change.toStatus])}
              />
              <span className="flex flex-col">
                <span className="text-sm font-semibold">{STATUS_LABELS[change.toStatus]}</span>
                <span className="text-xs text-muted-foreground">
                  {change.fromStatus
                    ? `depuis ${STATUS_LABELS[change.fromStatus]}`
                    : "Candidature créée"}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </Section>
    </main>
  );
}

/** Un champ de la fiche : « — » quand il n'est pas renseigné. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children || "—"}</dd>
    </>
  );
}

