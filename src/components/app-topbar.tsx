"use client";

import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { MobileNav } from "@/components/mobile-nav";
import { Input } from "@/components/ui/input";
import { NewApplicationDialog } from "@/modules/applications/components/new-application-dialog";
import type { FormAction } from "@/modules/applications/form-state";


function sectionOf(pathname: string) {
  return pathname.startsWith("/applications") ? "Candidatures" : "Dashboard";
}

const subscribeNever = () => () => {};
const todayLabel = () =>
  new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export function AppTopbar({
  createApplicationAction,
  companyNames,
}: {
  createApplicationAction: FormAction;
  /** Suggestions du champ Entreprise de la fenêtre « Nouvelle candidature » (FR-001-04). */
  companyNames: string[];
}) {
  const pathname = usePathname();
  // Date lue dans le navigateur (fuseau et horloge de l'utilisateur), jamais figée dans le HTML du serveur.
  const today = useSyncExternalStore(subscribeNever, todayLabel, () => "");

  return (
    // Sur téléphone : bouton « Menu », section et bouton d'ajout sur une ligne, recherche pleine largeur dessous.
    <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-b bg-card/90 px-4 py-3 backdrop-blur sm:flex-nowrap sm:px-8 lg:h-16 lg:py-0">
      <MobileNav />
      <p className="flex items-baseline gap-3 text-sm">
        <span className="font-semibold tracking-wider text-accent-foreground uppercase">
          {sectionOf(pathname)}
        </span>
        <span className="hidden text-muted-foreground md:inline">{today}</span>
      </p>
      <form
        action="/applications"
        role="search"
        className="order-last w-full sm:order-none sm:ml-auto sm:max-w-xs"
      >
        <label className="relative block">
          <span className="sr-only">Rechercher une entreprise ou un poste</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            name="q"
            placeholder="Rechercher entreprise ou poste…"
            className="bg-background pl-9"
          />
        </label>
      </form>
      <div className="ml-auto sm:ml-0">
        <NewApplicationDialog action={createApplicationAction} companySuggestions={companyNames} />
      </div>
    </header>
  );
}
