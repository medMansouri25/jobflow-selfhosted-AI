import Link from "next/link";

import { Button } from "@/components/ui/button";
import { listHref } from "@/modules/applications/list-href";
import type { ListApplicationsInput } from "@/modules/applications/schemas";

/** « Page N sur M · X candidatures » et liens Précédent / Suivant qui gardent les filtres (FR-001-12). */
export function Pagination({
  filters,
  page,
  pages,
  total,
}: {
  filters: ListApplicationsInput;
  page: number;
  pages: number;
  total: number;
}) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">
        Page {page} sur {pages} · {total} candidatures
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Button asChild variant="outline">
            <Link href={listHref(filters, { page: page - 1 })}>Précédent</Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            Précédent
          </Button>
        )}
        {page < pages ? (
          <Button asChild variant="outline">
            <Link href={listHref(filters, { page: page + 1 })}>Suivant</Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            Suivant
          </Button>
        )}
      </div>
    </nav>
  );
}
