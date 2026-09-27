"use client";

import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { Input } from "@/components/ui/input";
import { NewApplicationDialog } from "@/modules/applications/components/new-application-dialog";
import type { ApplicationFormState } from "@/modules/applications/form-state";

type FormAction = (
  state: ApplicationFormState,
  formData: FormData,
) => Promise<ApplicationFormState>;

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
}: {
  createApplicationAction: FormAction;
}) {
  const pathname = usePathname();
  // Les pages sont pré-rendues : la date est calculée dans le navigateur, pas au build.
  const today = useSyncExternalStore(subscribeNever, todayLabel, () => "");

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card/90 px-8 backdrop-blur">
      <p className="flex items-baseline gap-3 text-sm">
        <span className="font-semibold tracking-wider text-accent-foreground uppercase">
          {sectionOf(pathname)}
        </span>
        <span className="text-muted-foreground">{today}</span>
      </p>
      <form action="/applications" role="search" className="ml-auto w-full max-w-xs">
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
      <NewApplicationDialog action={createApplicationAction} />
    </header>
  );
}
