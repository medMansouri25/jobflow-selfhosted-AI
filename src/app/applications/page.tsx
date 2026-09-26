import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidatures · JobFlow AI",
};

const COLUMNS = ["Entreprise", "Poste", "Localisation", "Contrat", "Source", "Candidature", "Statut"];

export default function ApplicationsPage() {
  return (
    <main className="flex flex-col gap-6 px-8 py-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight">
          Candidatures
        </h1>
        <p className="text-sm text-muted-foreground">0 affichée(s) sur 0</p>
      </div>

      {/* TODO(T1.9) : filtres, tri et lignes du tableau une fois la base de données branchée. */}
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
            <tr>
              <td colSpan={COLUMNS.length} className="px-4 py-16 text-center">
                <p className="font-heading font-bold">Aucune candidature pour l&apos;instant</p>
                <p className="mt-1 text-muted-foreground">
                  Clique sur « Nouvelle candidature » en haut à droite pour enregistrer
                  une Annonce repérée ou une candidature déjà envoyée.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
