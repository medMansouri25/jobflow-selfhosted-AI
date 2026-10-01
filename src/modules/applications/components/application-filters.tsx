import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  APPLICATION_SOURCES,
  APPLICATION_STATUSES,
  CONTRACT_TYPES,
} from "@/modules/applications/domain/application";
import {
  CONTRACT_TYPE_LABELS,
  LIST_SORT_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
} from "@/modules/applications/labels";
import {
  DEFAULT_LIST_SORT,
  LIST_SORTS,
  type ListApplicationsInput,
} from "@/modules/applications/schemas";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Barre de filtres de la liste (FR-001-09 à 11) : un formulaire GET vers `/applications`, qui marche
 * sans JavaScript ; chaque envoi repart de la page 1 (le paramètre `page` n'est pas renvoyé).
 */
export function ApplicationFilters({ filters }: { filters: ListApplicationsInput }) {
  return (
    <form
      method="get"
      action="/applications"
      role="search"
      aria-label="Filtrer les candidatures"
      className="flex flex-col gap-4 rounded-lg border bg-card p-4"
    >
      <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground/80">
        Rechercher (entreprise, poste, localisation)
        <Input name="q" defaultValue={filters.q} placeholder="Rechercher entreprise ou poste…" />
      </label>

      {/* Sur téléphone, les filtres détaillés se déplient (case sans `name` : jamais envoyée) ;
          ils restent dépliés quand l'un d'eux est actif. Toujours visibles sur grand écran. */}
      <label className="peer flex items-center gap-2 text-sm font-medium text-primary sm:hidden">
        <input
          type="checkbox"
          defaultChecked={hasDetailedFilters(filters)}
          className="size-4"
        />
        Plus de filtres et tri
      </label>
      <div className="hidden gap-4 peer-has-[:checked]:grid sm:grid sm:grid-cols-4">
        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-xs font-medium text-foreground/80">Statut</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 text-sm">
            {APPLICATION_STATUSES.map((status) => (
              <label key={status} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="statut"
                  value={status}
                  defaultChecked={filters.statuses.includes(status)}
                  className="size-4"
                />
                {STATUS_LABELS[status]}
              </label>
            ))}
          </div>
        </fieldset>
        <FilterSelect label="Contrat" name="contrat" value={filters.contractType}>
          <option value="">Tous</option>
          {CONTRACT_TYPES.map((type) => (
            <option key={type} value={type}>
              {CONTRACT_TYPE_LABELS[type]}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Source" name="source" value={filters.source}>
          <option value="">Toutes</option>
          {APPLICATION_SOURCES.map((source) => (
            <option key={source} value={source}>
              {SOURCE_LABELS[source]}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Trier par" name="tri" value={filters.sort}>
          {LIST_SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {LIST_SORT_LABELS[sort]}
            </option>
          ))}
        </FilterSelect>
      </div>

      <div className="flex justify-end gap-2">
        <Button asChild variant="ghost">
          <Link href="/applications">Réinitialiser</Link>
        </Button>
        <Button type="submit">Filtrer</Button>
      </div>
    </form>
  );
}

function hasDetailedFilters(filters: ListApplicationsInput): boolean {
  return filters.statuses.length > 0 || Boolean(filters.contractType || filters.source) || filters.sort !== DEFAULT_LIST_SORT;
}

function FilterSelect({
  label,
  name,
  value,
  children,
}: {
  label: string;
  name: string;
  value?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground/80">
      {label}
      <select name={name} defaultValue={value ?? ""} className={selectClass}>
        {children}
      </select>
    </label>
  );
}
