import type { Metadata } from "next";

import { getCurrentUserId } from "@/lib/current-user";
import { InterviewList } from "@/modules/applications/components/interview-list";
import { listInterviews } from "@/modules/applications/interview-lists";

export const metadata: Metadata = {
  title: "Entretiens · JobFlow AI",
};

// L'instant présent sépare « à venir » et « passés » : lu à chaque requête.
export const dynamic = "force-dynamic";

/** Tous les Entretiens : à venir, puis passés (FR-003-07). */
export default async function InterviewsPage() {
  const { upcoming, past } = await listInterviews(await getCurrentUserId(), new Date());

  return (
    <main className="flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">Entretiens</h1>
      <section aria-label="À venir" className="flex flex-col gap-3">
        <h2 className="font-heading font-bold">À venir ({upcoming.length})</h2>
        <div className="rounded-lg border bg-card">
          <InterviewList
            interviews={upcoming}
            empty="Aucun entretien prévu. Ajoute-en un depuis la fiche d'une candidature."
          />
        </div>
      </section>
      <section aria-label="Passés" className="flex flex-col gap-3">
        <h2 className="font-heading font-bold">Passés ({past.length})</h2>
        <div className="rounded-lg border bg-card">
          <InterviewList interviews={past} empty="Aucun entretien passé." />
        </div>
      </section>
    </main>
  );
}
