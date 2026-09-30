import type { ListApplicationsInput } from "@/modules/applications/schemas";

/**
 * Adresse de la liste pour ces filtres (inverse de `listApplicationsSchema`) : sert aux liens de
 * pagination. Les valeurs par défaut (tri par dernière modification, page 1) ne sont pas écrites.
 */
export function listHref(
  filters: ListApplicationsInput,
  overrides: Partial<Pick<ListApplicationsInput, "page">> = {},
): string {
  const { q, statuses, contractType, source, sort, page } = { ...filters, ...overrides };
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  for (const status of statuses) params.append("statut", status);
  if (contractType) params.set("contrat", contractType);
  if (source) params.set("source", source);
  if (sort !== "modifiee") params.set("tri", sort);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/applications?${query}` : "/applications";
}
