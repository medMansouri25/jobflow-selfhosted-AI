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

const COLUMNS = ["Entreprise", "Poste", "Localisation", "Contrat", "Source", "Candidature", "Statut"];
const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });

export function ApplicationsTable({ applications }: { applications: ApplicationRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            {COLUMNS.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-4 py-2 text-left text-[11px] font-bold tracking-wider text-foreground/60 uppercase"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applications.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="px-4 py-16 text-center">
                <p className="font-heading font-bold">Aucune candidature pour l&apos;instant</p>
                <p className="mt-1 text-muted-foreground">
                  Clique sur « Nouvelle candidature » en haut à droite pour enregistrer une
                  Annonce repérée ou une candidature déjà envoyée.
                </p>
              </td>
            </tr>
          ) : (
            applications.map((application) => (
              <tr key={application.id} className="border-t align-top">
                <th scope="row" className="px-4 py-3 text-left font-semibold">
                  {application.companyName}
                </th>
                <td className="px-4 py-3">{application.jobTitle}</td>
                <td className="px-4 py-3">{application.location ?? "—"}</td>
                <td className="px-4 py-3">
                  {application.contractType ? CONTRACT_TYPE_LABELS[application.contractType] : "—"}
                </td>
                <td className="px-4 py-3">
                  {application.source ? SOURCE_LABELS[application.source] : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
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
