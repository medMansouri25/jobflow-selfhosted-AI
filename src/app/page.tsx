import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/modules/applications/components/status-badge";

const LIFECYCLE = [
  { status: "DRAFT", text: "Je prépare ma candidature." },
  { status: "APPLIED", text: "Envoyée, j'attends une réponse." },
  { status: "INTERVIEW", text: "Invité à au moins un entretien." },
  { status: "ACCEPTED", text: "J'ai accepté la Proposition." },
  { status: "REJECTED", text: "L'entreprise ne m'a pas retenu." },
  { status: "ARCHIVED", text: "Terminée sans réponse, ou j'ai arrêté." },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16">
      <section className="flex flex-col items-start gap-6">
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          Suivi de recherche d&apos;emploi
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          JobFlow AI
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Chaque candidature, de l&apos;Annonce repérée à la réponse finale :
          l&apos;entreprise, le poste, la version du CV envoyée et tout
          l&apos;historique, au même endroit.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/applications/new">Nouvelle candidature</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/applications">Mes candidatures</Link>
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          Le cycle de vie d&apos;une candidature
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LIFECYCLE.map(({ status, text }) => (
            <li
              key={status}
              className="flex flex-col items-start gap-2 rounded-xl border bg-card p-4 shadow-xs"
            >
              <StatusBadge status={status} />
              <p className="text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
