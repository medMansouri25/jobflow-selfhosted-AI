import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Mes candidatures · JobFlow AI",
};

export default function ApplicationsPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Mes candidatures
          </h1>
          <p className="text-muted-foreground">
            Candidatures actives : Brouillon, Postulée, Entretien.
          </p>
        </div>
        <Button asChild>
          <Link href="/applications/new">Nouvelle candidature</Link>
        </Button>
      </div>

      {/* TODO(T1.9) : liste, recherche, filtres et tri une fois la base de données branchée. */}
      <section className="flex flex-col items-center gap-4 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
        <div
          aria-hidden
          className="flex size-12 items-center justify-center rounded-full bg-accent text-xl text-accent-foreground"
        >
          ✦
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Aucune candidature pour l&apos;instant</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Commence par enregistrer une Annonce repérée ou une candidature déjà
            envoyée.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/applications/new">Créer ma première candidature</Link>
        </Button>
      </section>
    </main>
  );
}
