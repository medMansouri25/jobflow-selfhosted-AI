import { useId, type ReactNode } from "react";

/** Carte titrée de la fiche d'une Candidature (région accessible nommée par son titre). */
export function Section({
  title,
  action,
  children,
}: {
  title: string;
  /** Bouton à droite du titre (ex. « Ajouter un entretien »). */
  action?: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={id} className="font-heading font-bold">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
