import { RowLink } from "@/components/row-link";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUSES } from "@/modules/applications/domain/application";
import { STATUS_DOT_CLASSES } from "@/modules/applications/components/status-badge";
import { STATUS_LABELS } from "@/modules/applications/labels";
import type { CompanyOverview } from "@/modules/companies/overview";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Paris",
});

/** Liste des Entreprises : nombre de Candidatures, répartition par statut, dernière activité. */
export function CompaniesList({ companies }: { companies: CompanyOverview[] }) {
  if (companies.length === 0) {
    return (
      <p className="rounded-lg border bg-card px-5 py-16 text-center text-sm text-muted-foreground">
        Aucune entreprise pour l&apos;instant : elles apparaissent avec ta première candidature.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            {["Entreprise", "Candidatures", "Statuts", "Dernière activité"].map((column, i) => (
              <th
                key={column}
                scope="col"
                className={cn(
                  "px-4 py-2 text-left text-[11px] font-bold tracking-wider text-foreground/60 uppercase",
                  i >= 2 && "hidden sm:table-cell",
                )}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id} className="relative border-t hover:bg-muted/60">
              <th scope="row" className="px-4 py-3 text-left font-semibold">
                <RowLink href={`/companies/${company.id}`}>{company.name}</RowLink>
              </th>
              <td className="px-4 py-3">{company.total}</td>
              <td className="hidden px-4 py-3 sm:table-cell">
                <span className="flex flex-wrap gap-x-3 gap-y-1">
                  {APPLICATION_STATUSES.filter((status) => company.counts[status] > 0).map((status) => (
                    <span key={status} className="flex items-center gap-1.5 text-xs">
                      <span aria-hidden className={cn("size-2 rounded-sm", STATUS_DOT_CLASSES[status])} />
                      {company.counts[status]} {STATUS_LABELS[status]}
                    </span>
                  ))}
                </span>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                {company.lastActivity ? dateFormat.format(company.lastActivity) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
