import Link from "next/link";

import { RowLink } from "@/components/row-link";
import { cn } from "@/lib/utils";
import type {
  ApplicationSource,
  ApplicationStatus,
  ContractType,
} from "@/modules/applications/domain/application";
import { StatusBadge } from "@/modules/applications/components/status-badge";
import { CONTRACT_TYPE_LABELS, SOURCE_LABELS } from "@/modules/applications/labels";

export type ApplicationRow = {
  id: string;
  companyName: string;
  jobTitle: string;
  location: string | null;
  contractType: ContractType | null;
  source: ApplicationSource | null;
  appliedAt: Date | null;
  status: ApplicationStatus;
};

// Sur téléphone, seules l'Entreprise, le poste et le statut restent : le détail est à un toucher.
const SECONDARY = "hidden md:table-cell";
const COLUMNS = [
  { label: "Entreprise" },
  { label: "Poste" },
  { label: "Localisation", className: SECONDARY },
  { label: "Contrat", className: SECONDARY },
  { label: "Source", className: SECONDARY },
  { label: "Candidature", className: SECONDARY },
  { label: "Statut" },
];
const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });

export function ApplicationsTable({
  applications,
  filtered = false,
}: {
  applications: ApplicationRow[];
  /** Des filtres sont actifs : une liste vide veut dire « rien ne correspond », pas « aucune candidature ». */
  filtered?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            {COLUMNS.map((column) => (
              <th
                key={column.label}
                scope="col"
                className={cn(
                  "px-4 py-2 text-left text-[11px] font-bold tracking-wider text-foreground/60 uppercase",
                  column.className,
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applications.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="px-4 py-16 text-center">
                {filtered ? (
                  <>
                    <p className="font-heading font-bold">Aucune candidature ne correspond.</p>
                    <Link
                      href="/applications"
                      className="mt-1 inline-block text-primary underline-offset-4 hover:underline"
                    >
                      Réinitialiser les filtres
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="font-heading font-bold">Aucune candidature pour l&apos;instant</p>
                    <p className="mt-1 text-muted-foreground">
                      Clique sur « Nouvelle candidature » en haut à droite pour enregistrer une
                      candidature envoyée.
                    </p>
                  </>
                )}
              </td>
            </tr>
          ) : (
            applications.map((application) => (
              <tr key={application.id} className="relative border-t align-top hover:bg-muted/60">
                <th scope="row" className="px-4 py-3 text-left font-semibold">
                  <RowLink href={`/applications/${application.id}`}>{application.companyName}</RowLink>
                </th>
                <td className="px-4 py-3">{application.jobTitle}</td>
                <td className={cn("px-4 py-3", SECONDARY)}>{application.location ?? "—"}</td>
                <td className={cn("px-4 py-3", SECONDARY)}>
                  {application.contractType ? CONTRACT_TYPE_LABELS[application.contractType] : "—"}
                </td>
                <td className={cn("px-4 py-3", SECONDARY)}>
                  {application.source ? SOURCE_LABELS[application.source] : "—"}
                </td>
                <td className={cn("px-4 py-3 text-muted-foreground", SECONDARY)}>
                  {application.appliedAt ? dateFormat.format(application.appliedAt) : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={application.status} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
