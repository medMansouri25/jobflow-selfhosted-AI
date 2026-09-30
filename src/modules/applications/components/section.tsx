import { useId, type ReactNode } from "react";

/** Carte titrée de la fiche d'une Candidature (région accessible nommée par son titre). */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 rounded-lg border bg-card p-5">
      <h2 id={id} className="font-heading font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}
